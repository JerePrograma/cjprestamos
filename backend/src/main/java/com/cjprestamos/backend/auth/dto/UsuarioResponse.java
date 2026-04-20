package com.cjprestamos.backend.auth.dto;

public record UsuarioResponse(
    Long id,
    String username,
    String rol,
    boolean activo
) {
}
