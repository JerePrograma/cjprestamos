package com.cjprestamos.backend.integration.hogaria.controller;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.cjprestamos.backend.config.SecurityConfig;
import com.cjprestamos.backend.cuota.model.enums.EstadoCuota;
import com.cjprestamos.backend.integration.hogaria.dto.HogariaCashControlResponse;
import com.cjprestamos.backend.integration.hogaria.dto.HogariaDashboardResponse;
import com.cjprestamos.backend.integration.hogaria.dto.HogariaInstallmentResponse;
import com.cjprestamos.backend.integration.hogaria.dto.HogariaLoanActiveResponse;
import com.cjprestamos.backend.integration.hogaria.dto.HogariaPaymentResponse;
import com.cjprestamos.backend.integration.hogaria.service.HogariaIntegrationService;
import com.cjprestamos.backend.pago.model.enums.EstadoPago;
import com.cjprestamos.backend.prestamo.model.enums.EstadoPrestamo;
import com.cjprestamos.backend.prestamo.model.enums.FrecuenciaTipo;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(HogariaIntegrationController.class)
@Import(SecurityConfig.class)
class HogariaIntegrationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private HogariaIntegrationService hogariaIntegrationService;


        @Test
    void loansActivos_sinBasicAuth_deberiaResponder401() throws Exception {
        mockMvc.perform(get("/api/integration/hogaria/loans/active"))
            .andExpect(status().isUnauthorized());
    }



    @Test
    void health_sinBasicAuth_deberiaResponder401() throws Exception {
        mockMvc.perform(get("/api/integration/hogaria/health"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void loansActivosV1_sinBasicAuth_deberiaResponder401() throws Exception {
        mockMvc.perform(get("/api/v1/integration/hogaria/loans/active"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void loansActivos_credencialesInvalidas_deberiaResponder401() throws Exception {
        mockMvc.perform(get("/api/integration/hogaria/loans/active").with(httpBasic("bad", "creds")))
            .andExpect(status().isUnauthorized());
    }


    @Test
    @org.springframework.security.test.context.support.WithMockUser(roles = "INTEGRATION")
    void health_deberiaRetornarEstadoOk() throws Exception {
        mockMvc.perform(get("/api/integration/hogaria/health"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("OK"))
            .andExpect(jsonPath("$.detalle").isNotEmpty());
    }

    @Test
    @org.springframework.security.test.context.support.WithMockUser(roles = "INTEGRATION")
    void listarPrestamosActivos_credencialesValidas_deberiaRetornarContrato() throws Exception {
        when(hogariaIntegrationService.listarPrestamosActivos()).thenReturn(List.of(
            new HogariaLoanActiveResponse(
                7L, 2L, "Maria", new BigDecimal("1000.00"), 10,
                FrecuenciaTipo.MENSUAL, EstadoPrestamo.ACTIVO,
                new BigDecimal("500.00"), new BigDecimal("700.00"),
                new BigDecimal("100.00"), new BigDecimal("200.00"),
                LocalDateTime.of(2026, 1, 1, 9, 0),
                LocalDateTime.of(2026, 1, 2, 9, 0)
            )
        ));

        mockMvc.perform(get("/api/integration/hogaria/loans/active"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$[0].id").value(7))
            .andExpect(jsonPath("$[0].personaId").value(2))
            .andExpect(jsonPath("$[0].personaNombre").value("Maria"))
            .andExpect(jsonPath("$[0].estado").value("ACTIVO"))
            .andExpect(jsonPath("$[0].montoInicial").isNumber())
            .andExpect(jsonPath("$[0].totalCobrado").isNumber())
            .andExpect(jsonPath("$[0].totalPendiente").isNumber())
            .andExpect(jsonPath("$[0].gananciaRealizada").isNumber())
            .andExpect(jsonPath("$[0].gananciaProyectada").isNumber())
            .andExpect(jsonPath("$[0].createdAt").value("2026-01-01T09:00:00"))
            .andExpect(jsonPath("$[0].updatedAt").value("2026-01-02T09:00:00"));
    }

    @Test
    @org.springframework.security.test.context.support.WithMockUser(roles = "INTEGRATION")
    void obtenerDashboard_deberiaRetornarMetricasDecimalesYCamposControlados() throws Exception {
        when(hogariaIntegrationService.obtenerDashboard()).thenReturn(
            new HogariaDashboardResponse(
                new BigDecimal("1500.00"),
                new BigDecimal("100.00"),
                new BigDecimal("300.00"),
                new BigDecimal("1200.00"),
                3L
            )
        );

        mockMvc.perform(get("/api/integration/hogaria/dashboard"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.montoInvertido").isNumber())
            .andExpect(jsonPath("$.montoGanado").isNumber())
            .andExpect(jsonPath("$.montoPorGanar").isNumber())
            .andExpect(jsonPath("$.deudaTotal").isNumber())
            .andExpect(jsonPath("$.prestamosActivos").value(3))
            .andExpect(jsonPath("$.montoInvertido").isNotEmpty())
            .andExpect(jsonPath("$.prestamosActivos").isNotEmpty());
    }

    @Test
    @org.springframework.security.test.context.support.WithMockUser(roles = "INTEGRATION")
    void obtenerControlCaja_deberiaRetornarEstructuraEstable() throws Exception {
        when(hogariaIntegrationService.obtenerControlCaja()).thenReturn(
            new HogariaCashControlResponse(
                new BigDecimal("1200.00"), new BigDecimal("1800.00"), new BigDecimal("900.00"),
                new BigDecimal("900.00"), new BigDecimal("150.00"), new BigDecimal("300.00"),
                new BigDecimal("450.00"), new BigDecimal("120.00"), new BigDecimal("330.00"),
                new BigDecimal("200.00"), new BigDecimal("350.00"), new BigDecimal("500.00"),
                new BigDecimal("80.00"), 5L, 1L, new BigDecimal("50.00"), new BigDecimal("16.67")
            )
        );

        mockMvc.perform(get("/api/integration/hogaria/control-caja"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.cajaDisponible").isNumber())
            .andExpect(jsonPath("$.inversionActiva").isNumber())
            .andExpect(jsonPath("$.capitalRecuperado").isNumber())
            .andExpect(jsonPath("$.cuotasPendientes").value(5))
            .andExpect(jsonPath("$.cuotasVencenProximos7Dias").value(1));
    }

    @Test
    @org.springframework.security.test.context.support.WithMockUser(roles = "INTEGRATION")
    void listarCuotas_prestamoConCuotas_deberiaRetornarLista() throws Exception {
        when(hogariaIntegrationService.listarCuotasPorPrestamo(7L)).thenReturn(List.of(
            new HogariaInstallmentResponse(
                1L, 7L, 1,
                LocalDate.of(2026, 6, 1),
                new BigDecimal("120.00"), new BigDecimal("20.00"),
                new BigDecimal("100.00"), EstadoCuota.PARCIAL
            )
        ));

        mockMvc.perform(get("/api/integration/hogaria/loans/7/installments"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$[0].saldoPendiente").value(100.00));
    }

    @Test
    @org.springframework.security.test.context.support.WithMockUser(roles = "INTEGRATION")
    void listarCuotas_prestamoSinCuotas_deberiaRetornarListaVacia() throws Exception {
        when(hogariaIntegrationService.listarCuotasPorPrestamo(8L)).thenReturn(List.of());

        mockMvc.perform(get("/api/integration/hogaria/loans/8/installments"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    @org.springframework.security.test.context.support.WithMockUser(roles = "INTEGRATION")
    void listarCuotas_prestamoInexistente_deberiaRetornarListaVacia() throws Exception {
        when(hogariaIntegrationService.listarCuotasPorPrestamo(999L)).thenReturn(List.of());

        mockMvc.perform(get("/api/integration/hogaria/loans/999/installments"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    @org.springframework.security.test.context.support.WithMockUser(roles = "INTEGRATION")
    void listarPagos_prestamoConPagos_deberiaRetornarPagos() throws Exception {
        when(hogariaIntegrationService.listarPagosPorPrestamo(7L)).thenReturn(List.of(
            new HogariaPaymentResponse(
                10L, 7L, LocalDate.of(2026, 5, 10),
                new BigDecimal("300.00"), new BigDecimal("300.00"), new BigDecimal("0.00"), "TRX-1", "Pago parcial", EstadoPago.REGISTRADO
            )
        ));

        mockMvc.perform(get("/api/integration/hogaria/loans/7/payments"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].referenciaManual").value("TRX-1"))
            .andExpect(jsonPath("$[0].principalRecovered").value(300.00))
            .andExpect(jsonPath("$[0].interestCollected").value(0.00))
            .andExpect(jsonPath("$[0].fechaPago").value("2026-05-10"))
            .andExpect(jsonPath("$[0].estado").value("REGISTRADO"));
    }

    @Test
    @org.springframework.security.test.context.support.WithMockUser(roles = "INTEGRATION")
    void listarPagos_prestamoSinPagos_deberiaRetornarListaVacia() throws Exception {
        when(hogariaIntegrationService.listarPagosPorPrestamo(8L)).thenReturn(List.of());

        mockMvc.perform(get("/api/integration/hogaria/loans/8/payments"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    @org.springframework.security.test.context.support.WithMockUser(roles = "INTEGRATION")
    void listarPagos_prestamoInexistente_deberiaRetornarListaVacia() throws Exception {
        when(hogariaIntegrationService.listarPagosPorPrestamo(999L)).thenReturn(List.of());

        mockMvc.perform(get("/api/integration/hogaria/loans/999/payments"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());
    }


    @Test
    @org.springframework.security.test.context.support.WithMockUser(roles = "INTEGRATION")
    void obtenerDashboard_v1_deberiaRetornarMismaEstructuraQueAliasActual() throws Exception {
        when(hogariaIntegrationService.obtenerDashboard()).thenReturn(
            new HogariaDashboardResponse(
                new BigDecimal("1500.00"),
                new BigDecimal("100.00"),
                new BigDecimal("300.00"),
                new BigDecimal("1200.00"),
                3L
            )
        );

        mockMvc.perform(get("/api/v1/integration/hogaria/dashboard"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.montoInvertido").isNumber())
            .andExpect(jsonPath("$.prestamosActivos").value(3));
    }

    @Test
    @org.springframework.security.test.context.support.WithMockUser(roles = "INTEGRATION")
    void listarCuotas_v1_deberiaDelegarAlMismoService() throws Exception {
        when(hogariaIntegrationService.listarCuotasPorPrestamo(7L)).thenReturn(List.of(
            new HogariaInstallmentResponse(
                1L, 7L, 1,
                LocalDate.of(2026, 6, 1),
                new BigDecimal("120.00"), new BigDecimal("20.00"),
                new BigDecimal("100.00"), EstadoCuota.PARCIAL
            )
        ));

        mockMvc.perform(get("/api/v1/integration/hogaria/loans/7/installments"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].prestamoId").value(7));
    }


    @Test
    @org.springframework.security.test.context.support.WithMockUser(roles = "INTEGRATION")
    void prefijoV1_deberiaMantenerContratoEnEndpointsRestantes() throws Exception {
        when(hogariaIntegrationService.listarPrestamosActivos()).thenReturn(List.of(
            new HogariaLoanActiveResponse(
                11L, 3L, "Juana", new BigDecimal("2500.00"), 12,
                FrecuenciaTipo.MENSUAL, EstadoPrestamo.ACTIVO,
                new BigDecimal("1000.00"), new BigDecimal("1800.00"),
                new BigDecimal("200.00"), new BigDecimal("400.00"),
                LocalDateTime.of(2026, 2, 1, 8, 0),
                LocalDateTime.of(2026, 2, 2, 9, 30)
            )
        ));
        when(hogariaIntegrationService.obtenerControlCaja()).thenReturn(
            new HogariaCashControlResponse(
                new BigDecimal("1.00"), new BigDecimal("2.00"), new BigDecimal("3.00"),
                new BigDecimal("4.00"), new BigDecimal("5.00"), new BigDecimal("6.00"),
                new BigDecimal("7.00"), new BigDecimal("8.00"), new BigDecimal("9.00"),
                new BigDecimal("10.00"), new BigDecimal("11.00"), new BigDecimal("12.00"),
                new BigDecimal("13.00"), 14L, 15L, new BigDecimal("16.00"), new BigDecimal("17.00")
            )
        );
        when(hogariaIntegrationService.listarPagosPorPrestamo(11L)).thenReturn(List.of(
            new HogariaPaymentResponse(
                21L, 11L, LocalDate.of(2026, 3, 10),
                new BigDecimal("350.00"), new BigDecimal("320.00"), new BigDecimal("30.00"),
                "TRX-V1", "Pago test", EstadoPago.REGISTRADO
            )
        ));

        mockMvc.perform(get("/api/v1/integration/hogaria/loans/active"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].id").value(11))
            .andExpect(jsonPath("$[0].frecuenciaTipo").value("MENSUAL"));

        mockMvc.perform(get("/api/v1/integration/hogaria/control-caja"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.cuotasPendientes").value(14));

        mockMvc.perform(get("/api/v1/integration/hogaria/loans/11/payments"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].principalRecovered").value(320.00))
            .andExpect(jsonPath("$[0].interestCollected").value(30.00));
    }

    @Test
    @org.springframework.security.test.context.support.WithMockUser(roles = "INTEGRATION")
    void headersContextoHogaria_noDebenRomperRequests() throws Exception {
        when(hogariaIntegrationService.obtenerDashboard()).thenReturn(
            new HogariaDashboardResponse(
                new BigDecimal("1500.00"),
                new BigDecimal("100.00"),
                new BigDecimal("300.00"),
                new BigDecimal("1200.00"),
                3L
            )
        );

        mockMvc.perform(get("/api/integration/hogaria/dashboard")
                .header("X-Profile-Id", "profile-77")
                .header("X-User-Id", "user-44"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.prestamosActivos").value(3));
    }

}
