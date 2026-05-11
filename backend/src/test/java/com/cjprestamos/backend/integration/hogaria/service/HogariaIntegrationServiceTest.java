package com.cjprestamos.backend.integration.hogaria.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.cjprestamos.backend.cuota.dto.CuotaResponse;
import com.cjprestamos.backend.cuota.model.enums.EstadoCuota;
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
import com.cjprestamos.backend.persona.model.Persona;
import com.cjprestamos.backend.prestamo.dto.CalculoPrestamoResultado;
import com.cjprestamos.backend.prestamo.model.Prestamo;
import com.cjprestamos.backend.prestamo.model.enums.EstadoPrestamo;
import com.cjprestamos.backend.prestamo.model.enums.FrecuenciaTipo;
import com.cjprestamos.backend.prestamo.repository.PrestamoRepository;
import com.cjprestamos.backend.prestamo.service.CalculadoraPrestamoService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class HogariaIntegrationServiceTest {
    @Mock private PrestamoRepository prestamoRepository;
    @Mock private PagoRepository pagoRepository;
    @Mock private CalculadoraPrestamoService calculadoraPrestamoService;
    @Mock private DashboardService dashboardService;
    @Mock private CuotaService cuotaService;
    @Mock private PagoService pagoService;

    private HogariaIntegrationService service;

    @BeforeEach
    void setUp() {
        service = new HogariaIntegrationService(prestamoRepository, pagoRepository, calculadoraPrestamoService, dashboardService, cuotaService, pagoService);
    }

    @Test
    void listarPrestamosActivos_deberiaMapearCamposDelContrato() {
        Prestamo prestamo = crearPrestamo(5L, 9L, "Ana", "1000.00");
        when(prestamoRepository.findByEstadoOrderByCreatedAtDesc(EstadoPrestamo.ACTIVO)).thenReturn(List.of(prestamo));
        Pago pago = new Pago(); pago.setPrestamo(prestamo); pago.setMonto(new BigDecimal("400.00"));
        when(pagoRepository.findByPrestamoIdInAndEstado(List.of(5L), EstadoPago.REGISTRADO)).thenReturn(List.of(pago));
        when(calculadoraPrestamoService.calcular(any())).thenReturn(new CalculoPrestamoResultado(
            new BigDecimal("200.00"), new BigDecimal("1200.00"), new BigDecimal("120.00"), new BigDecimal("1000.00"), new BigDecimal("200.00"), new BigDecimal("200.00")
        ));

        List<HogariaLoanActiveResponse> result = service.listarPrestamosActivos();

        assertEquals(1, result.size());
        assertEquals(5L, result.getFirst().id());
        assertEquals(9L, result.getFirst().personaId());
        assertEquals("Ana", result.getFirst().personaNombre());
        assertEquals(new BigDecimal("800.00"), result.getFirst().totalPendiente());
    }

    @Test
    void obtenerDashboard_deberiaMapearCamposDelContrato() {
        when(dashboardService.obtenerResumen()).thenReturn(new DashboardResumenResponse(
            new BigDecimal("1500.00"), new BigDecimal("100.00"), new BigDecimal("200.00"), new BigDecimal("1200.00"), 4L
        ));
        HogariaDashboardResponse response = service.obtenerDashboard();
        assertEquals(new BigDecimal("1500.00"), response.montoInvertido());
        assertEquals(4L, response.prestamosActivos());
    }

    @Test
    void obtenerControlCaja_deberiaMapearCamposDelContrato() {
        when(dashboardService.obtenerControlCaja()).thenReturn(new DashboardControlCajaResponse(
            new BigDecimal("1200.00"), new BigDecimal("1800.00"), new BigDecimal("900.00"),
            new BigDecimal("900.00"), new BigDecimal("150.00"), new BigDecimal("300.00"),
            new BigDecimal("450.00"), new BigDecimal("120.00"), new BigDecimal("330.00"),
            new BigDecimal("200.00"), new BigDecimal("350.00"), new BigDecimal("500.00"),
            new BigDecimal("80.00"), 5L, 1L, new BigDecimal("50.00"), new BigDecimal("16.67")
        ));
        HogariaCashControlResponse response = service.obtenerControlCaja();
        assertEquals(new BigDecimal("1200.00"), response.cajaDisponible());
        assertEquals(5L, response.cuotasPendientes());
        assertEquals(new BigDecimal("16.67"), response.rendimientoEsperadoPorcentaje());
    }

    @Test
    void listarCuotas_deberiaMapearCamposDelContrato() {
        when(cuotaService.listarPorPrestamo(7L)).thenReturn(List.of(new CuotaResponse(
            1L, 1, LocalDate.of(2026, 6, 1), new BigDecimal("120.00"), new BigDecimal("20.00"), EstadoCuota.PARCIAL
        )));
        List<HogariaInstallmentResponse> cuotas = service.listarCuotasPorPrestamo(7L);
        assertEquals(1, cuotas.size());
        assertEquals(7L, cuotas.getFirst().prestamoId());
        assertEquals(new BigDecimal("100.00"), cuotas.getFirst().saldoPendiente());
    }

    @Test
    void listarPagos_pagoAntesDeRecuperarCapitalCompleto_deberiaImputarTodoACapital() {
        when(prestamoRepository.findById(7L)).thenReturn(Optional.of(crearPrestamo(7L, 9L, "Ana", "1000.00")));
        when(pagoService.listarPorPrestamo(7L)).thenReturn(List.of(pago(10L, 7L, "2026-05-10", "300.00")));

        List<HogariaPaymentResponse> pagos = service.listarPagosPorPrestamo(7L);

        assertEquals(new BigDecimal("300.00"), pagos.getFirst().principalRecovered());
        assertEquals(new BigDecimal("0.00"), pagos.getFirst().interestCollected());
    }

    @Test
    void listarPagos_pagoQueCruzaCapitalAInteres_deberiaSepararComponentes() {
        when(prestamoRepository.findById(7L)).thenReturn(Optional.of(crearPrestamo(7L, 9L, "Ana", "1000.00")));
        when(pagoService.listarPorPrestamo(7L)).thenReturn(List.of(
            pago(11L, 7L, "2026-05-11", "300.00"),
            pago(10L, 7L, "2026-05-10", "800.00")
        ));

        List<HogariaPaymentResponse> pagos = service.listarPagosPorPrestamo(7L);

        assertEquals(new BigDecimal("800.00"), pagos.get(0).principalRecovered());
        assertEquals(new BigDecimal("0.00"), pagos.get(0).interestCollected());
        assertEquals(new BigDecimal("200.00"), pagos.get(1).principalRecovered());
        assertEquals(new BigDecimal("100.00"), pagos.get(1).interestCollected());
    }

    @Test
    void listarPagos_pagoCompletamenteInteres_deberiaImputarTodoAInteres() {
        when(prestamoRepository.findById(7L)).thenReturn(Optional.of(crearPrestamo(7L, 9L, "Ana", "1000.00")));
        when(pagoService.listarPorPrestamo(7L)).thenReturn(List.of(
            pago(11L, 7L, "2026-05-11", "250.00"),
            pago(10L, 7L, "2026-05-10", "1000.00")
        ));

        List<HogariaPaymentResponse> pagos = service.listarPagosPorPrestamo(7L);

        assertEquals(new BigDecimal("0.00"), pagos.get(1).principalRecovered());
        assertEquals(new BigDecimal("250.00"), pagos.get(1).interestCollected());
    }

    @Test
    void listarPagos_multiplesPagos_deberiaRespetarOrdenCronologico() {
        when(prestamoRepository.findById(7L)).thenReturn(Optional.of(crearPrestamo(7L, 9L, "Ana", "1000.00")));
        when(pagoService.listarPorPrestamo(7L)).thenReturn(List.of(
            pago(13L, 7L, "2026-05-13", "200.00"),
            pago(12L, 7L, "2026-05-12", "400.00"),
            pago(11L, 7L, "2026-05-11", "350.00"),
            pago(10L, 7L, "2026-05-10", "300.00")
        ));

        List<HogariaPaymentResponse> pagos = service.listarPagosPorPrestamo(7L);

        assertEquals(LocalDate.of(2026, 5, 10), pagos.get(0).fechaPago());
        assertEquals(new BigDecimal("300.00"), pagos.get(0).principalRecovered());
        assertEquals(new BigDecimal("0.00"), pagos.get(0).interestCollected());
        assertEquals(new BigDecimal("350.00"), pagos.get(1).principalRecovered());
        assertEquals(new BigDecimal("0.00"), pagos.get(1).interestCollected());
        assertEquals(new BigDecimal("350.00"), pagos.get(2).principalRecovered());
        assertEquals(new BigDecimal("50.00"), pagos.get(2).interestCollected());
        assertEquals(new BigDecimal("0.00"), pagos.get(3).principalRecovered());
        assertEquals(new BigDecimal("200.00"), pagos.get(3).interestCollected());
    }

    private PagoResponse pago(Long id, Long prestamoId, String fecha, String monto) {
        return new PagoResponse(
            id, prestamoId, LocalDate.parse(fecha), new BigDecimal(monto), "TRX-" + id, "Obs " + id, EstadoPago.REGISTRADO,
            LocalDateTime.of(2026, 5, 10, 12, 0), LocalDateTime.of(2026, 5, 10, 12, 1)
        );
    }

    private Prestamo crearPrestamo(Long id, Long personaId, String nombrePersona, String montoInicial) {
        Persona persona = new Persona(); persona.setNombre(nombrePersona);
        ReflectionTestUtils.setField(persona, "id", personaId);
        Prestamo prestamo = new Prestamo();
        ReflectionTestUtils.setField(prestamo, "id", id);
        prestamo.setPersona(persona); prestamo.setMontoInicial(new BigDecimal(montoInicial));
        prestamo.setPorcentajeFijoSugerido(new BigDecimal("20.00")); prestamo.setCantidadCuotas(10);
        prestamo.setFrecuenciaTipo(FrecuenciaTipo.MENSUAL); prestamo.setEstado(EstadoPrestamo.ACTIVO);
        ReflectionTestUtils.setField(prestamo, "createdAt", LocalDateTime.of(2026,1,1,10,0));
        ReflectionTestUtils.setField(prestamo, "updatedAt", LocalDateTime.of(2026,1,2,10,0));
        return prestamo;
    }
}
