package com.cjprestamos.backend.legajo.dto;

import java.time.LocalDateTime;

public record LegajoAdjuntoResponse(
    Long id,
    Long personaId,
    String nombreOriginal,
    String tipoContenido,
    long tamanoBytes,
    LocalDateTime createdAt
) {
}
