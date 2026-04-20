package com.cjprestamos.backend.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UsuarioPasswordRequest(
    @NotBlank @Size(min = 6, max = 120) String password
) {
}
