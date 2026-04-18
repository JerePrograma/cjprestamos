import { api } from '../api';
import type { DashboardResumen } from '../../modules/dashboard/types/dashboard';

export async function obtenerResumenDashboard(): Promise<DashboardResumen> {
  const response = await api.get<DashboardResumen>('/dashboard/resumen');
  return response.data;
}
