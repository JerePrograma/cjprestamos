package com.cjprestamos.backend.cuota.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CuotaManualRequest(
    Integer numeroCuota,
    LocalDate fechaVencimiento,
    BigDecimal montoProgramado
) {
}
