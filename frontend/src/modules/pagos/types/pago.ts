import { parsearMontoSinCentavos } from '../../../shared/lib/money';
import { obtenerFechaHoyLocal } from '../../../shared/lib/dates';

export type EstadoPago = "REGISTRADO" | "ANULADO";

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
  cuotasSeleccionadas?: number[];
};

export type PagoFormulario = {
  fechaPago: string;
  monto: string;
  referencia: string;
  observacion: string;
  cuotasSeleccionadas: number[];
};

export const formularioInicialPago: PagoFormulario = {
  fechaPago: obtenerFechaHoyLocal(),
  monto: "",
  referencia: "",
  observacion: "",
  cuotasSeleccionadas: [],
};

export function crearPayloadPago(
  prestamoId: number,
  formulario: PagoFormulario,
): RegistroPagoPayload {
  const monto = parsearMontoSinCentavos(formulario.monto);

  if (monto === null) {
    throw new Error("El monto ingresado no es válido.");
  }

  const payload: RegistroPagoPayload = {
    prestamoId,
    fechaPago: formulario.fechaPago,
    monto,
    referencia: formulario.referencia.trim() || null,
    observacion: formulario.observacion.trim() || null,
  };

  if (formulario.cuotasSeleccionadas.length > 0) {
    payload.cuotasSeleccionadas = formulario.cuotasSeleccionadas;
  }

  return payload;
}
