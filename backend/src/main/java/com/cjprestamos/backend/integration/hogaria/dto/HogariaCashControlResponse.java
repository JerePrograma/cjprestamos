package com.cjprestamos.backend.integration.hogaria.dto;

import java.math.BigDecimal;

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
    BigDecimal proyeccionCobro30Dias,
    BigDecimal proyeccionCobro60Dias,
    BigDecimal proyeccionCobro90Dias,
    BigDecimal carteraEnMora,
    long cuotasPendientes,
    long cuotasVencenProximos7Dias,
    BigDecimal recuperoCapitalPorcentaje,
    BigDecimal rendimientoEsperadoPorcentaje
) {
}
