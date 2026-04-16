package com.cjprestamos.backend.prestamo.dto;

import java.math.BigDecimal;

public record CalculoPrestamoEntrada(
    BigDecimal montoInicial,
    BigDecimal porcentajeFijoSugerido,
    BigDecimal interesManualOpcional,
    Integer cantidadCuotas
) {
}
