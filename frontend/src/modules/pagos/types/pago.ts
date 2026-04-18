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
};

export type PagoFormulario = {
  fechaPago: string;
  monto: string;
  referencia: string;
  observacion: string;
};

function obtenerFechaHoy() {
  const hoy = new Date();
  const year = hoy.getFullYear();
  const month = String(hoy.getMonth() + 1).padStart(2, "0");
  const day = String(hoy.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parsearMonto(valor: string): number | null {
  const normalizado = valor.replace(",", ".").trim();

  if (!normalizado) {
    return null;
  }

  const numero = Number(normalizado);

  if (!Number.isFinite(numero) || numero <= 0) {
    return null;
  }

  return numero;
}

export const formularioInicialPago: PagoFormulario = {
  fechaPago: obtenerFechaHoy(),
  monto: "",
  referencia: "",
  observacion: "",
};

export function crearPayloadPago(
  prestamoId: number,
  formulario: PagoFormulario,
): RegistroPagoPayload {
  const monto = parsearMonto(formulario.monto);

  if (monto === null) {
    throw new Error("El monto ingresado no es válido.");
  }

  return {
    prestamoId,
    fechaPago: formulario.fechaPago,
    monto,
    referencia: formulario.referencia.trim() || null,
    observacion: formulario.observacion.trim() || null,
  };
}