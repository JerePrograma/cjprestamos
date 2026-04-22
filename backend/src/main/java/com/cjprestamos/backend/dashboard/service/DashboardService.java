package com.cjprestamos.backend.dashboard.service;

import com.cjprestamos.backend.common.model.MonedaUtils;
import com.cjprestamos.backend.cuota.model.Cuota;
import com.cjprestamos.backend.cuota.repository.CuotaRepository;
import com.cjprestamos.backend.dashboard.dto.DashboardControlCajaResponse;
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
import java.time.LocalDate;
import java.time.YearMonth;
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

    public DashboardControlCajaResponse obtenerControlCaja() {
        List<Prestamo> prestamosActivos = prestamoRepository.findByEstadoOrderByCreatedAtDesc(EstadoPrestamo.ACTIVO);
        if (prestamosActivos.isEmpty()) {
            return new DashboardControlCajaResponse(
                cero(), cero(), cero(), cero(), cero(), cero(),
                cero(), cero(), cero(),
                cero(), cero(), cero(),
                cero(), 0L, 0L, cero(), cero()
            );
        }

        List<Long> prestamosIds = prestamosActivos.stream().map(Prestamo::getId).toList();
        List<Cuota> cuotas = cuotaRepository.findByPrestamoIdIn(prestamosIds);
        Map<Long, BigDecimal> cobradoPorPrestamo = pagoRepository.findByPrestamoIdInAndEstado(prestamosIds, EstadoPago.REGISTRADO).stream()
            .collect(Collectors.groupingBy(
                pago -> pago.getPrestamo().getId(),
                Collectors.mapping(Pago::getMonto, Collectors.reducing(cero(), this::sumar))
            ));

        BigDecimal inversionActiva = cero();
        BigDecimal capitalRecuperado = cero();
        BigDecimal gananciaRealizada = cero();
        BigDecimal gananciaProyectada = cero();

        for (Prestamo prestamo : prestamosActivos) {
            BigDecimal montoInicial = escalar(prestamo.getMontoInicial());
            inversionActiva = sumar(inversionActiva, montoInicial);

            CalculoPrestamoResultado calculo = calculadoraPrestamoService.calcular(new CalculoPrestamoEntrada(
                prestamo.getMontoInicial(),
                prestamo.getPorcentajeFijoSugerido(),
                prestamo.getInteresManualOpcional(),
                prestamo.getCantidadCuotas()
            ));

            BigDecimal totalADevolver = escalar(calculo.totalADevolver());
            BigDecimal totalCobrado = escalar(cobradoPorPrestamo.getOrDefault(prestamo.getId(), cero()));
            BigDecimal interesTotal = restar(totalADevolver, montoInicial);

            BigDecimal capitalRecuperadoPrestamo = min(totalCobrado, montoInicial);
            capitalRecuperado = sumar(capitalRecuperado, capitalRecuperadoPrestamo);

            BigDecimal gananciaRealizadaPrestamo = min(max(restar(totalCobrado, montoInicial), cero()), interesTotal);
            gananciaRealizada = sumar(gananciaRealizada, gananciaRealizadaPrestamo);
            gananciaProyectada = sumar(gananciaProyectada, restar(interesTotal, gananciaRealizadaPrestamo));
        }

        BigDecimal capitalPendiente = max(restar(inversionActiva, capitalRecuperado), cero());
        BigDecimal cajaDisponible = sumar(capitalRecuperado, gananciaRealizada);

        List<Pago> pagosActivos = pagoRepository.findByPrestamoIdInAndEstado(prestamosIds, EstadoPago.REGISTRADO);
        BigDecimal ingresosMesActual = calcularIngresosMesActual(pagosActivos);
        BigDecimal egresosMesActual = calcularEgresosMesActual(prestamosActivos);
        BigDecimal balanceMesActual = restar(ingresosMesActual, egresosMesActual);

        LocalDate hoy = LocalDate.now();
        BigDecimal proyeccionCobro30Dias = cero();
        BigDecimal proyeccionCobro60Dias = cero();
        BigDecimal proyeccionCobro90Dias = cero();
        BigDecimal carteraEnMora = cero();
        long cuotasPendientes = 0L;
        long cuotasVencenProximos7Dias = 0L;

        for (Cuota cuota : cuotas) {
            BigDecimal saldoCuota = max(restar(cuota.getMontoProgramado(), valorSeguro(cuota.getMontoPagado())), cero());
            if (saldoCuota.compareTo(cero()) == 0) {
                continue;
            }

            cuotasPendientes++;
            LocalDate fechaVencimiento = cuota.getFechaVencimiento();
            if (fechaVencimiento == null) {
                continue;
            }

            if (fechaVencimiento.isBefore(hoy)) {
                carteraEnMora = sumar(carteraEnMora, saldoCuota);
            }

            if (!fechaVencimiento.isBefore(hoy) && !fechaVencimiento.isAfter(hoy.plusDays(7))) {
                cuotasVencenProximos7Dias++;
            }

            if (!fechaVencimiento.isBefore(hoy) && !fechaVencimiento.isAfter(hoy.plusDays(30))) {
                proyeccionCobro30Dias = sumar(proyeccionCobro30Dias, saldoCuota);
            }

            if (!fechaVencimiento.isBefore(hoy) && !fechaVencimiento.isAfter(hoy.plusDays(60))) {
                proyeccionCobro60Dias = sumar(proyeccionCobro60Dias, saldoCuota);
            }

            if (!fechaVencimiento.isBefore(hoy) && !fechaVencimiento.isAfter(hoy.plusDays(90))) {
                proyeccionCobro90Dias = sumar(proyeccionCobro90Dias, saldoCuota);
            }
        }

        BigDecimal recuperoCapitalPorcentaje = porcentaje(capitalRecuperado, inversionActiva);
        BigDecimal rendimientoEsperadoPorcentaje = porcentaje(gananciaProyectada, inversionActiva);

        return new DashboardControlCajaResponse(
            escalar(cajaDisponible),
            escalar(inversionActiva),
            escalar(capitalRecuperado),
            escalar(capitalPendiente),
            escalar(gananciaRealizada),
            escalar(gananciaProyectada),
            escalar(ingresosMesActual),
            escalar(egresosMesActual),
            escalar(balanceMesActual),
            escalar(proyeccionCobro30Dias),
            escalar(proyeccionCobro60Dias),
            escalar(proyeccionCobro90Dias),
            escalar(carteraEnMora),
            cuotasPendientes,
            cuotasVencenProximos7Dias,
            recuperoCapitalPorcentaje,
            rendimientoEsperadoPorcentaje
        );
    }

    private BigDecimal calcularIngresosMesActual(List<Pago> pagosRegistrados) {
        YearMonth mesActual = YearMonth.now();
        return pagosRegistrados.stream()
            .filter(pago -> YearMonth.from(pago.getFechaPago()).equals(mesActual))
            .map(Pago::getMonto)
            .reduce(cero(), this::sumar);
    }

    private BigDecimal calcularEgresosMesActual(List<Prestamo> prestamosActivos) {
        YearMonth mesActual = YearMonth.now();
        return prestamosActivos.stream()
            .filter(prestamo -> prestamo.getCreatedAt() != null)
            .filter(prestamo -> YearMonth.from(prestamo.getCreatedAt()).equals(mesActual))
            .map(Prestamo::getMontoInicial)
            .reduce(cero(), this::sumar);
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

    private BigDecimal porcentaje(BigDecimal numerador, BigDecimal denominador) {
        if (denominador.compareTo(cero()) <= 0) {
            return cero();
        }

        return escalar(numerador.multiply(new BigDecimal("100")).divide(denominador, 2, java.math.RoundingMode.HALF_UP));
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
