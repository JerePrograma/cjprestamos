package com.cjprestamos.backend.reporte.service;

import com.cjprestamos.backend.common.model.MonedaUtils;
import com.cjprestamos.backend.common.time.FechaOperativaService;
import com.cjprestamos.backend.cuota.model.Cuota;
import com.cjprestamos.backend.cuota.model.enums.EstadoCuota;
import com.cjprestamos.backend.cuota.repository.CuotaRepository;
import com.cjprestamos.backend.dashboard.dto.DashboardControlCajaResponse;
import com.cjprestamos.backend.dashboard.service.DashboardService;
import com.cjprestamos.backend.pago.model.Pago;
import com.cjprestamos.backend.pago.model.enums.EstadoPago;
import com.cjprestamos.backend.pago.repository.PagoRepository;
import com.cjprestamos.backend.persona.model.Persona;
import com.cjprestamos.backend.prestamo.dto.CalculoPrestamoEntrada;
import com.cjprestamos.backend.prestamo.dto.CalculoPrestamoResultado;
import com.cjprestamos.backend.prestamo.model.Prestamo;
import com.cjprestamos.backend.prestamo.model.enums.EstadoPrestamo;
import com.cjprestamos.backend.prestamo.repository.PrestamoRepository;
import com.cjprestamos.backend.prestamo.service.CalculadoraPrestamoService;
import com.cjprestamos.backend.reporte.dto.ReporteDashboardData;
import com.cjprestamos.backend.reporte.dto.ReporteDashboardData.ReporteCarteraRiesgo;
import com.cjprestamos.backend.reporte.dto.ReporteDashboardData.ReporteCobrosEsperadosPeriodo;
import com.cjprestamos.backend.reporte.dto.ReporteDashboardData.ReporteCuotaACobrar;
import com.cjprestamos.backend.reporte.dto.ReporteDashboardData.ReporteCuotaVencida;
import com.cjprestamos.backend.reporte.dto.ReporteDashboardData.ReporteMovimientoPago;
import com.cjprestamos.backend.reporte.dto.ReporteDashboardData.ReporteMovimientoPrestamo;
import com.cjprestamos.backend.reporte.dto.ReporteDashboardData.ReportePrestamoSaldo;
import com.cjprestamos.backend.reporte.dto.ReporteDashboardData.ReporteResumenEjecutivo;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional(readOnly = true)
public class ReporteDashboardService {

    private static final int LIMITE_MOVIMIENTOS = 20;
    private static final int LIMITE_RIESGO = 10;
    private static final int LIMITE_CUOTAS_A_COBRAR = 20;
    private static final Locale ARGENTINA = Locale.forLanguageTag("es-AR");

    private final DashboardService dashboardService;
    private final PrestamoRepository prestamoRepository;
    private final CuotaRepository cuotaRepository;
    private final PagoRepository pagoRepository;
    private final CalculadoraPrestamoService calculadoraPrestamoService;
    private final FechaOperativaService fechaOperativaService;

    public ReporteDashboardService(
        DashboardService dashboardService,
        PrestamoRepository prestamoRepository,
        CuotaRepository cuotaRepository,
        PagoRepository pagoRepository,
        CalculadoraPrestamoService calculadoraPrestamoService,
        FechaOperativaService fechaOperativaService
    ) {
        this.dashboardService = dashboardService;
        this.prestamoRepository = prestamoRepository;
        this.cuotaRepository = cuotaRepository;
        this.pagoRepository = pagoRepository;
        this.calculadoraPrestamoService = calculadoraPrestamoService;
        this.fechaOperativaService = fechaOperativaService;
    }

