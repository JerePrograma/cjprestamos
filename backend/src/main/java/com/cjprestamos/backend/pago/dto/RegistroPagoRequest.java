package com.cjprestamos.backend.pago.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

public record RegistroPagoRequest(
        @NotNull Long prestamoId,
        @NotNull LocalDate fechaPago,
        @NotNull @DecimalMin(value = "0.01") BigDecimal monto,
        @Size(max = 120) String referencia,
        @Size(max = 600) String observacion
) {}