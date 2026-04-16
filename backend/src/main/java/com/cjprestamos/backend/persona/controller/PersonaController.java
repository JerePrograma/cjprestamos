package com.cjprestamos.backend.persona.controller;

import com.cjprestamos.backend.persona.dto.PersonaRequest;
import com.cjprestamos.backend.persona.dto.PersonaResponse;
import com.cjprestamos.backend.persona.service.PersonaService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/personas")
public class PersonaController {

    private final PersonaService personaService;

    public PersonaController(PersonaService personaService) {
        this.personaService = personaService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PersonaResponse crear(@Valid @RequestBody PersonaRequest request) {
        return personaService.crear(request);
    }

    @GetMapping
    public List<PersonaResponse> listar() {
        return personaService.listar();
    }

    @GetMapping("/{id}")
    public PersonaResponse obtenerPorId(@PathVariable Long id) {
        return personaService.obtenerPorId(id);
    }

    @PutMapping("/{id}")
    public PersonaResponse actualizar(@PathVariable Long id, @Valid @RequestBody PersonaRequest request) {
        return personaService.actualizar(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        personaService.eliminar(id);
    }
}