    public ReporteDashboardData obtenerReporte(LocalDate desde, LocalDate hasta, String usuarioAutenticado) {
        validarRango(desde, hasta);

        List<Prestamo> prestamosPeriodo = prestamoRepository.findByFechaBaseBetweenAndEliminadoFalseOrderByFechaBaseAscIdAsc(desde, hasta);
        List<Pago> pagosPeriodo = pagoRepository.findRegistradosPorFechaContableOPagoEntre(EstadoPago.REGISTRADO, desde, hasta);
        List<Cuota> cuotasConVencimientoPeriodo = cuotaRepository.findByFechaVencimientoBetweenConPrestamoYPersona(desde, hasta);
        DashboardControlCajaResponse snapshotControlCaja = dashboardService.obtenerControlCaja();
        ReporteResumenEjecutivo resumenEjecutivo = calcularResumenEjecutivo(prestamosPeriodo, pagosPeriodo);
        ReporteCobrosEsperadosPeriodo cobrosEsperadosPeriodo = calcularCobrosEsperadosPeriodo(cuotasConVencimientoPeriodo);
        ReporteCarteraRiesgo carteraRiesgo = calcularCarteraRiesgo(hasta);
        List<ReporteMovimientoPrestamo> movimientosPrestamos = mapearPrestamosPeriodo(prestamosPeriodo);
        List<ReporteMovimientoPago> movimientosPagos = mapearPagosPeriodo(pagosPeriodo);
        List<String> observaciones = armarObservaciones(
            resumenEjecutivo,
            carteraRiesgo,
            cobrosEsperadosPeriodo,
            prestamosPeriodo.isEmpty() && pagosPeriodo.isEmpty()
        );

        return new ReporteDashboardData(
            desde,
            hasta,
            fechaOperativaService.ahora(),
            normalizarTexto(usuarioAutenticado),
            resumenEjecutivo,
            cobrosEsperadosPeriodo,
            snapshotControlCaja,
            carteraRiesgo,
            movimientosPrestamos,
            movimientosPagos,
            observaciones
        );
    }

    private void validarRango(LocalDate desde, LocalDate hasta) {
        if (desde == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "desde es obligatorio");
        }

