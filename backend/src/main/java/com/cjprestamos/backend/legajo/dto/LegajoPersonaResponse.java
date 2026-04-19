package com.cjprestamos.backend.legajo.dto;

import java.time.LocalDateTime;

public record LegajoPersonaResponse(
    Long id,
    Long personaId,
    String direccion,
    String ocupacion,
    String fuenteIngreso,
    String contactoAlternativo,
    String documentacionPendiente,
    String notasInternas,
    String observacionesGenerales,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
}
