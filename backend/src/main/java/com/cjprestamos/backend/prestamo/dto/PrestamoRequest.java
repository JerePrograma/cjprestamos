package com.cjprestamos.backend.prestamo.dto;

import com.cjprestamos.backend.prestamo.model.enums.EstadoPrestamo;
import com.cjprestamos.backend.prestamo.model.enums.FrecuenciaTipo;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

public record PrestamoRequest(
    @NotNull Long personaId,
    @NotNull @DecimalMin(value = "0.01") BigDecimal montoInicial,
    @DecimalMin(value = "0.00")
    BigDecimal porcentajeFijoSugerido,
    @DecimalMin(value = "0.00")
    BigDecimal interesManualOpcional,
    @NotNull @Positive Integer cantidadCuotas,
    @NotNull FrecuenciaTipo frecuenciaTipo,
    @Positive Integer frecuenciaCadaDias,
    LocalDate fechaBase,
    @NotNull Boolean usarFechasManuales,
    @Size(max = 80) String referenciaCodigo,
    @Size(max = 600) String observaciones,
    @NotNull EstadoPrestamo estado
) {
}
