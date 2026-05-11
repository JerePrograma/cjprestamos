package com.cjprestamos.backend.integration.hogaria.dto;

import com.cjprestamos.backend.cuota.model.enums.EstadoCuota;
import java.math.BigDecimal;
import java.time.LocalDate;

public record HogariaInstallmentResponse(
    Long id,
    Long prestamoId,
    Integer numeroCuota,
    LocalDate fechaVencimiento,
    BigDecimal montoProgramado,
    BigDecimal montoPagado,
    BigDecimal saldoPendiente,
    EstadoCuota estado
) {
}
