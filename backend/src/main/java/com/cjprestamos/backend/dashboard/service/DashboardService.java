package com.cjprestamos.backend.dashboard.service;

import com.cjprestamos.backend.common.model.MonedaUtils;
import com.cjprestamos.backend.cuota.model.Cuota;
import com.cjprestamos.backend.cuota.repository.CuotaRepository;
import com.cjprestamos.backend.dashboard.dto.DashboardResumenResponse;
import com.cjprestamos.backend.pago.model.Pago;
import com.cjprestamos.backend.pago.model.enums.EstadoPago;
import com.cjprestamos.backend.pago.repository.PagoRepository;
import com.cjprestamos.backend.prestamo.dto.CalculoPrestamoEntrada;
import com.cjprestamos.backend.prestamo.dto.CalculoPrestamoResultado;
import com.cjprestamos.backend.prestamo.model.Prestamo;
import com.cjprestamos.backend.prestamo.model.enums.EstadoPrestamo;
import com.cjprestamos.backend.prestamo.repository.PrestamoRepository;
import com.cjprestamos.backend.prestamo.service.CalculadoraPrestamoService;
import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final PrestamoRepository prestamoRepository;
    private final CuotaRepository cuotaRepository;
    private final PagoRepository pagoRepository;
    private final CalculadoraPrestamoService calculadoraPrestamoService;

    public DashboardService(
        PrestamoRepository prestamoRepository,
        CuotaRepository cuotaRepository,
        PagoRepository pagoRepository,
        CalculadoraPrestamoService calculadoraPrestamoService
    ) {
        this.prestamoRepository = prestamoRepository;
        this.cuotaRepository = cuotaRepository;
        this.pagoRepository = pagoRepository;
        this.calculadoraPrestamoService = calculadoraPrestamoService;
    }

    public DashboardResumenResponse obtenerResumen() {
        List<Prestamo> prestamosActivos = prestamoRepository.findByEstadoOrderByCreatedAtDesc(EstadoPrestamo.ACTIVO);
        if (prestamosActivos.isEmpty()) {
            return new DashboardResumenResponse(cero(), cero(), cero(), cero(), 0L);
        }

        List<Long> prestamosIds = prestamosActivos.stream().map(Prestamo::getId).toList();
        Map<Long, List<Cuota>> cuotasPorPrestamo = cuotaRepository.findByPrestamoIdIn(prestamosIds).stream()
            .collect(Collectors.groupingBy(cuota -> cuota.getPrestamo().getId()));
        Map<Long, BigDecimal> cobradoPorPrestamo = pagoRepository.findByPrestamoIdInAndEstado(prestamosIds, EstadoPago.REGISTRADO).stream()
            .collect(Collectors.groupingBy(
                pago -> pago.getPrestamo().getId(),
                Collectors.mapping(Pago::getMonto, Collectors.reducing(cero(), this::sumar))
            ));

        BigDecimal montoInvertido = cero();
        BigDecimal montoGanado = cero();
        BigDecimal montoPorGanar = cero();
        BigDecimal deudaTotal = cero();

        for (Prestamo prestamo : prestamosActivos) {
            BigDecimal montoInicial = escalar(prestamo.getMontoInicial());
            montoInvertido = sumar(montoInvertido, montoInicial);

            CalculoPrestamoResultado calculo = calculadoraPrestamoService.calcular(new CalculoPrestamoEntrada(
                prestamo.getMontoInicial(),
                prestamo.getPorcentajeFijoSugerido(),
                prestamo.getInteresManualOpcional(),
                prestamo.getCantidadCuotas()
            ));

            BigDecimal totalADevolver = escalar(calculo.totalADevolver());
            BigDecimal totalCobrado = escalar(cobradoPorPrestamo.getOrDefault(prestamo.getId(), cero()));

            BigDecimal interesTotal = restar(totalADevolver, montoInicial);
            BigDecimal ganadoPrestamo = min(max(restar(totalCobrado, montoInicial), cero()), interesTotal);
            BigDecimal porGanarPrestamo = restar(interesTotal, ganadoPrestamo);

            montoGanado = sumar(montoGanado, ganadoPrestamo);
            montoPorGanar = sumar(montoPorGanar, porGanarPrestamo);
            deudaTotal = sumar(deudaTotal, calcularDeudaPrestamo(prestamo, cuotasPorPrestamo, totalADevolver, totalCobrado));
        }

        return new DashboardResumenResponse(
            escalar(montoInvertido),
            escalar(montoGanado),
            escalar(montoPorGanar),
            escalar(deudaTotal),
            prestamosActivos.size()
        );
    }

    private BigDecimal calcularDeudaPrestamo(
        Prestamo prestamo,
        Map<Long, List<Cuota>> cuotasPorPrestamo,
        BigDecimal totalADevolver,
        BigDecimal totalCobrado
    ) {
        List<Cuota> cuotas = cuotasPorPrestamo.getOrDefault(prestamo.getId(), Collections.emptyList());
        if (!cuotas.isEmpty()) {
            return cuotas.stream()
                .map(cuota -> max(restar(cuota.getMontoProgramado(), valorSeguro(cuota.getMontoPagado())), cero()))
                .reduce(cero(), this::sumar);
        }

        return max(restar(totalADevolver, totalCobrado), cero());
    }

    private BigDecimal valorSeguro(BigDecimal monto) {
        return monto == null ? cero() : escalar(monto);
    }

    private BigDecimal sumar(BigDecimal a, BigDecimal b) {
        return escalar(a.add(b));
    }

    private BigDecimal restar(BigDecimal a, BigDecimal b) {
        return escalar(a.subtract(b));
    }

    private BigDecimal max(BigDecimal a, BigDecimal b) {
        return escalar(a.max(b));
    }

    private BigDecimal min(BigDecimal a, BigDecimal b) {
        return escalar(a.min(b));
    }

    private BigDecimal cero() {
        return MonedaUtils.cero();
    }

    private BigDecimal escalar(BigDecimal valor) {
        return MonedaUtils.normalizar(valor);
    }
}
