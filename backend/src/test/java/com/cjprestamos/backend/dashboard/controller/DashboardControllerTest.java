package com.cjprestamos.backend.dashboard.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.cjprestamos.backend.config.SecurityConfig;
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
}
