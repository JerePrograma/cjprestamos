export type EstadoCuota = 'PENDIENTE' | 'PARCIAL' | 'PAGADA' | 'VENCIDA';

export type CuotaPrestamo = {
  id: number;
  numeroCuota: number;
  fechaVencimiento: string | null;
  fechaPago: string | null;
  montoProgramado: number;
  montoPagado: number;
  estado: EstadoCuota;
};

export type CuotaManualPayload = {
  numeroCuota: number;
  fechaVencimiento: string;
  montoProgramado: number;
};

export type GenerarCuotasPayload = {
  cuotasManuales?: CuotaManualPayload[];
};

export type AjusteCuotaFuturaPayload = {
  cuotaId: number;
  fechaVencimiento: string;
  montoProgramado: number;
  observacion?: string | null;
};

export type AjustarCuotasFuturasPayload = {
  fechaRenegociacion?: string | null;
  observacionGeneral?: string | null;
  cuotas: AjusteCuotaFuturaPayload[];
};

export type CuotaManualFila = {
  numeroCuota: string;
  fechaVencimiento: string;
  montoProgramado: string;
};

export type CuotaAjusteFila = {
  cuotaId: number;
  numeroCuota: number;
  fechaVencimiento: string;
  montoProgramado: string;
  montoPagado: number;
  estado: string;
};
