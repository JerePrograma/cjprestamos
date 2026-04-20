import { formatearMonedaSinCentavos } from '../../../utils/moneda';
import { obtenerMensajeErrorApi } from '../../../services/apiError';
import type { FrecuenciaTipo, PrestamoResponse } from '../types/prestamo';

export function formatearMoneda(valor?: number) {
  return formatearMonedaSinCentavos(valor);
}

export function formatearFecha(valor: string | null) {
  if (!valor) {
    return 'Sin fecha';
  }

  return new Date(`${valor}T00:00:00`).toLocaleDateString('es-AR');
}

export function etiquetaFrecuencia(
  frecuenciaTipo: FrecuenciaTipo,
  frecuenciaCadaDias: number | null,
) {
  if (frecuenciaTipo === 'CADA_X_DIAS') {
    return `Cada ${frecuenciaCadaDias ?? '-'} días`;
  }

  if (frecuenciaTipo === 'FECHAS_MANUALES') {
    return 'Fechas manuales';
  }

  return 'Mensual';
}

export function etiquetaEstado(estado: PrestamoResponse['estado']) {
  if (estado === 'ACTIVO') {
    return 'bg-emerald-100 text-emerald-800';
  }

  if (estado === 'FINALIZADO') {
    return 'bg-slate-200 text-slate-700';
  }

  if (estado === 'RENEGOCIADO') {
    return 'bg-amber-100 text-amber-800';
  }

  return 'bg-red-100 text-red-700';
}

export function obtenerMensajeError(error: unknown, fallback: string) {
  return obtenerMensajeErrorApi(error, fallback);
}
