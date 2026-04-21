package com.cjprestamos.backend.prestamo.dto;

import com.cjprestamos.backend.prestamo.model.enums.FrecuenciaTipo;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;

public record SimulacionPrestamoRequest(
    @NotNull @DecimalMin(value = "0.01") BigDecimal montoInicial,
    @DecimalMin(value = "0.00") BigDecimal porcentajeFijoSugerido,
    @DecimalMin(value = "0.00") BigDecimal interesManualOpcional,
    @NotNull @Positive Integer cantidadCuotas,
    @NotNull FrecuenciaTipo frecuenciaTipo,
    @Positive Integer frecuenciaCadaDias,
    LocalDate fechaPrimerVencimiento
) {
}
