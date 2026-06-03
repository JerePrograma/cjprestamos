import { api } from '../../../shared/api/httpClient';
import type { DashboardResumen } from '../types/dashboard';

export async function obtenerResumenDashboard(): Promise<DashboardResumen> {
  const response = await api.get<DashboardResumen>('/dashboard/resumen');
  return response.data;
}

export async function exportarDashboardPdf(desde: string, hasta: string): Promise<Blob> {
  const response = await api.get<Blob>('/reportes/dashboard/pdf', {
    params: { desde, hasta },
    responseType: 'blob',
    timeout: 30_000,
  });

  return response.data;
}
