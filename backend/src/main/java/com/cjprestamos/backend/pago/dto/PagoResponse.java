package com.cjprestamos.backend.pago.dto;

import com.cjprestamos.backend.pago.model.enums.EstadoPago;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record PagoResponse(
    Long id,
    Long prestamoId,
    LocalDate fechaPago,
    BigDecimal monto,
    String referencia,
    String observacion,
    EstadoPago estado,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
}
