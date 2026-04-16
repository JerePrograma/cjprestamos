package com.cjprestamos.backend.prestamo.dto;

import java.math.BigDecimal;

public record CalculoPrestamoResultado(
    BigDecimal interesAplicado,
    BigDecimal totalADevolver,
    BigDecimal cuotaSugerida,
    BigDecimal montoInvertido,
    BigDecimal montoGanadoEstimado,
    BigDecimal montoPorGanar
) {
}
