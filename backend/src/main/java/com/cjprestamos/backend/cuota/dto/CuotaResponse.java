package com.cjprestamos.backend.cuota.dto;

import com.cjprestamos.backend.cuota.model.enums.EstadoCuota;
import java.math.BigDecimal;
import java.time.LocalDate;

public record CuotaResponse(
    Long id,
    Integer numeroCuota,
    LocalDate fechaVencimiento,
    BigDecimal montoProgramado,
    BigDecimal montoPagado,
    EstadoCuota estado
) {
}
