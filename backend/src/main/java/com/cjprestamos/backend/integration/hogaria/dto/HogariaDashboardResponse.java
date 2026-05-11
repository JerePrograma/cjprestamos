package com.cjprestamos.backend.integration.hogaria.dto;

import java.math.BigDecimal;

public record HogariaDashboardResponse(
    BigDecimal montoInvertido,
    BigDecimal montoGanado,
    BigDecimal montoPorGanar,
    BigDecimal deudaTotal,
    long prestamosActivos
) {
}
