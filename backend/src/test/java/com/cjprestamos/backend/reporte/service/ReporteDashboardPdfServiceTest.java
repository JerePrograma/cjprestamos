package com.cjprestamos.backend.reporte.service;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.cjprestamos.backend.dashboard.dto.DashboardControlCajaResponse;
import com.cjprestamos.backend.reporte.dto.ReporteDashboardData;
import com.cjprestamos.backend.reporte.dto.ReporteDashboardData.ReporteCarteraRiesgo;
import com.cjprestamos.backend.reporte.dto.ReporteDashboardData.ReporteResumenEjecutivo;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;

class ReporteDashboardPdfServiceTest {

    private final ReporteDashboardPdfService reporteDashboardPdfService = new ReporteDashboardPdfService();

    @Test
    void generarPdf_deberiaRetornarBytesPdfNoVacios() {
        ReporteDashboardData reporte = new ReporteDashboardData(
            LocalDate.of(2026, 5, 1),
            LocalDate.of(2026, 5, 31),
            LocalDateTime.of(2026, 5, 20, 11, 45),
            "operadora",
            new ReporteResumenEjecutivo(
                new BigDecimal("500.00"),
                new BigDecimal("1000.00"),
                new BigDecimal("-500.00"),
                1L,
                1L,
                new BigDecimal("1000.00"),
                new BigDecimal("1000.00"),
                new BigDecimal("500.00")
            ),
            snapshotCero(),
            new ReporteCarteraRiesgo(
                1L,
                1L,
                new BigDecimal("700.00"),
                1L,
                0L,
                List.of(),
                List.of()
            ),
            List.of(),
            List.of(),
            List.of("El balance del período fue negativo: hubo más egresos que ingresos registrados.")
        );

        byte[] pdf = reporteDashboardPdfService.generarPdf(reporte);

        assertTrue(pdf.length > 100);
        assertArrayEquals(new byte[]{'%', 'P', 'D', 'F'}, new byte[]{pdf[0], pdf[1], pdf[2], pdf[3]});
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
