package com.cjprestamos.backend.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UsuarioRequest(
    @NotBlank @Size(max = 60) String username,
    @NotBlank @Size(min = 6, max = 120) String password,
    @Size(max = 30) String rol
) {
}
