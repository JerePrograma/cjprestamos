package com.cjprestamos.backend.prestamo.dto;

import com.cjprestamos.backend.prestamo.model.enums.EstadoPrestamo;
import com.cjprestamos.backend.prestamo.model.enums.FrecuenciaTipo;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record PrestamoResponse(
    Long id,
    Long personaId,
    BigDecimal montoInicial,
    BigDecimal porcentajeFijoSugerido,
    BigDecimal interesManualOpcional,
    Integer cantidadCuotas,
    FrecuenciaTipo frecuenciaTipo,
    Integer frecuenciaCadaDias,
    LocalDate fechaBase,
    boolean usarFechasManuales,
    String referenciaCodigo,
    String observaciones,
    EstadoPrestamo estado,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
}
