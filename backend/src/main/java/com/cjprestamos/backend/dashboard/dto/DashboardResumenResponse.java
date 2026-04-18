package com.cjprestamos.backend.dashboard.dto;

import java.math.BigDecimal;

public record DashboardResumenResponse(
    BigDecimal montoInvertido,
    BigDecimal montoGanado,
    BigDecimal montoPorGanar,
    BigDecimal deudaTotal,
    long prestamosActivos
) {
}
