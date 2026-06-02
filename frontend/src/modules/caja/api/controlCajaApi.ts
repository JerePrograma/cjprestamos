import { api } from '../../../shared/api/httpClient';
import type { DashboardControlCaja } from '../types/controlCaja';

export async function obtenerControlCajaDashboard(): Promise<DashboardControlCaja> {
  const response = await api.get<DashboardControlCaja>('/dashboard/control-caja');
  return response.data;
}
