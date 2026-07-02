package com.cjprestamos.backend.reporte.controller;

import com.cjprestamos.backend.reporte.dto.ReporteDashboardData;
import com.cjprestamos.backend.reporte.service.ReporteDashboardPdfService;
import com.cjprestamos.backend.reporte.service.ReporteDashboardService;
import java.security.Principal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/reportes/dashboard")
public class ReporteDashboardController {

    private static final DateTimeFormatter NOMBRE_ARCHIVO_FECHA = DateTimeFormatter.ofPattern("yyyyMMdd");

    private final ReporteDashboardService reporteDashboardService;
    private final ReporteDashboardPdfService reporteDashboardPdfService;

    public ReporteDashboardController(
        ReporteDashboardService reporteDashboardService,
        ReporteDashboardPdfService reporteDashboardPdfService
    ) {
        this.reporteDashboardService = reporteDashboardService;
        this.reporteDashboardPdfService = reporteDashboardPdfService;
    }

    @GetMapping(value = "/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> exportarDashboardPdf(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,
        Principal principal
    ) {
        ReporteDashboardData reporte = reporteDashboardService.obtenerReporte(
            desde,
            hasta,
            principal == null ? null : principal.getName()
        );
        byte[] pdf = reporteDashboardPdfService.generarPdf(reporte);
        String filename = "cjprestamos-dashboard-"
            + desde.format(NOMBRE_ARCHIVO_FECHA)
            + "-"
            + hasta.format(NOMBRE_ARCHIVO_FECHA)
            + ".pdf";

        return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_PDF)
            .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename(filename).build().toString())
            .body(pdf);
    }
}
