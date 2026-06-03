package com.cjprestamos.backend.reporte.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.cjprestamos.backend.common.time.FechaOperativaService;
import com.cjprestamos.backend.common.time.RelojSistema;
import com.cjprestamos.backend.cuota.model.Cuota;
import com.cjprestamos.backend.cuota.repository.CuotaRepository;
import com.cjprestamos.backend.dashboard.dto.DashboardControlCajaResponse;
import com.cjprestamos.backend.dashboard.service.DashboardService;
import com.cjprestamos.backend.pago.model.Pago;
import com.cjprestamos.backend.pago.model.enums.EstadoPago;
import com.cjprestamos.backend.pago.repository.PagoRepository;
import com.cjprestamos.backend.persona.model.Persona;
import com.cjprestamos.backend.prestamo.model.Prestamo;
import com.cjprestamos.backend.prestamo.model.enums.EstadoPrestamo;
import com.cjprestamos.backend.prestamo.model.enums.FrecuenciaTipo;
import com.cjprestamos.backend.prestamo.repository.PrestamoRepository;
import com.cjprestamos.backend.prestamo.service.CalculadoraPrestamoService;
import com.cjprestamos.backend.reporte.dto.ReporteDashboardData;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class ReporteDashboardServiceTest {

    private static final LocalDateTime AHORA_OPERATIVO = LocalDateTime.of(2026, 5, 20, 11, 45);

    @Mock
    private DashboardService dashboardService;

    @Mock
    private PrestamoRepository prestamoRepository;

    @Mock
    private CuotaRepository cuotaRepository;

    @Mock
    private PagoRepository pagoRepository;

    @Mock
    private CalculadoraPrestamoService calculadoraPrestamoService;

    private ReporteDashboardService reporteDashboardService;

    @BeforeEach
    void setUp() {
        Clock clock = Clock.fixed(AHORA_OPERATIVO.atZone(RelojSistema.ZONA_OPERATIVA).toInstant(), RelojSistema.ZONA_OPERATIVA);
        reporteDashboardService = new ReporteDashboardService(
            dashboardService,
            prestamoRepository,
            cuotaRepository,
            pagoRepository,
            calculadoraPrestamoService,
            new FechaOperativaService(clock)
        );
    }

    @Test
    void obtenerReporte_conRangoValidoYDatos_deberiaCalcularResumenYCartera() {
        LocalDate desde = LocalDate.of(2026, 5, 1);
        LocalDate hasta = LocalDate.of(2026, 5, 31);
        Prestamo prestamo = crearPrestamo(1L, "Ana Perez", "P-001", "1000.00", EstadoPrestamo.ACTIVO);
        Pago pago = crearPago(prestamo, "500.00", LocalDate.of(2026, 5, 8), LocalDate.of(2026, 5, 9));
        Cuota cuota = crearCuota(prestamo, 1, "1200.00", "500.00", LocalDate.of(2026, 5, 15));

        when(prestamoRepository.findByFechaBaseBetweenAndEliminadoFalseOrderByFechaBaseAscIdAsc(desde, hasta)).thenReturn(List.of(prestamo));
        when(pagoRepository.findRegistradosPorFechaContableOPagoEntre(EstadoPago.REGISTRADO, desde, hasta)).thenReturn(List.of(pago));
        when(cuotaRepository.findByFechaVencimientoBetweenConPrestamoYPersona(desde, hasta)).thenReturn(List.of(cuota));
        when(dashboardService.obtenerControlCaja()).thenReturn(snapshotCero());
        when(prestamoRepository.findByEstadoAndEliminadoFalseOrderByCreatedAtDesc(EstadoPrestamo.ACTIVO)).thenReturn(List.of(prestamo));
        when(cuotaRepository.findByPrestamoIdIn(List.of(1L))).thenReturn(List.of(cuota));
        when(pagoRepository.findByPrestamoIdInAndEstado(List.of(1L), EstadoPago.REGISTRADO)).thenReturn(List.of(pago));
        when(prestamoRepository.countByEstadoInAndEliminadoFalse(List.of(EstadoPrestamo.FINALIZADO, EstadoPrestamo.CANCELADO))).thenReturn(2L);

        ReporteDashboardData reporte = reporteDashboardService.obtenerReporte(desde, hasta, "operadora");

        assertEquals(new BigDecimal("500.00"), reporte.resumenEjecutivo().ingresosPeriodo());
        assertEquals(new BigDecimal("1000.00"), reporte.resumenEjecutivo().egresosPeriodo());
        assertEquals(new BigDecimal("-500.00"), reporte.resumenEjecutivo().balancePeriodo());
        assertEquals(1L, reporte.resumenEjecutivo().cantidadPagosRegistrados());
        assertEquals(1L, reporte.resumenEjecutivo().cantidadPrestamosOtorgados());
        assertEquals(new BigDecimal("1000.00"), reporte.resumenEjecutivo().montoPromedioPrestado());
        assertEquals(new BigDecimal("500.00"), reporte.resumenEjecutivo().ticketPromedioPago());
        assertEquals(1L, reporte.carteraRiesgo().cuotasPendientesAlCierre());
        assertEquals(1L, reporte.carteraRiesgo().cuotasVencidasAlHasta());
        assertEquals(new BigDecimal("700.00"), reporte.carteraRiesgo().montoTotalMoraAlHasta());
        assertEquals(2L, reporte.carteraRiesgo().prestamosFinalizadosCancelados());
        assertEquals(new BigDecimal("1200.00"), reporte.cobrosEsperadosPeriodo().totalEsperado());
        assertEquals(new BigDecimal("500.00"), reporte.cobrosEsperadosPeriodo().totalPagado());
        assertEquals(new BigDecimal("700.00"), reporte.cobrosEsperadosPeriodo().totalPendiente());
        assertEquals(1L, reporte.cobrosEsperadosPeriodo().cantidadCuotas());
        assertEquals(0L, reporte.cobrosEsperadosPeriodo().cantidadCuotasCompletas());
        assertEquals(1L, reporte.cobrosEsperadosPeriodo().cantidadCuotasPendientes());
        assertEquals("Ana Perez", reporte.cobrosEsperadosPeriodo().cuotasACobrar().get(0).persona());
        assertEquals("P-001", reporte.cobrosEsperadosPeriodo().cuotasACobrar().get(0).prestamoReferencia());
        assertEquals("operadora", reporte.usuarioAutenticado());
        assertEquals(AHORA_OPERATIVO, reporte.generadoEn());
    }

    @Test
    void obtenerReporte_sinDatos_deberiaRetornarMetricasEnCeroYObservacion() {
        LocalDate desde = LocalDate.of(2026, 5, 1);
        LocalDate hasta = LocalDate.of(2026, 5, 31);

        when(prestamoRepository.findByFechaBaseBetweenAndEliminadoFalseOrderByFechaBaseAscIdAsc(desde, hasta)).thenReturn(List.of());
        when(pagoRepository.findRegistradosPorFechaContableOPagoEntre(EstadoPago.REGISTRADO, desde, hasta)).thenReturn(List.of());
        when(cuotaRepository.findByFechaVencimientoBetweenConPrestamoYPersona(desde, hasta)).thenReturn(List.of());
        when(dashboardService.obtenerControlCaja()).thenReturn(snapshotCero());
        when(prestamoRepository.findByEstadoAndEliminadoFalseOrderByCreatedAtDesc(EstadoPrestamo.ACTIVO)).thenReturn(List.of());
        when(prestamoRepository.countByEstadoInAndEliminadoFalse(List.of(EstadoPrestamo.FINALIZADO, EstadoPrestamo.CANCELADO))).thenReturn(0L);

        ReporteDashboardData reporte = reporteDashboardService.obtenerReporte(desde, hasta, null);

        assertEquals(new BigDecimal("0.00"), reporte.resumenEjecutivo().ingresosPeriodo());
        assertEquals(new BigDecimal("0.00"), reporte.resumenEjecutivo().egresosPeriodo());
        assertEquals(new BigDecimal("0.00"), reporte.resumenEjecutivo().balancePeriodo());
        assertEquals(0L, reporte.resumenEjecutivo().cantidadPagosRegistrados());
        assertEquals(0L, reporte.resumenEjecutivo().cantidadPrestamosOtorgados());
        assertEquals(0, reporte.prestamosOtorgados().size());
        assertEquals(0, reporte.pagosRegistrados().size());
        assertEquals(new BigDecimal("0.00"), reporte.cobrosEsperadosPeriodo().totalEsperado());
        assertEquals(new BigDecimal("0.00"), reporte.cobrosEsperadosPeriodo().totalPagado());
        assertEquals(new BigDecimal("0.00"), reporte.cobrosEsperadosPeriodo().totalPendiente());
        assertEquals(0L, reporte.cobrosEsperadosPeriodo().cantidadCuotas());
        assertEquals(0, reporte.cobrosEsperadosPeriodo().cuotasACobrar().size());
        assertEquals("No hubo movimientos ni vencimientos relevantes en el período seleccionado.", reporte.observaciones().get(0));
    }

    @Test
    void obtenerReporte_conCuotasDelPeriodo_deberiaCalcularPendientesYOrdenarTabla() {
        LocalDate desde = LocalDate.of(2026, 5, 1);
        LocalDate hasta = LocalDate.of(2026, 5, 31);
        Prestamo prestamo = crearPrestamo(8L, "Luis Gomez", "P-008", "1000.00", EstadoPrestamo.ACTIVO);
        Cuota cuotaPagada = crearCuota(prestamo, 1, "100.00", "130.00", LocalDate.of(2026, 5, 10));
        Cuota cuotaParcial = crearCuota(prestamo, 2, "200.00", "50.00", LocalDate.of(2026, 5, 10));
        Cuota cuotaPendiente = crearCuota(prestamo, 3, "50.00", "0.00", LocalDate.of(2026, 5, 11));

        when(prestamoRepository.findByFechaBaseBetweenAndEliminadoFalseOrderByFechaBaseAscIdAsc(desde, hasta)).thenReturn(List.of());
        when(pagoRepository.findRegistradosPorFechaContableOPagoEntre(EstadoPago.REGISTRADO, desde, hasta)).thenReturn(List.of());
        when(cuotaRepository.findByFechaVencimientoBetweenConPrestamoYPersona(desde, hasta))
            .thenReturn(List.of(cuotaPagada, cuotaParcial, cuotaPendiente));
        when(dashboardService.obtenerControlCaja()).thenReturn(snapshotCero());
        when(prestamoRepository.findByEstadoAndEliminadoFalseOrderByCreatedAtDesc(EstadoPrestamo.ACTIVO)).thenReturn(List.of());
        when(prestamoRepository.countByEstadoInAndEliminadoFalse(List.of(EstadoPrestamo.FINALIZADO, EstadoPrestamo.CANCELADO))).thenReturn(0L);

        ReporteDashboardData reporte = reporteDashboardService.obtenerReporte(desde, hasta, null);

        assertEquals(new BigDecimal("350.00"), reporte.cobrosEsperadosPeriodo().totalEsperado());
        assertEquals(new BigDecimal("180.00"), reporte.cobrosEsperadosPeriodo().totalPagado());
        assertEquals(new BigDecimal("200.00"), reporte.cobrosEsperadosPeriodo().totalPendiente());
        assertEquals(3L, reporte.cobrosEsperadosPeriodo().cantidadCuotas());
        assertEquals(1L, reporte.cobrosEsperadosPeriodo().cantidadCuotasCompletas());
        assertEquals(2L, reporte.cobrosEsperadosPeriodo().cantidadCuotasPendientes());
        assertEquals(2, reporte.cobrosEsperadosPeriodo().cuotasACobrar().get(0).numeroCuota());
        assertEquals(new BigDecimal("150.00"), reporte.cobrosEsperadosPeriodo().cuotasACobrar().get(0).montoPendiente());
        assertEquals(1, reporte.cobrosEsperadosPeriodo().cuotasACobrar().get(1).numeroCuota());
        assertEquals(new BigDecimal("0.00"), reporte.cobrosEsperadosPeriodo().cuotasACobrar().get(1).montoPendiente());
    }

    @Test
    void obtenerReporte_pagoSinFechaContable_deberiaUsarFechaPagoEnMovimientos() {
        LocalDate desde = LocalDate.of(2026, 5, 1);
        LocalDate hasta = LocalDate.of(2026, 5, 31);
        Prestamo prestamo = crearPrestamo(3L, "Ana Perez", "P-003", "1000.00", EstadoPrestamo.ACTIVO);
        Pago pago = crearPago(prestamo, "250.00", LocalDate.of(2026, 5, 14), null);

        when(prestamoRepository.findByFechaBaseBetweenAndEliminadoFalseOrderByFechaBaseAscIdAsc(desde, hasta)).thenReturn(List.of());
        when(pagoRepository.findRegistradosPorFechaContableOPagoEntre(EstadoPago.REGISTRADO, desde, hasta)).thenReturn(List.of(pago));
        when(cuotaRepository.findByFechaVencimientoBetweenConPrestamoYPersona(desde, hasta)).thenReturn(List.of());
        when(dashboardService.obtenerControlCaja()).thenReturn(snapshotCero());
        when(prestamoRepository.findByEstadoAndEliminadoFalseOrderByCreatedAtDesc(EstadoPrestamo.ACTIVO)).thenReturn(List.of());
        when(prestamoRepository.countByEstadoInAndEliminadoFalse(List.of(EstadoPrestamo.FINALIZADO, EstadoPrestamo.CANCELADO))).thenReturn(0L);

        ReporteDashboardData reporte = reporteDashboardService.obtenerReporte(desde, hasta, null);

        assertEquals(LocalDate.of(2026, 5, 14), reporte.pagosRegistrados().get(0).fecha());
        assertEquals(new BigDecimal("250.00"), reporte.resumenEjecutivo().ingresosPeriodo());
    }

    @Test
    void obtenerReporte_desdePosteriorAHasta_deberiaFallar() {
        ResponseStatusException exception = assertThrows(
            ResponseStatusException.class,
            () -> reporteDashboardService.obtenerReporte(LocalDate.of(2026, 6, 1), LocalDate.of(2026, 5, 31), null)
        );

        assertEquals("desde no puede ser posterior a hasta", exception.getReason());
        verifyNoInteractions(prestamoRepository, pagoRepository, dashboardService);
    }

    private DashboardControlCajaResponse snapshotCero() {
        return new DashboardControlCajaResponse(
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            0L,
            0L,
            BigDecimal.ZERO,
            BigDecimal.ZERO
        );
    }

    private Prestamo crearPrestamo(Long id, String nombrePersona, String referencia, String montoInicial, EstadoPrestamo estado) {
        Persona persona = new Persona();
        persona.setNombre(nombrePersona);
        setId(persona, id);

        Prestamo prestamo = new Prestamo();
        prestamo.setPersona(persona);
        prestamo.setReferenciaCodigo(referencia);
        prestamo.setMontoInicial(new BigDecimal(montoInicial));
        prestamo.setCantidadCuotas(2);
        prestamo.setFrecuenciaTipo(FrecuenciaTipo.MENSUAL);
        prestamo.setFechaBase(LocalDate.of(2026, 5, 5));
        prestamo.setEstado(estado);
        setId(prestamo, id);
        return prestamo;
    }

    private Pago crearPago(Prestamo prestamo, String monto, LocalDate fechaPago, LocalDate fechaContable) {
        Pago pago = new Pago();
        pago.setPrestamo(prestamo);
        pago.setMonto(new BigDecimal(monto));
        pago.setFechaPago(fechaPago);
        pago.setFechaContable(fechaContable);
        pago.setEstado(EstadoPago.REGISTRADO);
        return pago;
    }

    private Cuota crearCuota(Prestamo prestamo, int numero, String montoProgramado, String montoPagado, LocalDate vencimiento) {
        Cuota cuota = new Cuota();
        cuota.setPrestamo(prestamo);
        cuota.setNumeroCuota(numero);
        cuota.setMontoProgramado(new BigDecimal(montoProgramado));
        cuota.setMontoPagado(new BigDecimal(montoPagado));
        cuota.setFechaVencimiento(vencimiento);
        return cuota;
    }

    private void setId(Object target, Long id) {
        try {
            var field = target.getClass().getDeclaredField("id");
            field.setAccessible(true);
            field.set(target, id);
        } catch (ReflectiveOperationException e) {
            throw new IllegalStateException(e);
        }
    }
}
