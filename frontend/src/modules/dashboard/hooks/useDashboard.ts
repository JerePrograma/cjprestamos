import { useQuery } from '@tanstack/react-query';
import { obtenerResumenDashboard } from '../api/dashboardApi';

const QUERY_KEY_DASHBOARD = ['dashboard'];

export function useResumenDashboard() {
  return useQuery({
    queryKey: [...QUERY_KEY_DASHBOARD, 'resumen'],
    queryFn: obtenerResumenDashboard,
    refetchInterval: 120_000,
  });
}

