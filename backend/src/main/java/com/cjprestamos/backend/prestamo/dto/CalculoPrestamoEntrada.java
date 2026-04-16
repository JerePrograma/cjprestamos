package com.cjprestamos.backend.prestamo.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record CalculoPrestamoEntrada(
    @NotNull @DecimalMin(value = "0.01") BigDecimal montoInicial,
    @DecimalMin(value = "0.00") BigDecimal porcentajeFijoSugerido,
    @DecimalMin(value = "0.00") BigDecimal interesManualOpcional,
    @NotNull @Positive Integer cantidadCuotas
) {
}
