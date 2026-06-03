package com.cjprestamos.backend.dashboard.service;

import com.cjprestamos.backend.common.model.MonedaUtils;
import com.cjprestamos.backend.common.time.FechaOperativaService;
import com.cjprestamos.backend.cuota.model.Cuota;
import com.cjprestamos.backend.cuota.repository.CuotaRepository;
import com.cjprestamos.backend.dashboard.dto.DashboardControlCajaResponse;
import com.cjprestamos.backend.dashboard.dto.DashboardResumenResponse;
import com.cjprestamos.backend.dashboard.dto.ProyeccionCobroPeriodoResponse;
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
    private final FechaOperativaService fechaOperativaService;

    public DashboardService(
            PrestamoRepository prestamoRepository,
            CuotaRepository cuotaRepository,
            PagoRepository pagoRepository,
            CalculadoraPrestamoService calculadoraPrestamoService,
            FechaOperativaService fechaOperativaService
    ) {
        this.prestamoRepository = prestamoRepository;
        this.cuotaRepository = cuotaRepository;
        this.pagoRepository = pagoRepository;
        this.calculadoraPrestamoService = calculadoraPrestamoService;
        this.fechaOperativaService = fechaOperativaService;
    }

    public DashboardResumenResponse obtenerResumen() {
        List<Prestamo> prestamosActivos = prestamoRepository.findByEstadoAndEliminadoFalseOrderByCreatedAtDesc(EstadoPrestamo.ACTIVO);

        if (prestamosActivos.isEmpty()) {
            return new DashboardResumenResponse(cero(), cero(), cero(), cero(), 0L);
        }

        List<Long> prestamosIds = prestamosActivos.stream()
                .map(Prestamo::getId)
                .toList();

        Map<Long, List<Cuota>> cuotasPorPrestamo = cuotaRepository.findByPrestamoIdIn(prestamosIds).stream()
                .collect(Collectors.groupingBy(cuota -> cuota.getPrestamo().getId()));

        List<Pago> pagosRegistrados = pagoRepository.findByPrestamoIdInAndEstado(prestamosIds, EstadoPago.REGISTRADO);

        Map<Long, BigDecimal> cobradoPorPrestamo = pagosRegistrados.stream()
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
        LocalDate hoy = fechaOperativaService.hoy();

        List<Prestamo> prestamosActivos = prestamoRepository.findByEstadoAndEliminadoFalseOrderByCreatedAtDesc(EstadoPrestamo.ACTIVO);

        if (prestamosActivos.isEmpty()) {
            return new DashboardControlCajaResponse(
                    cero(),
                    cero(),
                    cero(),
                    cero(),
                    cero(),
                    cero(),
                    cero(),
                    cero(),
                    cero(),
                    proyeccionesCobroVacias(hoy),
                    cero(),
                    0L,
                    0L,
                    cero(),
                    cero()
            );
        }

        List<Long> prestamosIds = prestamosActivos.stream()
                .map(Prestamo::getId)
                .toList();

        List<Cuota> cuotas = cuotaRepository.findByPrestamoIdIn(prestamosIds);
        List<Pago> pagosRegistrados = pagoRepository.findByPrestamoIdInAndEstado(prestamosIds, EstadoPago.REGISTRADO);

        Map<Long, BigDecimal> cobradoPorPrestamo = pagosRegistrados.stream()
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

        BigDecimal ingresosMesActual = calcularIngresosMesActual(pagosRegistrados);
        BigDecimal egresosMesActual = calcularEgresosMesActual(prestamosActivos);
        BigDecimal balanceMesActual = restar(ingresosMesActual, egresosMesActual);

        BigDecimal carteraEnMora = cero();
        long cuotasPendientes = 0L;
        long cuotasVencenProximos7Dias = 0L;

        for (Cuota cuota : cuotas) {
            BigDecimal saldoCuota = calcularSaldoCuota(cuota);

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
        }

        List<ProyeccionCobroPeriodoResponse> proyeccionesCobro = calcularProyeccionesCobroPorPeriodo(cuotas, hoy);

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
                proyeccionesCobro,
                escalar(carteraEnMora),
                cuotasPendientes,
                cuotasVencenProximos7Dias,
                recuperoCapitalPorcentaje,
                rendimientoEsperadoPorcentaje
        );
    }

    private List<ProyeccionCobroPeriodoResponse> calcularProyeccionesCobroPorPeriodo(
            List<Cuota> cuotas,
            LocalDate hoy
    ) {
        LocalDate hasta30 = hoy.plusDays(30);
        LocalDate desde31 = hoy.plusDays(31);
        LocalDate hasta60 = hoy.plusDays(60);
        LocalDate desde61 = hoy.plusDays(61);
        LocalDate hasta90 = hoy.plusDays(90);

        BigDecimal monto0a30 = cero();
        BigDecimal monto31a60 = cero();
        BigDecimal monto61a90 = cero();

        for (Cuota cuota : cuotas) {
            BigDecimal saldoCuota = calcularSaldoCuota(cuota);

            if (saldoCuota.compareTo(cero()) == 0) {
                continue;
            }

            LocalDate fechaVencimiento = cuota.getFechaVencimiento();

            if (fechaVencimiento == null || fechaVencimiento.isBefore(hoy)) {
                continue;
            }

            if (!fechaVencimiento.isAfter(hasta30)) {
                monto0a30 = sumar(monto0a30, saldoCuota);
            } else if (!fechaVencimiento.isBefore(desde31) && !fechaVencimiento.isAfter(hasta60)) {
                monto31a60 = sumar(monto31a60, saldoCuota);
            } else if (!fechaVencimiento.isBefore(desde61) && !fechaVencimiento.isAfter(hasta90)) {
                monto61a90 = sumar(monto61a90, saldoCuota);
            }
        }

        return List.of(
                new ProyeccionCobroPeriodoResponse(
                        "0_30",
                        "Próximos 30 días",
                        hoy,
                        hasta30,
                        escalar(monto0a30)
                ),
                new ProyeccionCobroPeriodoResponse(
                        "31_60",
                        "Días 31 a 60",
                        desde31,
                        hasta60,
                        escalar(monto31a60)
                ),
                new ProyeccionCobroPeriodoResponse(
                        "61_90",
                        "Días 61 a 90",
                        desde61,
                        hasta90,
                        escalar(monto61a90)
                )
        );
    }

    private List<ProyeccionCobroPeriodoResponse> proyeccionesCobroVacias(LocalDate hoy) {
        return List.of(
                new ProyeccionCobroPeriodoResponse(
                        "0_30",
                        "Próximos 30 días",
                        hoy,
                        hoy.plusDays(30),
                        cero()
                ),
                new ProyeccionCobroPeriodoResponse(
                        "31_60",
                        "Días 31 a 60",
                        hoy.plusDays(31),
                        hoy.plusDays(60),
                        cero()
                ),
                new ProyeccionCobroPeriodoResponse(
                        "61_90",
                        "Días 61 a 90",
                        hoy.plusDays(61),
                        hoy.plusDays(90),
                        cero()
                )
        );
    }

    private BigDecimal calcularIngresosMesActual(List<Pago> pagosRegistrados) {
        YearMonth mesActual = fechaOperativaService.mesActual();

        return pagosRegistrados.stream()
                .filter(pago -> fechaContablePago(pago) != null)
                .filter(pago -> YearMonth.from(fechaContablePago(pago)).equals(mesActual))
                .map(Pago::getMonto)
                .reduce(cero(), this::sumar);
    }

    private BigDecimal calcularEgresosMesActual(List<Prestamo> prestamosActivos) {
        LocalDate hoy = fechaOperativaService.hoy();
        LocalDate inicioMes = fechaOperativaService.inicioMesActual();

        return prestamosActivos.stream()
                .filter(prestamo -> prestamo.getFechaBase() != null)
                .filter(prestamo -> !prestamo.getFechaBase().isBefore(inicioMes))
                .filter(prestamo -> !prestamo.getFechaBase().isAfter(hoy))
                .map(Prestamo::getMontoInicial)
                .reduce(cero(), this::sumar);
    }

    private LocalDate fechaContablePago(Pago pago) {
        return pago.getFechaContable() != null ? pago.getFechaContable() : pago.getFechaPago();
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
                    .map(this::calcularSaldoCuota)
                    .reduce(cero(), this::sumar);
        }

        return max(restar(totalADevolver, totalCobrado), cero());
    }

    private BigDecimal calcularSaldoCuota(Cuota cuota) {
        return max(restar(valorSeguro(cuota.getMontoProgramado()), valorSeguro(cuota.getMontoPagado())), cero());
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
        return escalar(valorSeguro(a).add(valorSeguro(b)));
    }

    private BigDecimal restar(BigDecimal a, BigDecimal b) {
        return escalar(valorSeguro(a).subtract(valorSeguro(b)));
    }

    private BigDecimal max(BigDecimal a, BigDecimal b) {
        return escalar(valorSeguro(a).max(valorSeguro(b)));
    }

    private BigDecimal min(BigDecimal a, BigDecimal b) {
        return escalar(valorSeguro(a).min(valorSeguro(b)));
    }

    private BigDecimal cero() {
        return MonedaUtils.cero();
    }

    private BigDecimal escalar(BigDecimal valor) {
        return MonedaUtils.normalizar(valor);
    }
}