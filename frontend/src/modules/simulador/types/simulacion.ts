import type { FrecuenciaTipo } from '../../prestamos/types/prestamo';

export type SimulacionPrestamoPayload = {
  montoInicial: number;
  porcentajeFijoSugerido: number | null;
  interesManualOpcional: number | null;
  cantidadCuotas: number;
  frecuenciaTipo: FrecuenciaTipo;
  frecuenciaCadaDias: number | null;
  fechaPrimerVencimiento: string | null;
};

export type SimulacionCuota = {
  numeroCuota: number;
  fechaVencimiento: string | null;
  montoProgramado: number;
};

export type SimulacionPrestamoResponse = {
  montoInicial: number;
  interesAplicado: number;
  totalADevolver: number;
  montoPorCuotaEstimado: number;
  cantidadCuotas: number;
  cuotas: SimulacionCuota[];
};
