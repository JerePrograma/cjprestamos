package com.cjprestamos.backend.reporte.controller;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.cjprestamos.backend.config.SecurityConfig;
import com.cjprestamos.backend.dashboard.dto.DashboardControlCajaResponse;
import com.cjprestamos.backend.reporte.dto.ReporteDashboardData;
import com.cjprestamos.backend.reporte.dto.ReporteDashboardData.ReporteCarteraRiesgo;
import com.cjprestamos.backend.reporte.dto.ReporteDashboardData.ReporteCobrosEsperadosPeriodo;
import com.cjprestamos.backend.reporte.dto.ReporteDashboardData.ReporteResumenEjecutivo;
import com.cjprestamos.backend.reporte.service.ReporteDashboardPdfService;
import com.cjprestamos.backend.reporte.service.ReporteDashboardService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

@WebMvcTest(ReporteDashboardController.class)
@Import(SecurityConfig.class)
class ReporteDashboardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ReporteDashboardService reporteDashboardService;

    @MockBean
    private ReporteDashboardPdfService reporteDashboardPdfService;

    @Test
    @WithMockUser(username = "operadora", roles = "OPERADORA")
    void exportarDashboardPdf_deberiaRetornarPdfConHeadersDeDescarga() throws Exception {
        LocalDate desde = LocalDate.of(2026, 5, 1);
        LocalDate hasta = LocalDate.of(2026, 5, 31);
        ReporteDashboardData reporte = reporte(desde, hasta);
        byte[] pdf = new byte[]{'%', 'P', 'D', 'F', '-'};

        when(reporteDashboardService.obtenerReporte(eq(desde), eq(hasta), eq("operadora"))).thenReturn(reporte);
        when(reporteDashboardPdfService.generarPdf(reporte)).thenReturn(pdf);

        mockMvc.perform(get("/api/v1/reportes/dashboard/pdf")
                .param("desde", "2026-05-01")
                .param("hasta", "2026-05-31"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_PDF))
            .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION, containsString("attachment")))
            .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION, containsString("cjprestamos-dashboard-20260501-20260531.pdf")))
            .andExpect(content().bytes(pdf));
    }

    @Test
    @WithMockUser(username = "operadora", roles = "OPERADORA")
    void exportarDashboardPdf_conRangoInvalido_deberiaRetornarBadRequest() throws Exception {
        LocalDate desde = LocalDate.of(2026, 6, 1);
        LocalDate hasta = LocalDate.of(2026, 5, 31);
        when(reporteDashboardService.obtenerReporte(eq(desde), eq(hasta), eq("operadora")))
            .thenThrow(new ResponseStatusException(HttpStatus.BAD_REQUEST, "desde no puede ser posterior a hasta"));

        mockMvc.perform(get("/api/v1/reportes/dashboard/pdf")
                .param("desde", "2026-06-01")
                .param("hasta", "2026-05-31"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.message").value("desde no puede ser posterior a hasta"));
    }

    private ReporteDashboardData reporte(LocalDate desde, LocalDate hasta) {
        return new ReporteDashboardData(
            desde,
            hasta,
            LocalDateTime.of(2026, 5, 20, 11, 45),
            "operadora",
            new ReporteResumenEjecutivo(
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                0L,
                0L,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO
            ),
            cobrosEsperadosVacios(),
            snapshotCero(),
            new ReporteCarteraRiesgo(0L, 0L, BigDecimal.ZERO, 0L, 0L, List.of(), List.of()),
            List.of(),
            List.of(),
            List.of("Sin observaciones automáticas relevantes para el período.")
        );
    }

    private ReporteCobrosEsperadosPeriodo cobrosEsperadosVacios() {
        return new ReporteCobrosEsperadosPeriodo(
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            BigDecimal.ZERO,
            0L,
            0L,
            0L,
            List.of()
        );
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
}
