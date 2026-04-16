package com.cjprestamos.backend.prestamo.controller;

import com.cjprestamos.backend.prestamo.dto.PrestamoRequest;
import com.cjprestamos.backend.prestamo.dto.PrestamoResponse;
import com.cjprestamos.backend.prestamo.service.PrestamoService;
import jakarta.validation.Valid;
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
@RequestMapping("/api/prestamos")
public class PrestamoController {

    private final PrestamoService prestamoService;

    public PrestamoController(PrestamoService prestamoService) {
        this.prestamoService = prestamoService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PrestamoResponse crear(@Valid @RequestBody PrestamoRequest request) {
        return prestamoService.crear(request);
    }

    @GetMapping
    public List<PrestamoResponse> listar() {
        return prestamoService.listar();
    }

    @GetMapping("/{id}")
    public PrestamoResponse obtenerPorId(@PathVariable Long id) {
        return prestamoService.obtenerPorId(id);
    }

    @GetMapping("/activos")
    public List<PrestamoResponse> listarActivos() {
        return prestamoService.listarActivos();
    }
}
