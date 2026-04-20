import { parsearMontoSinCentavos } from '../../../utils/moneda';

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

function obtenerFechaHoy() {
  const hoy = new Date();
  const year = hoy.getFullYear();
  const month = String(hoy.getMonth() + 1).padStart(2, "0");
  const day = String(hoy.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const formularioInicialPago: PagoFormulario = {
  fechaPago: obtenerFechaHoy(),
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
