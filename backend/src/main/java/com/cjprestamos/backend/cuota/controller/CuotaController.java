package com.cjprestamos.backend.cuota.controller;

import com.cjprestamos.backend.cuota.dto.CuotaResponse;
import com.cjprestamos.backend.cuota.dto.GenerarCuotasRequest;
import com.cjprestamos.backend.cuota.service.CuotaService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/prestamos/{prestamoId}/cuotas")
public class CuotaController {

    private final CuotaService cuotaService;

    public CuotaController(CuotaService cuotaService) {
        this.cuotaService = cuotaService;
    }

    @PostMapping("/generar")
    @ResponseStatus(HttpStatus.CREATED)
    public List<CuotaResponse> generar(@PathVariable Long prestamoId, @RequestBody(required = false) GenerarCuotasRequest request) {
        return cuotaService.generar(prestamoId, request);
    }

    @GetMapping
    public List<CuotaResponse> listar(@PathVariable Long prestamoId) {
        return cuotaService.listarPorPrestamo(prestamoId);
    }
}
