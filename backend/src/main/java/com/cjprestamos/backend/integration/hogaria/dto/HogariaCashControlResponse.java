package com.cjprestamos.backend.integration.hogaria.dto;

import com.cjprestamos.backend.dashboard.dto.ProyeccionCobroPeriodoResponse;

import java.math.BigDecimal;
import java.util.List;

public record HogariaCashControlResponse(
    BigDecimal cajaDisponible,
    BigDecimal inversionActiva,
    BigDecimal capitalRecuperado,
    BigDecimal capitalPendiente,
    BigDecimal gananciaRealizada,
    BigDecimal gananciaProyectada,
    BigDecimal ingresosMesActual,
    BigDecimal egresosMesActual,
    BigDecimal balanceMesActual,
    List<ProyeccionCobroPeriodoResponse> proyeccionesCobro,
    BigDecimal carteraEnMora,
    long cuotasPendientes,
    long cuotasVencenProximos7Dias,
    BigDecimal recuperoCapitalPorcentaje,
    BigDecimal rendimientoEsperadoPorcentaje
) {
}
