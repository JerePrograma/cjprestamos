package com.cjprestamos.backend.auth.dto;

import jakarta.validation.constraints.NotNull;

public record UsuarioEstadoRequest(@NotNull Boolean activo) {
}
