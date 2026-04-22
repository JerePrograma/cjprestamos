export type DashboardResumen = {
  montoInvertido: number;
  montoGanado: number;
  montoPorGanar: number;
  deudaTotal: number;
  prestamosActivos: number;
};

export type DashboardControlCaja = {
  cajaDisponible: number;
  inversionActiva: number;
  capitalRecuperado: number;
  capitalPendiente: number;
  gananciaRealizada: number;
  gananciaProyectada: number;
  ingresosMesActual: number;
  egresosMesActual: number;
  balanceMesActual: number;
  proyeccionCobro30Dias: number;
  proyeccionCobro60Dias: number;
  proyeccionCobro90Dias: number;
  carteraEnMora: number;
  cuotasPendientes: number;
  cuotasVencenProximos7Dias: number;
  recuperoCapitalPorcentaje: number;
  rendimientoEsperadoPorcentaje: number;
};
