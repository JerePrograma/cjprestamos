package com.cjprestamos.backend.dashboard.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.cjprestamos.backend.config.SecurityConfig;
import com.cjprestamos.backend.dashboard.dto.DashboardControlCajaResponse;
import com.cjprestamos.backend.dashboard.dto.DashboardResumenResponse;
import com.cjprestamos.backend.dashboard.service.DashboardService;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(DashboardController.class)
@Import(SecurityConfig.class)
class DashboardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DashboardService dashboardService;

    @Test
    @WithMockUser
    void obtenerResumen_deberiaRetornarResumenDashboard() throws Exception {
        when(dashboardService.obtenerResumen()).thenReturn(
            new DashboardResumenResponse(
                new BigDecimal("1500.00"),
                new BigDecimal("50.00"),
                new BigDecimal("250.00"),
                new BigDecimal("900.00"),
                2L
            )
        );

        mockMvc.perform(get("/api/dashboard/resumen"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.montoInvertido").value(1500.00))
            .andExpect(jsonPath("$.montoGanado").value(50.00))
            .andExpect(jsonPath("$.montoPorGanar").value(250.00))
            .andExpect(jsonPath("$.deudaTotal").value(900.00))
            .andExpect(jsonPath("$.prestamosActivos").value(2));
    }

    @Test
    @WithMockUser
    void obtenerControlCaja_deberiaRetornarMetricasContables() throws Exception {
        when(dashboardService.obtenerControlCaja()).thenReturn(
            new DashboardControlCajaResponse(
                new BigDecimal("1300.00"),
                new BigDecimal("1500.00"),
                new BigDecimal("1200.00"),
                new BigDecimal("300.00"),
                new BigDecimal("100.00"),
                new BigDecimal("220.00"),
                new BigDecimal("800.00"),
                new BigDecimal("500.00"),
                new BigDecimal("300.00"),
                new BigDecimal("150.00"),
                new BigDecimal("300.00"),
                new BigDecimal("470.00"),
                new BigDecimal("80.00"),
                6L,
                2L,
                new BigDecimal("80.00"),
                new BigDecimal("14.67")
            )
        );

        mockMvc.perform(get("/api/dashboard/control-caja"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.cajaDisponible").value(1300.00))
            .andExpect(jsonPath("$.inversionActiva").value(1500.00))
            .andExpect(jsonPath("$.gananciaProyectada").value(220.00))
            .andExpect(jsonPath("$.proyeccionCobro90Dias").value(470.00))
            .andExpect(jsonPath("$.cuotasPendientes").value(6))
            .andExpect(jsonPath("$.recuperoCapitalPorcentaje").value(80.00));
    }
}
