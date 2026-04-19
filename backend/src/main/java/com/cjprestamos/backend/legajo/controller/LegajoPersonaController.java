package com.cjprestamos.backend.legajo.controller;

import com.cjprestamos.backend.legajo.dto.LegajoPersonaRequest;
import com.cjprestamos.backend.legajo.dto.LegajoPersonaResponse;
import com.cjprestamos.backend.legajo.service.LegajoPersonaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/personas/{personaId}/legajo")
public class LegajoPersonaController {

    private final LegajoPersonaService legajoPersonaService;

    public LegajoPersonaController(LegajoPersonaService legajoPersonaService) {
        this.legajoPersonaService = legajoPersonaService;
    }

    @GetMapping
    public LegajoPersonaResponse obtener(@PathVariable Long personaId) {
        return legajoPersonaService.obtenerPorPersonaId(personaId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LegajoPersonaResponse crear(@PathVariable Long personaId, @Valid @RequestBody LegajoPersonaRequest request) {
        return legajoPersonaService.crear(personaId, request);
    }

    @PutMapping
    public LegajoPersonaResponse actualizar(@PathVariable Long personaId, @Valid @RequestBody LegajoPersonaRequest request) {
        return legajoPersonaService.actualizar(personaId, request);
    }
}
