package com.cjprestamos.backend.auth.controller;

import com.cjprestamos.backend.auth.dto.UsuarioEstadoRequest;
import com.cjprestamos.backend.auth.dto.UsuarioPasswordRequest;
import com.cjprestamos.backend.auth.dto.UsuarioRequest;
import com.cjprestamos.backend.auth.dto.UsuarioResponse;
import com.cjprestamos.backend.auth.service.UsuarioSistemaService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioSistemaController {

    private final UsuarioSistemaService usuarioService;

    public UsuarioSistemaController(UsuarioSistemaService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public List<UsuarioResponse> listar() {
        return usuarioService.listar();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UsuarioResponse crear(@Valid @RequestBody UsuarioRequest request) {
        return usuarioService.crear(request);
    }

    @PatchMapping("/{id}/password")
    public UsuarioResponse actualizarPassword(@PathVariable Long id, @Valid @RequestBody UsuarioPasswordRequest request) {
        return usuarioService.actualizarPassword(id, request);
    }

    @PatchMapping("/{id}/estado")
    public UsuarioResponse actualizarEstado(@PathVariable Long id, @Valid @RequestBody UsuarioEstadoRequest request) {
        return usuarioService.actualizarEstado(id, request);
    }
}
