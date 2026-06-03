package com.cjprestamos.backend.reporte.service;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.cjprestamos.backend.dashboard.dto.DashboardControlCajaResponse;
import com.cjprestamos.backend.dashboard.dto.ProyeccionCobroPeriodoResponse;
import com.cjprestamos.backend.reporte.dto.ReporteDashboardData;
import com.cjprestamos.backend.reporte.dto.ReporteDashboardData.ReporteCarteraRiesgo;
import com.cjprestamos.backend.reporte.dto.ReporteDashboardData.ReporteCobrosEsperadosPeriodo;
import com.cjprestamos.backend.reporte.dto.ReporteDashboardData.ReporteResumenEjecutivo;
import com.lowagie.text.pdf.PdfReader;
import com.lowagie.text.pdf.parser.PdfTextExtractor;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;

class ReporteDashboardPdfServiceTest {

    private final ReporteDashboardPdfService reporteDashboardPdfService = new ReporteDashboardPdfService();

    @Test
    void generarPdf_deberiaRetornarBytesPdfNoVacios() throws IOException {
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
                cobrosEsperadosVacios(),
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

        String textoPdf = extraerTexto(pdf);

        assertTrue(textoPdf.contains("Cómo leer este reporte"));
        assertTrue(textoPdf.contains("Lectura rápida de caja"));
        assertTrue(textoPdf.contains("Cobros esperados dentro del período"));
        assertTrue(textoPdf.contains("No hay cuotas con vencimiento dentro del período seleccionado."));
        assertTrue(textoPdf.contains("Foto actual del negocio"));
        assertTrue(textoPdf.contains("Próximos 30 días"));
        assertTrue(textoPdf.contains("Días 31 a 60"));
        assertTrue(textoPdf.contains("Días 61 a 90"));
        assertTrue(textoPdf.contains("Deudas pendientes y atrasos"));
        assertTrue(textoPdf.contains("Movimientos del período"));
        assertTrue(textoPdf.contains("Observaciones automáticas"));
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
        LocalDate hoy = LocalDate.of(2026, 5, 20);

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
                List.of(
                        new ProyeccionCobroPeriodoResponse(
                                "0_30",
                                "Próximos 30 días",
                                hoy,
                                hoy.plusDays(30),
                                BigDecimal.ZERO
                        ),
                        new ProyeccionCobroPeriodoResponse(
                                "31_60",
                                "Días 31 a 60",
                                hoy.plusDays(31),
                                hoy.plusDays(60),
                                BigDecimal.ZERO
                        ),
                        new ProyeccionCobroPeriodoResponse(
                                "61_90",
                                "Días 61 a 90",
                                hoy.plusDays(61),
                                hoy.plusDays(90),
                                BigDecimal.ZERO
                        )
                ),
                BigDecimal.ZERO,
                0L,
                0L,
                BigDecimal.ZERO,
                BigDecimal.ZERO
        );
    }

    private String extraerTexto(byte[] pdf) throws IOException {
        PdfReader reader = new PdfReader(pdf);

        try {
            PdfTextExtractor extractor = new PdfTextExtractor(reader);
            StringBuilder texto = new StringBuilder();

            for (int pagina = 1; pagina <= reader.getNumberOfPages(); pagina++) {
                texto.append(extractor.getTextFromPage(pagina));
            }

            return texto.toString();
        } finally {
            reader.close();
        }
    }
}