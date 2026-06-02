import { api } from '../../../shared/api/httpClient';
import type { DashboardResumen } from '../types/dashboard';

export async function obtenerResumenDashboard(): Promise<DashboardResumen> {
  const response = await api.get<DashboardResumen>('/dashboard/resumen');
  return response.data;
}

