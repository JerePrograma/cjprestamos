package com.cjprestamos.backend.cuota.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

public record AjustarCuotasFuturasRequest(
        LocalDate fechaRenegociacion,
        @Size(max = 600) String observacionGeneral,
        @NotEmpty List<@Valid AjusteCuotaFuturaRequest> cuotas
) {
}
