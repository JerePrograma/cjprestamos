import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ajustarCuotasFuturasPrestamo,
  generarCuotasPrestamo,
  obtenerCuotasPorPrestamo,
} from '../api/cuotasApi';
import type { AjustarCuotasFuturasPayload, GenerarCuotasPayload } from '../types/cuota';

const QUERY_KEY_PRESTAMOS = ['prestamos'];
const QUERY_KEY_DASHBOARD = ['dashboard'];

export function useCuotasPrestamo(id: number | null) {
  return useQuery({
    queryKey: [...QUERY_KEY_PRESTAMOS, id, 'cuotas'],
    queryFn: () => obtenerCuotasPorPrestamo(id as number),
    enabled: id !== null,
  });
}

export function useGenerarCuotasPrestamo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload?: GenerarCuotasPayload }) =>
      generarCuotasPrestamo(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY_PRESTAMOS, variables.id] });
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY_PRESTAMOS, variables.id, 'cuotas'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_PRESTAMOS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_DASHBOARD });
    },
  });
}

export function useAjustarCuotasFuturasPrestamo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AjustarCuotasFuturasPayload }) =>
      ajustarCuotasFuturasPrestamo(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY_PRESTAMOS, variables.id] });
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY_PRESTAMOS, variables.id, 'cuotas'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_PRESTAMOS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_DASHBOARD });
    },
  });
}
