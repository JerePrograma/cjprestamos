package com.cjprestamos.backend.auth.service;

import com.cjprestamos.backend.auth.dto.UsuarioEstadoRequest;
import com.cjprestamos.backend.auth.dto.UsuarioPasswordRequest;
import com.cjprestamos.backend.auth.dto.UsuarioRequest;
import com.cjprestamos.backend.auth.dto.UsuarioResponse;
import com.cjprestamos.backend.auth.model.UsuarioSistema;
import com.cjprestamos.backend.auth.repository.UsuarioSistemaRepository;
import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UsuarioSistemaService {

    private final UsuarioSistemaRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioSistemaService(UsuarioSistemaRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponse> listar() {
        return usuarioRepository.findAll().stream().map(this::aResponse).toList();
    }

    @Transactional
    public UsuarioResponse crear(UsuarioRequest request) {
        String usernameNormalizado = normalizarUsername(request.username());
        if (usuarioRepository.existsByUsernameIgnoreCase(usernameNormalizado)) {
            throw new IllegalArgumentException("Ya existe un usuario con ese nombre.");
        }

        UsuarioSistema usuario = new UsuarioSistema();
        usuario.setUsername(usernameNormalizado);
        usuario.setPassword(passwordEncoder.encode(request.password().trim()));
        usuario.setRol(normalizarRol(request.rol()));
        usuario.setActivo(true);

        return aResponse(usuarioRepository.save(usuario));
    }

    @Transactional
    public UsuarioResponse actualizarPassword(Long id, UsuarioPasswordRequest request) {
        UsuarioSistema usuario = obtenerUsuario(id);
        usuario.setPassword(passwordEncoder.encode(request.password().trim()));
        return aResponse(usuarioRepository.save(usuario));
    }

    @Transactional
    public UsuarioResponse actualizarEstado(Long id, UsuarioEstadoRequest request) {
        UsuarioSistema usuario = obtenerUsuario(id);
        usuario.setActivo(request.activo());
        return aResponse(usuarioRepository.save(usuario));
    }

    private UsuarioSistema obtenerUsuario(Long id) {
        return usuarioRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado."));
    }

    private UsuarioResponse aResponse(UsuarioSistema usuario) {
        return new UsuarioResponse(usuario.getId(), usuario.getUsername(), usuario.getRol(), usuario.isActivo());
    }

    private String normalizarUsername(String username) {
        String valor = username == null ? "" : username.trim().toLowerCase();
        if (valor.isBlank()) {
            throw new IllegalArgumentException("El usuario es obligatorio.");
        }
        return valor;
    }

    private String normalizarRol(String rol) {
        String valor = rol == null ? "OPERADORA" : rol.trim().toUpperCase();
        return valor.isBlank() ? "OPERADORA" : valor;
    }
}
