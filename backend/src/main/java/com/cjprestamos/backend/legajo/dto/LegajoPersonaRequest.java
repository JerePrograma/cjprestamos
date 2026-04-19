package com.cjprestamos.backend.legajo.dto;

import jakarta.validation.constraints.Size;

public record LegajoPersonaRequest(
    @Size(max = 300) String direccion,
    @Size(max = 120) String ocupacion,
    @Size(max = 200) String fuenteIngreso,
    @Size(max = 200) String contactoAlternativo,
    @Size(max = 600) String documentacionPendiente,
    @Size(max = 1200) String notasInternas,
    @Size(max = 1200) String observacionesGenerales
) {
}