        if (hasta == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "hasta es obligatorio");
        }

        if (desde.isAfter(hasta)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "desde no puede ser posterior a hasta");
        }
    }

    private ReporteResumenEjecutivo calcularResumenEjecutivo(List<Prestamo> prestamosPeriodo, List<Pago> pagosPeriodo) {
        BigDecimal ingresosPeriodo = pagosPeriodo.stream()
            .map(Pago::getMonto)
            .reduce(cero(), this::sumar);
        BigDecimal montoTotalPrestado = prestamosPeriodo.stream()
            .map(Prestamo::getMontoInicial)
            .reduce(cero(), this::sumar);
        BigDecimal egresosPeriodo = montoTotalPrestado;
        BigDecimal balancePeriodo = restar(ingresosPeriodo, egresosPeriodo);

        return new ReporteResumenEjecutivo(
            ingresosPeriodo,
            egresosPeriodo,
            balancePeriodo,
            pagosPeriodo.size(),
            prestamosPeriodo.size(),
            montoTotalPrestado,
            promedio(montoTotalPrestado, prestamosPeriodo.size()),
            promedio(ingresosPeriodo, pagosPeriodo.size())
        );
    }

    private ReporteCobrosEsperadosPeriodo calcularCobrosEsperadosPeriodo(List<Cuota> cuotasConVencimientoPeriodo) {
        List<ReporteCuotaACobrar> cuotasOrdenadas = cuotasConVencimientoPeriodo.stream()
            .map(this::mapearCuotaACobrar)
            .sorted(Comparator
                .comparing(ReporteCuotaACobrar::fechaVencimiento)
                .thenComparing(ReporteCuotaACobrar::montoPendiente, Comparator.reverseOrder()))
            .toList();

        BigDecimal totalEsperado = cuotasOrdenadas.stream()
            .map(ReporteCuotaACobrar::montoEsperado)
            .reduce(cero(), this::sumar);
        BigDecimal totalPagado = cuotasOrdenadas.stream()
            .map(ReporteCuotaACobrar::montoPagado)
            .reduce(cero(), this::sumar);
        BigDecimal totalPendiente = cuotasOrdenadas.stream()
            .map(ReporteCuotaACobrar::montoPendiente)
            .reduce(cero(), this::sumar);
        long cantidadCuotasCompletas = cuotasOrdenadas.stream()
            .filter(cuota -> cuota.montoPendiente().compareTo(cero()) == 0)
            .count();
        long cantidadCuotasPendientes = cuotasOrdenadas.stream()
            .filter(cuota -> cuota.montoPendiente().compareTo(cero()) > 0)
            .count();

        return new ReporteCobrosEsperadosPeriodo(
            totalEsperado,
            totalPagado,
            totalPendiente,
            cuotasOrdenadas.size(),
            cantidadCuotasCompletas,
            cantidadCuotasPendientes,
            cuotasOrdenadas.stream()
                .limit(LIMITE_CUOTAS_A_COBRAR)
                .toList()
        );
    }

    private ReporteCuotaACobrar mapearCuotaACobrar(Cuota cuota) {
        BigDecimal montoEsperado = valorSeguro(cuota.getMontoProgramado());
        BigDecimal montoPagado = valorSeguro(cuota.getMontoPagado());
        BigDecimal montoPendiente = max(restar(montoEsperado, montoPagado), cero());

        return new ReporteCuotaACobrar(
            cuota.getFechaVencimiento(),
            nombrePersona(cuota.getPrestamo().getPersona()),
            referenciaPrestamo(cuota.getPrestamo()),
            cuota.getNumeroCuota(),
            montoEsperado,
            montoPagado,
            montoPendiente,
            estadoSimpleCuota(cuota, montoPendiente, montoPagado)
        );
    }

    private ReporteCarteraRiesgo calcularCarteraRiesgo(LocalDate hasta) {
        List<Prestamo> prestamosActivos = prestamoRepository.findByEstadoAndEliminadoFalseOrderByCreatedAtDesc(EstadoPrestamo.ACTIVO);
        List<Long> prestamosActivosIds = prestamosActivos.stream()
            .map(Prestamo::getId)
            .toList();

        List<Cuota> cuotasActivas = prestamosActivosIds.isEmpty()
            ? Collections.emptyList()
            : cuotaRepository.findByPrestamoIdIn(prestamosActivosIds);
        Map<Long, List<Cuota>> cuotasPorPrestamo = cuotasActivas.stream()
            .collect(Collectors.groupingBy(cuota -> cuota.getPrestamo().getId()));

        List<Pago> pagosActivos = prestamosActivosIds.isEmpty()
            ? Collections.emptyList()
            : pagoRepository.findByPrestamoIdInAndEstado(prestamosActivosIds, EstadoPago.REGISTRADO);
        Map<Long, BigDecimal> cobradoPorPrestamo = pagosActivos.stream()
            .collect(Collectors.groupingBy(
                pago -> pago.getPrestamo().getId(),
                Collectors.mapping(Pago::getMonto, Collectors.reducing(cero(), this::sumar))
            ));

        List<Cuota> cuotasPendientes = cuotasActivas.stream()
            .filter(cuota -> saldoCuota(cuota).compareTo(cero()) > 0)
            .toList();
        List<Cuota> cuotasVencidas = cuotasPendientes.stream()
            .filter(cuota -> cuota.getFechaVencimiento() != null)
            .filter(cuota -> !cuota.getFechaVencimiento().isAfter(hasta))
            .toList();

        BigDecimal montoTotalMora = cuotasVencidas.stream()
            .map(this::saldoCuota)
            .reduce(cero(), this::sumar);

        List<ReportePrestamoSaldo> mayoresSaldos = prestamosActivos.stream()
            .map(prestamo -> new ReportePrestamoSaldo(
                referenciaPrestamo(prestamo),
                nombrePersona(prestamo.getPersona()),
                nombreEstado(prestamo.getEstado()),
                calcularSaldoPrestamo(prestamo, cuotasPorPrestamo, cobradoPorPrestamo)
            ))
            .filter(item -> item.saldoPendiente().compareTo(cero()) > 0)
            .sorted(Comparator.comparing(ReportePrestamoSaldo::saldoPendiente).reversed())
            .limit(LIMITE_RIESGO)
            .toList();

        List<ReporteCuotaVencida> cuotasVencidasRelevantes = cuotasVencidas.stream()
            .map(cuota -> new ReporteCuotaVencida(
                cuota.getFechaVencimiento(),
                referenciaPrestamo(cuota.getPrestamo()),
                nombrePersona(cuota.getPrestamo().getPersona()),
                cuota.getNumeroCuota(),
                saldoCuota(cuota)
            ))
            .sorted(Comparator.comparing(ReporteCuotaVencida::montoPendiente).reversed())
            .limit(LIMITE_RIESGO)
            .toList();

        long prestamosFinalizadosCancelados = prestamoRepository.countByEstadoInAndEliminadoFalse(List.of(
            EstadoPrestamo.FINALIZADO,
            EstadoPrestamo.CANCELADO
        ));

        return new ReporteCarteraRiesgo(
            cuotasPendientes.size(),
            cuotasVencidas.size(),
            montoTotalMora,
            prestamosActivos.size(),
            prestamosFinalizadosCancelados,
            mayoresSaldos,
            cuotasVencidasRelevantes
        );
    }

    private List<ReporteMovimientoPrestamo> mapearPrestamosPeriodo(List<Prestamo> prestamosPeriodo) {
        return prestamosPeriodo.stream()
            .limit(LIMITE_MOVIMIENTOS)
            .map(prestamo -> new ReporteMovimientoPrestamo(
                prestamo.getFechaBase(),
                referenciaPrestamo(prestamo),
                nombrePersona(prestamo.getPersona()),
                escalar(prestamo.getMontoInicial()),
                prestamo.getCantidadCuotas(),
                nombreEstado(prestamo.getEstado())
            ))
            .toList();
    }

    private List<ReporteMovimientoPago> mapearPagosPeriodo(List<Pago> pagosPeriodo) {
        return pagosPeriodo.stream()
            .limit(LIMITE_MOVIMIENTOS)
            .map(pago -> new ReporteMovimientoPago(
                fechaContablePago(pago),
                nombrePersona(pago.getPrestamo().getPersona()),
                referenciaPrestamo(pago.getPrestamo()),
                escalar(pago.getMonto()),
                nombreEstado(pago.getEstado())
            ))
            .toList();
    }

    private List<String> armarObservaciones(
        ReporteResumenEjecutivo resumenEjecutivo,
        ReporteCarteraRiesgo carteraRiesgo,
        ReporteCobrosEsperadosPeriodo cobrosEsperadosPeriodo,
        boolean sinMovimientos
    ) {
        List<String> observaciones = new ArrayList<>();

        if (resumenEjecutivo.balancePeriodo().compareTo(cero()) < 0) {
            observaciones.add("En este período salió más dinero del que entró: la diferencia fue de "
                + moneda(resumenEjecutivo.balancePeriodo().abs()) + ".");
        }

        if (carteraRiesgo.montoTotalMoraAlHasta().compareTo(cero()) > 0) {
            observaciones.add("Al cierre del período hay " + moneda(carteraRiesgo.montoTotalMoraAlHasta())
                + " atrasados para revisar.");
        }

        if (carteraRiesgo.cuotasVencidasAlHasta() > 0) {
            observaciones.add("Hay " + carteraRiesgo.cuotasVencidasAlHasta()
                + " cuotas atrasadas al cierre del período.");
        }

        if (cobrosEsperadosPeriodo.totalPendiente().compareTo(cero()) > 0) {
            observaciones.add("Quedan " + moneda(cobrosEsperadosPeriodo.totalPendiente())
                + " por cobrar de cuotas que vencen dentro del período seleccionado.");
        }

        if (
            cobrosEsperadosPeriodo.totalEsperado().compareTo(cero()) > 0
                && resumenEjecutivo.ingresosPeriodo().compareTo(cobrosEsperadosPeriodo.totalEsperado()) < 0
        ) {
            observaciones.add("Se cobró menos de lo esperado para este período. Revisar cuotas pendientes.");
        }

        if (
            cobrosEsperadosPeriodo.cantidadCuotasPendientes() > 0
                && carteraRiesgo.montoTotalMoraAlHasta().compareTo(cero()) == 0
        ) {
            observaciones.add("Hay cuotas por cobrar en el período, pero no se detectan atrasos al cierre.");
        }

        if (sinMovimientos && cobrosEsperadosPeriodo.cantidadCuotas() == 0) {
            observaciones.add("No hubo movimientos ni vencimientos relevantes en el período seleccionado.");
        }

        if (observaciones.isEmpty()) {
            observaciones.add("Sin observaciones automáticas relevantes para el período.");
        }

        return observaciones;
    }

    private BigDecimal calcularSaldoPrestamo(
        Prestamo prestamo,
        Map<Long, List<Cuota>> cuotasPorPrestamo,
        Map<Long, BigDecimal> cobradoPorPrestamo
    ) {
        List<Cuota> cuotas = cuotasPorPrestamo.getOrDefault(prestamo.getId(), Collections.emptyList());
        if (!cuotas.isEmpty()) {
            return cuotas.stream()
                .map(this::saldoCuota)
                .reduce(cero(), this::sumar);
        }

        CalculoPrestamoResultado calculo = calculadoraPrestamoService.calcular(new CalculoPrestamoEntrada(
            prestamo.getMontoInicial(),
            prestamo.getPorcentajeFijoSugerido(),
            prestamo.getInteresManualOpcional(),
            prestamo.getCantidadCuotas()
        ));
        return max(restar(calculo.totalADevolver(), cobradoPorPrestamo.getOrDefault(prestamo.getId(), cero())), cero());
    }

    private BigDecimal saldoCuota(Cuota cuota) {
        return max(restar(cuota.getMontoProgramado(), valorSeguro(cuota.getMontoPagado())), cero());
    }

    private String estadoSimpleCuota(Cuota cuota, BigDecimal montoPendiente, BigDecimal montoPagado) {
        if (montoPendiente.compareTo(cero()) == 0) {
            return "Pagada";
        }

        if (cuota.getEstado() == EstadoCuota.VENCIDA) {
            return "Atrasada";
        }

        if (montoPagado.compareTo(cero()) > 0) {
            return "Parcial";
        }

        return "Pendiente";
    }

    private LocalDate fechaContablePago(Pago pago) {
        return pago.getFechaContable() != null ? pago.getFechaContable() : pago.getFechaPago();
    }

    private String referenciaPrestamo(Prestamo prestamo) {
        String referencia = normalizarTexto(prestamo.getReferenciaCodigo());
        if (referencia != null) {
            return referencia;
        }

        return prestamo.getId() == null ? "Prestamo sin referencia" : "Prestamo #" + prestamo.getId();
    }

    private String nombrePersona(Persona persona) {
        if (persona == null) {
            return "Sin persona";
        }

        String nombre = normalizarTexto(persona.getNombre());
        return nombre == null ? "Persona #" + persona.getId() : nombre;
    }

    private String nombreEstado(Enum<?> estado) {
        return estado == null ? "Sin estado" : estado.name();
    }

    private String normalizarTexto(String valor) {
        if (valor == null || valor.trim().isEmpty()) {
            return null;
        }

        return valor.trim();
    }

    private BigDecimal promedio(BigDecimal total, long cantidad) {
        if (cantidad <= 0) {
            return cero();
        }

        return escalar(total.divide(BigDecimal.valueOf(cantidad), 2, RoundingMode.HALF_UP));
    }

    private BigDecimal valorSeguro(BigDecimal valor) {
        return valor == null ? cero() : escalar(valor);
    }

    private BigDecimal sumar(BigDecimal a, BigDecimal b) {
        return escalar(a.add(valorSeguro(b)));
    }

    private BigDecimal restar(BigDecimal a, BigDecimal b) {
        return escalar(valorSeguro(a).subtract(valorSeguro(b)));
    }

    private BigDecimal max(BigDecimal a, BigDecimal b) {
        return escalar(a.max(b));
    }

    private String moneda(BigDecimal valor) {
        NumberFormat formato = NumberFormat.getCurrencyInstance(ARGENTINA);
        formato.setMinimumFractionDigits(0);
        formato.setMaximumFractionDigits(0);
        BigDecimal seguro = valor == null ? BigDecimal.ZERO : valor;
        return formato.format(seguro.setScale(0, RoundingMode.CEILING));
    }

    private BigDecimal cero() {
        return MonedaUtils.cero();
    }

    private BigDecimal escalar(BigDecimal valor) {
        return MonedaUtils.normalizar(valor);
    }
}
