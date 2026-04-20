package com.cjprestamos.backend.cuota.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

public record AjusteCuotaFuturaRequest(
        @NotNull Long cuotaId,
        @NotNull LocalDate fechaVencimiento,
        @NotNull @DecimalMin(value = "0.01") BigDecimal montoProgramado,
        @Size(max = 300) String observacion
) {
}
