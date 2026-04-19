export type FrecuenciaTipo = 'MENSUAL' | 'CADA_X_DIAS' | 'FECHAS_MANUALES';
export type EstadoPrestamo = 'ACTIVO' | 'FINALIZADO' | 'RENEGOCIADO' | 'CANCELADO';
export type EstadoCuota = 'PENDIENTE' | 'PARCIAL' | 'PAGADA' | 'VENCIDA';

export type PrestamoPayload = {
  personaId: number;
  montoInicial: number;
  porcentajeFijoSugerido: number | null;
  interesManualOpcional: number | null;
  cantidadCuotas: number;
  frecuenciaTipo: FrecuenciaTipo;
  frecuenciaCadaDias: number | null;
  fechaBase: string | null;
  usarFechasManuales: boolean;
  referenciaCodigo: string | null;
  observaciones: string | null;
  estado: EstadoPrestamo;
};

export type PrestamoResponse = PrestamoPayload & {
  id: number;
  createdAt: string | null;
  updatedAt: string | null;
};

export type ReferenciaPrestamoPayload = {
  referenciaCodigo: string | null;
  observaciones: string | null;
};

export type CuotaPrestamo = {
  id: number;
  numeroCuota: number;
  fechaVencimiento: string | null;
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

export type CalculoPrestamoPayload = {
  montoInicial: number;
  porcentajeFijoSugerido: number | null;
  interesManualOpcional: number | null;
  cantidadCuotas: number;
};

export type CalculoPrestamoResultado = {
  interesAplicado: number;
  totalADevolver: number;
  cuotaSugerida: number;
  montoInvertido: number;
  montoGanadoEstimado: number;
  montoPorGanar: number;
};

export type PrestamoFormulario = {
  personaId: string;
  montoInicial: string;
  porcentajeFijoSugerido: string;
  interesManualOpcional: string;
  cantidadCuotas: string;
  frecuenciaTipo: FrecuenciaTipo;
  frecuenciaCadaDias: string;
  fechaBase: string;
  usarFechasManuales: boolean;
  referenciaCodigo: string;
  observaciones: string;
  estado: EstadoPrestamo;
};

export const formularioInicialPrestamo: PrestamoFormulario = {
  personaId: '',
  montoInicial: '',
  porcentajeFijoSugerido: '',
  interesManualOpcional: '',
  cantidadCuotas: '',
  frecuenciaTipo: 'MENSUAL',
  frecuenciaCadaDias: '',
  fechaBase: '',
  usarFechasManuales: false,
  referenciaCodigo: '',
  observaciones: '',
  estado: 'ACTIVO',
};

function numeroOpcional(valor: string): number | null {
  const limpio = valor.trim();
  if (!limpio) return null;

  const numero = Number(limpio);
  return Number.isNaN(numero) ? null : numero;
}

export function crearPayloadPrestamo(formulario: PrestamoFormulario): PrestamoPayload {
  return {
    personaId: Number(formulario.personaId),
    montoInicial: Number(formulario.montoInicial),
    porcentajeFijoSugerido: numeroOpcional(formulario.porcentajeFijoSugerido),
    interesManualOpcional: numeroOpcional(formulario.interesManualOpcional),
    cantidadCuotas: Number(formulario.cantidadCuotas),
    frecuenciaTipo: formulario.frecuenciaTipo,
    frecuenciaCadaDias:
      formulario.frecuenciaTipo === 'CADA_X_DIAS' ? numeroOpcional(formulario.frecuenciaCadaDias) : null,
    fechaBase:
      formulario.frecuenciaTipo === 'FECHAS_MANUALES' && formulario.usarFechasManuales
        ? null
        : formulario.fechaBase || null,
    usarFechasManuales: formulario.usarFechasManuales,
    referenciaCodigo: formulario.referenciaCodigo.trim() || null,
    observaciones: formulario.observaciones.trim() || null,
    estado: formulario.estado,
  };
}

export function crearPayloadCalculo(formulario: PrestamoFormulario): CalculoPrestamoPayload {
  return {
    montoInicial: Number(formulario.montoInicial),
    porcentajeFijoSugerido: numeroOpcional(formulario.porcentajeFijoSugerido),
    interesManualOpcional: numeroOpcional(formulario.interesManualOpcional),
    cantidadCuotas: Number(formulario.cantidadCuotas),
  };
}
