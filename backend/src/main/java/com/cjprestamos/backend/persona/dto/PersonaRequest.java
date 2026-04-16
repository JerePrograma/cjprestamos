package com.cjprestamos.backend.persona.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record PersonaRequest(
    @NotBlank @Size(max = 120) String nombre,
    @Size(max = 80) String alias,
    @Size(max = 40) String telefono,
    @Size(max = 300) String observacionRapida,
    @Size(max = 30) String colorReferencia,
    @NotNull Boolean cobraEnFecha,
    @NotNull Boolean tieneIngresoExtra,
    @NotNull Boolean activo
) {
}
