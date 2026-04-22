import { api } from '../api';
import type { DashboardControlCaja, DashboardResumen } from '../../modules/dashboard/types/dashboard';

export async function obtenerResumenDashboard(): Promise<DashboardResumen> {
  const response = await api.get<DashboardResumen>('/dashboard/resumen');
  return response.data;
}

export async function obtenerControlCajaDashboard(): Promise<DashboardControlCaja> {
  const response = await api.get<DashboardControlCaja>('/dashboard/control-caja');
  return response.data;
}
