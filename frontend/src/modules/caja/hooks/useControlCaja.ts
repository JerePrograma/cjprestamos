import { useQuery } from '@tanstack/react-query';
import { obtenerControlCajaDashboard } from '../api/controlCajaApi';

const QUERY_KEY_CAJA = ['dashboard', 'control-caja'];

export function useControlCajaDashboard() {
  return useQuery({
    queryKey: QUERY_KEY_CAJA,
    queryFn: obtenerControlCajaDashboard,
    refetchInterval: 120_000,
  });
}
