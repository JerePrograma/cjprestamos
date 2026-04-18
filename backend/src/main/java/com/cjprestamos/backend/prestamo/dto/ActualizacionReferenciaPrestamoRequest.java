package com.cjprestamos.backend.prestamo.dto;

import jakarta.validation.constraints.Size;

public record ActualizacionReferenciaPrestamoRequest(
    @Size(max = 80) String referenciaCodigo,
    @Size(max = 600) String observaciones
) {
}
