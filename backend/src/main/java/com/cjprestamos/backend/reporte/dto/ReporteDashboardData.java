package com.cjprestamos.backend.reporte.dto;

import com.cjprestamos.backend.dashboard.dto.DashboardControlCajaResponse;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record ReporteDashboardData(
    LocalDate desde,
    LocalDate hasta,
    LocalDateTime generadoEn,
    String usuarioAutenticado,
    ReporteResumenEjecutivo resumenEjecutivo,
    ReporteCobrosEsperadosPeriodo cobrosEsperadosPeriodo,
    DashboardControlCajaResponse snapshotControlCaja,
    ReporteCarteraRiesgo carteraRiesgo,
    List<ReporteMovimientoPrestamo> prestamosOtorgados,
    List<ReporteMovimientoPago> pagosRegistrados,
    List<String> observaciones
) {

    public record ReporteResumenEjecutivo(
        BigDecimal ingresosPeriodo,
        BigDecimal egresosPeriodo,
        BigDecimal balancePeriodo,
        long cantidadPagosRegistrados,
        long cantidadPrestamosOtorgados,
        BigDecimal montoTotalPrestado,
        BigDecimal montoPromedioPrestado,
        BigDecimal ticketPromedioPago
    ) {
    }

    public record ReporteCobrosEsperadosPeriodo(
        BigDecimal totalEsperado,
        BigDecimal totalPagado,
        BigDecimal totalPendiente,
        long cantidadCuotas,
        long cantidadCuotasCompletas,
        long cantidadCuotasPendientes,
        List<ReporteCuotaACobrar> cuotasACobrar
    ) {
    }

    public record ReporteCuotaACobrar(
        LocalDate fechaVencimiento,
        String persona,
        String prestamoReferencia,
        Integer numeroCuota,
        BigDecimal montoEsperado,
        BigDecimal montoPagado,
        BigDecimal montoPendiente,
        String estadoSimple
    ) {
    }

    public record ReporteCarteraRiesgo(
        long cuotasPendientesAlCierre,
        long cuotasVencidasAlHasta,
        BigDecimal montoTotalMoraAlHasta,
        long prestamosActivos,
        long prestamosFinalizadosCancelados,
        List<ReportePrestamoSaldo> prestamosMayorSaldoPendiente,
        List<ReporteCuotaVencida> cuotasVencidasRelevantes
    ) {
    }

    public record ReportePrestamoSaldo(
        String referencia,
        String persona,
        String estado,
        BigDecimal saldoPendiente
    ) {
    }

    public record ReporteCuotaVencida(
        LocalDate fechaVencimiento,
        String prestamoReferencia,
        String persona,
        Integer numeroCuota,
        BigDecimal montoPendiente
    ) {
    }

    public record ReporteMovimientoPrestamo(
        LocalDate fechaBase,
        String referencia,
        String persona,
        BigDecimal montoInicial,
        Integer cantidadCuotas,
        String estado
    ) {
    }

    public record ReporteMovimientoPago(
        LocalDate fecha,
        String persona,
        String prestamoReferencia,
        BigDecimal monto,
        String estado
    ) {
    }
}
