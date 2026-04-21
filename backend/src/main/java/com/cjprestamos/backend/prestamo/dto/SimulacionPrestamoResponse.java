package com.cjprestamos.backend.prestamo.dto;

import java.math.BigDecimal;
import java.util.List;

public record SimulacionPrestamoResponse(
    BigDecimal montoInicial,
    BigDecimal interesAplicado,
    BigDecimal totalADevolver,
    BigDecimal montoPorCuotaEstimado,
    Integer cantidadCuotas,
    List<SimulacionCuotaResponse> cuotas
) {
}
