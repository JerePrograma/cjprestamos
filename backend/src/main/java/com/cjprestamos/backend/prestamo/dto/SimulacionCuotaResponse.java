package com.cjprestamos.backend.prestamo.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record SimulacionCuotaResponse(
    Integer numeroCuota,
    LocalDate fechaVencimiento,
    BigDecimal montoProgramado
) {
}
