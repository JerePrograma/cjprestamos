import type { FrecuenciaTipo, PrestamoResponse } from "../types/prestamo";

export function formatearMoneda(valor?: number) {
  if (valor === undefined) {
    return "$ -";
  }

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(valor);
}

export function formatearFecha(valor: string | null) {
  if (!valor) {
    return "Sin fecha";
  }

  return new Date(`${valor}T00:00:00`).toLocaleDateString("es-AR");
}

export function etiquetaFrecuencia(
  frecuenciaTipo: FrecuenciaTipo,
  frecuenciaCadaDias: number | null,
) {
  if (frecuenciaTipo === "CADA_X_DIAS") {
    return `Cada ${frecuenciaCadaDias ?? "-"} días`;
  }

  if (frecuenciaTipo === "FECHAS_MANUALES") {
    return "Fechas manuales";
  }

  return "Mensual";
}

export function etiquetaEstado(estado: PrestamoResponse["estado"]) {
  if (estado === "ACTIVO") {
    return "bg-emerald-100 text-emerald-800";
  }

  if (estado === "FINALIZADO") {
    return "bg-slate-200 text-slate-700";
  }

  if (estado === "RENEGOCIADO") {
    return "bg-amber-100 text-amber-800";
  }

  return "bg-red-100 text-red-700";
}

export function obtenerMensajeError(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null) {
    const axiosError = error as {
      response?: {
        data?:
          | {
              message?: string;
              detail?: string;
              error?: string;
              title?: string;
              errors?: Array<{
                defaultMessage?: string;
                message?: string;
              }>;
              violations?: Array<{
                message?: string;
              }>;
            }
          | string;
      };
      message?: string;
    };

    const data = axiosError.response?.data;

    if (typeof data === "string" && data.trim()) {
      return data;
    }

    if (data && typeof data === "object") {
      if (typeof data.message === "string" && data.message.trim()) return data.message;
      if (typeof data.detail === "string" && data.detail.trim()) return data.detail;
      if (typeof data.error === "string" && data.error.trim()) return data.error;
      if (typeof data.title === "string" && data.title.trim()) return data.title;

      if (Array.isArray(data.errors) && data.errors.length > 0) {
        const primerError = data.errors[0];
        if (
          typeof primerError.defaultMessage === "string" &&
          primerError.defaultMessage.trim()
        ) {
          return primerError.defaultMessage;
        }
        if (typeof primerError.message === "string" && primerError.message.trim()) {
          return primerError.message;
        }
      }

      if (Array.isArray(data.violations) && data.violations.length > 0) {
        const primeraViolacion = data.violations[0];
        if (
          typeof primeraViolacion.message === "string" &&
          primeraViolacion.message.trim()
        ) {
          return primeraViolacion.message;
        }
      }
    }

    if (typeof axiosError.message === "string" && axiosError.message.trim()) {
      return axiosError.message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}
