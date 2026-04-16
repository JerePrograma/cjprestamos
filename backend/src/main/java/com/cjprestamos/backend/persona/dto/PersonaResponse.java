package com.cjprestamos.backend.persona.dto;

import java.time.LocalDateTime;

public record PersonaResponse(
    Long id,
    String nombre,
    String alias,
    String telefono,
    String observacionRapida,
    String colorReferencia,
    Boolean cobraEnFecha,
    boolean tieneIngresoExtra,
    boolean activo,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
}
