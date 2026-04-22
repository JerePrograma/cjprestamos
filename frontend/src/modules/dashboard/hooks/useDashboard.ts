import { useQuery } from '@tanstack/react-query';
import { obtenerControlCajaDashboard, obtenerResumenDashboard } from '../../../services/dashboard/dashboardApi';

const QUERY_KEY_DASHBOARD = ['dashboard'];

export function useResumenDashboard() {
  return useQuery({
    queryKey: [...QUERY_KEY_DASHBOARD, 'resumen'],
    queryFn: obtenerResumenDashboard,
  });
}

export function useControlCajaDashboard() {
  return useQuery({
    queryKey: [...QUERY_KEY_DASHBOARD, 'control-caja'],
    queryFn: obtenerControlCajaDashboard,
  });
}
