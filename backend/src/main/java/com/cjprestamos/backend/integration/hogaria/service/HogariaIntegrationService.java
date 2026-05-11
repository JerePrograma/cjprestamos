package com.cjprestamos.backend.integration.hogaria.service;

import com.cjprestamos.backend.common.model.MonedaUtils;
import com.cjprestamos.backend.cuota.dto.CuotaResponse;
import com.cjprestamos.backend.cuota.service.CuotaService;
import com.cjprestamos.backend.dashboard.dto.DashboardControlCajaResponse;
import com.cjprestamos.backend.dashboard.dto.DashboardResumenResponse;
import com.cjprestamos.backend.dashboard.service.DashboardService;
import com.cjprestamos.backend.integration.hogaria.dto.HogariaCashControlResponse;
import com.cjprestamos.backend.integration.hogaria.dto.HogariaDashboardResponse;
import com.cjprestamos.backend.integration.hogaria.dto.HogariaInstallmentResponse;
import com.cjprestamos.backend.integration.hogaria.dto.HogariaLoanActiveResponse;
import com.cjprestamos.backend.integration.hogaria.dto.HogariaPaymentResponse;
import com.cjprestamos.backend.pago.dto.PagoResponse;
import com.cjprestamos.backend.pago.model.Pago;
import com.cjprestamos.backend.pago.model.enums.EstadoPago;
import com.cjprestamos.backend.pago.repository.PagoRepository;
import com.cjprestamos.backend.pago.service.PagoService;
import com.cjprestamos.backend.prestamo.dto.CalculoPrestamoEntrada;
import com.cjprestamos.backend.prestamo.dto.CalculoPrestamoResultado;
import com.cjprestamos.backend.prestamo.model.Prestamo;
import com.cjprestamos.backend.prestamo.model.enums.EstadoPrestamo;
import com.cjprestamos.backend.prestamo.repository.PrestamoRepository;
import com.cjprestamos.backend.prestamo.service.CalculadoraPrestamoService;
import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class HogariaIntegrationService {

    private final PrestamoRepository prestamoRepository;
    private final PagoRepository pagoRepository;
    private final CalculadoraPrestamoService calculadoraPrestamoService;
    private final DashboardService dashboardService;
    private final CuotaService cuotaService;
    private final PagoService pagoService;

    public HogariaIntegrationService(
        PrestamoRepository prestamoRepository,
        PagoRepository pagoRepository,
        CalculadoraPrestamoService calculadoraPrestamoService,
        DashboardService dashboardService,
        CuotaService cuotaService,
        PagoService pagoService
    ) {
        this.prestamoRepository = prestamoRepository;
        this.pagoRepository = pagoRepository;
        this.calculadoraPrestamoService = calculadoraPrestamoService;
        this.dashboardService = dashboardService;
        this.cuotaService = cuotaService;
        this.pagoService = pagoService;
    }

    public List<HogariaLoanActiveResponse> listarPrestamosActivos() {
        List<Prestamo> activos = prestamoRepository.findByEstadoOrderByCreatedAtDesc(EstadoPrestamo.ACTIVO);
        if (activos.isEmpty()) {
            return List.of();
        }

        List<Long> ids = activos.stream().map(Prestamo::getId).toList();
        Map<Long, BigDecimal> cobradoPorPrestamo = pagoRepository.findByPrestamoIdInAndEstado(ids, EstadoPago.REGISTRADO).stream()
            .collect(Collectors.groupingBy(
                pago -> pago.getPrestamo().getId(),
                Collectors.mapping(Pago::getMonto, Collectors.reducing(MonedaUtils.cero(), BigDecimal::add))
            ));

        return activos.stream().map(prestamo -> {
            BigDecimal montoInicial = MonedaUtils.normalizar(prestamo.getMontoInicial());
            CalculoPrestamoResultado calculo = calculadoraPrestamoService.calcular(new CalculoPrestamoEntrada(
                prestamo.getMontoInicial(),
                prestamo.getPorcentajeFijoSugerido(),
                prestamo.getInteresManualOpcional(),
                prestamo.getCantidadCuotas()
            ));

            BigDecimal totalADevolver = MonedaUtils.normalizar(calculo.totalADevolver());
            BigDecimal totalCobrado = MonedaUtils.normalizar(cobradoPorPrestamo.getOrDefault(prestamo.getId(), MonedaUtils.cero()));
            BigDecimal totalPendiente = maxCero(totalADevolver.subtract(totalCobrado));
            BigDecimal interesTotal = maxCero(totalADevolver.subtract(montoInicial));
            BigDecimal gananciaRealizada = min(interesTotal, maxCero(totalCobrado.subtract(montoInicial)));
            BigDecimal gananciaProyectada = maxCero(interesTotal.subtract(gananciaRealizada));

            return new HogariaLoanActiveResponse(
                prestamo.getId(),
                prestamo.getPersona().getId(),
                prestamo.getPersona().getNombre(),
                montoInicial,
                prestamo.getCantidadCuotas(),
                prestamo.getFrecuenciaTipo(),
                prestamo.getEstado(),
                totalCobrado,
                totalPendiente,
                gananciaRealizada,
                gananciaProyectada,
                prestamo.getCreatedAt(),
                prestamo.getUpdatedAt()
            );
        }).toList();
    }

    public HogariaDashboardResponse obtenerDashboard() {
        DashboardResumenResponse dashboard = dashboardService.obtenerResumen();
        return new HogariaDashboardResponse(
            dashboard.montoInvertido(),
            dashboard.montoGanado(),
            dashboard.montoPorGanar(),
            dashboard.deudaTotal(),
            dashboard.prestamosActivos()
        );
    }

    public HogariaCashControlResponse obtenerControlCaja() {
        DashboardControlCajaResponse controlCaja = dashboardService.obtenerControlCaja();
        return new HogariaCashControlResponse(
            controlCaja.cajaDisponible(),
            controlCaja.inversionActiva(),
            controlCaja.capitalRecuperado(),
            controlCaja.capitalPendiente(),
            controlCaja.gananciaRealizada(),
            controlCaja.gananciaProyectada(),
            controlCaja.ingresosMesActual(),
            controlCaja.egresosMesActual(),
            controlCaja.balanceMesActual(),
            controlCaja.proyeccionCobro30Dias(),
            controlCaja.proyeccionCobro60Dias(),
            controlCaja.proyeccionCobro90Dias(),
            controlCaja.carteraEnMora(),
            controlCaja.cuotasPendientes(),
            controlCaja.cuotasVencenProximos7Dias(),
            controlCaja.recuperoCapitalPorcentaje(),
            controlCaja.rendimientoEsperadoPorcentaje()
        );
    }

    public List<HogariaInstallmentResponse> listarCuotasPorPrestamo(Long prestamoId) {
        return cuotaService.listarPorPrestamo(prestamoId).stream()
            .map(cuota -> new HogariaInstallmentResponse(
                cuota.id(),
                prestamoId,
                cuota.numeroCuota(),
                cuota.fechaVencimiento(),
                cuota.montoProgramado(),
                cuota.montoPagado(),
                maxCero(cuota.montoProgramado().subtract(valorSeguro(cuota.montoPagado()))),
                cuota.estado()
            ))
            .toList();
    }

    public List<HogariaPaymentResponse> listarPagosPorPrestamo(Long prestamoId) {
        List<PagoResponse> pagosOrdenados = pagoService.listarPorPrestamo(prestamoId).stream()
            .sorted(Comparator.comparing(PagoResponse::fechaPago).thenComparing(PagoResponse::id))
            .toList();

        if (pagosOrdenados.isEmpty()) {
            return List.of();
        }

        BigDecimal montoInicial = prestamoRepository.findById(prestamoId)
            .map(Prestamo::getMontoInicial)
            .map(MonedaUtils::normalizar)
            .orElse(MonedaUtils.cero());

        List<HogariaPaymentResponse> respuesta = new java.util.ArrayList<>();
        BigDecimal acumuladoCobrado = MonedaUtils.cero();

        for (PagoResponse pago : pagosOrdenados) {
            BigDecimal montoPago = MonedaUtils.normalizar(pago.monto());
            BigDecimal capitalPendientePrevio = maxCero(montoInicial.subtract(acumuladoCobrado));
            BigDecimal principalRecovered = min(montoPago, capitalPendientePrevio);
            BigDecimal interestCollected = maxCero(montoPago.subtract(principalRecovered));
            acumuladoCobrado = MonedaUtils.normalizar(acumuladoCobrado.add(montoPago));

            respuesta.add(new HogariaPaymentResponse(
                pago.id(),
                pago.prestamoId(),
                pago.fechaPago(),
                montoPago,
                principalRecovered,
                interestCollected,
                pago.referencia(),
                pago.observacion(),
                pago.estado()
            ));
        }

        return respuesta;
    }

    private BigDecimal valorSeguro(BigDecimal valor) {
        return valor == null ? MonedaUtils.cero() : MonedaUtils.normalizar(valor);
    }

    private BigDecimal maxCero(BigDecimal valor) {
        return MonedaUtils.normalizar(valor.max(MonedaUtils.cero()));
    }

    private BigDecimal min(BigDecimal a, BigDecimal b) {
        return MonedaUtils.normalizar(a.min(b));
    }
}
