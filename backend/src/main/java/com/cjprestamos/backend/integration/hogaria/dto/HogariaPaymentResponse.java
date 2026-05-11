package com.cjprestamos.backend.integration.hogaria.dto;

import com.cjprestamos.backend.pago.model.enums.EstadoPago;
import java.math.BigDecimal;
import java.time.LocalDate;

public record HogariaPaymentResponse(
    Long id,
    Long prestamoId,
    LocalDate fechaPago,
    BigDecimal monto,
    String referenciaManual,
    String observaciones,
    EstadoPago estado
) {
}
