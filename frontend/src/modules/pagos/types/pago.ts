export type EstadoPago = 'REGISTRADO' | 'ANULADO';

export type Pago = {
  id: number;
  prestamoId: number;
  fechaPago: string;
  monto: number;
  referencia: string | null;
  observacion: string | null;
  estado: EstadoPago;
  createdAt: string | null;
  updatedAt: string | null;
};

export type RegistroPagoPayload = {
  prestamoId: number;
  fechaPago: string;
  monto: number;
  referencia: string | null;
  observacion: string | null;
};

export type PagoFormulario = {
  fechaPago: string;
  monto: string;
  referencia: string;
  observacion: string;
};

function obtenerFechaHoy() {
  return new Date().toISOString().slice(0, 10);
}

export const formularioInicialPago: PagoFormulario = {
  fechaPago: obtenerFechaHoy(),
  monto: '',
  referencia: '',
  observacion: '',
};

export function crearPayloadPago(prestamoId: number, formulario: PagoFormulario): RegistroPagoPayload {
  return {
    prestamoId,
    fechaPago: formulario.fechaPago,
    monto: Number(formulario.monto),
    referencia: formulario.referencia.trim() || null,
    observacion: formulario.observacion.trim() || null,
  };
}
