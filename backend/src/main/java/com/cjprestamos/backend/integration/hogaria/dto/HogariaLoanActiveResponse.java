package com.cjprestamos.backend.integration.hogaria.dto;

import com.cjprestamos.backend.prestamo.model.enums.EstadoPrestamo;
import com.cjprestamos.backend.prestamo.model.enums.FrecuenciaTipo;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record HogariaLoanActiveResponse(
    Long id,
    Long personaId,
    String personaNombre,
    BigDecimal montoInicial,
    Integer cantidadCuotas,
    FrecuenciaTipo frecuenciaTipo,
    EstadoPrestamo estado,
    BigDecimal totalCobrado,
    BigDecimal totalPendiente,
    BigDecimal gananciaRealizada,
    BigDecimal gananciaProyectada,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
}
