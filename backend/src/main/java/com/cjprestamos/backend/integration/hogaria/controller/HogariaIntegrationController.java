package com.cjprestamos.backend.integration.hogaria.controller;

import com.cjprestamos.backend.integration.hogaria.dto.HogariaCashControlResponse;
import com.cjprestamos.backend.integration.hogaria.dto.HogariaDashboardResponse;
import com.cjprestamos.backend.integration.hogaria.dto.HogariaInstallmentResponse;
import com.cjprestamos.backend.integration.hogaria.dto.HogariaIntegrationHealthResponse;
import com.cjprestamos.backend.integration.hogaria.dto.HogariaLoanActiveResponse;
import com.cjprestamos.backend.integration.hogaria.dto.HogariaPaymentResponse;
import com.cjprestamos.backend.integration.hogaria.service.HogariaIntegrationService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/v1/integration/hogaria", "/api/v1/integration/hogaria"})
public class HogariaIntegrationController {

    private final HogariaIntegrationService hogariaIntegrationService;

    public HogariaIntegrationController(HogariaIntegrationService hogariaIntegrationService) {
        this.hogariaIntegrationService = hogariaIntegrationService;
    }

    @GetMapping("/health")
    public HogariaIntegrationHealthResponse healthIntegracion() {
        return new HogariaIntegrationHealthResponse("OK", "Bridge HogarIA disponible y autenticado");
    }

    @GetMapping("/loans/active")
    public List<HogariaLoanActiveResponse> listarPrestamosActivos() {
        return hogariaIntegrationService.listarPrestamosActivos();
    }

    @GetMapping("/dashboard")
    public HogariaDashboardResponse obtenerDashboard() {
        return hogariaIntegrationService.obtenerDashboard();
    }

    @GetMapping("/control-caja")
    public HogariaCashControlResponse obtenerControlCaja() {
        return hogariaIntegrationService.obtenerControlCaja();
    }

    @GetMapping("/loans/{loanId}/installments")
    public List<HogariaInstallmentResponse> listarCuotas(@PathVariable Long loanId) {
        return hogariaIntegrationService.listarCuotasPorPrestamo(loanId);
    }

    @GetMapping("/loans/{loanId}/payments")
    public List<HogariaPaymentResponse> listarPagos(@PathVariable Long loanId) {
        return hogariaIntegrationService.listarPagosPorPrestamo(loanId);
    }
}
