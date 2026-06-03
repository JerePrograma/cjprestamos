package com.cjprestamos.backend.dashboard.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ProyeccionCobroPeriodoResponse(
        String codigo,
        String etiqueta,
        LocalDate desde,
        LocalDate hasta,
        BigDecimal monto
) {
}