import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { obtenerPagosPorPrestamo, registrarPago } from '../../../services/pagos/pagosApi';
import type { RegistroPagoPayload } from '../types/pago';

const QUERY_KEY_PRESTAMOS = ['prestamos'];
const QUERY_KEY_DASHBOARD = ['dashboard'];

export function usePagosPrestamo(prestamoId: number | null) {
  return useQuery({
    queryKey: [...QUERY_KEY_PRESTAMOS, prestamoId, 'pagos'],
    queryFn: () => obtenerPagosPorPrestamo(prestamoId as number),
    enabled: prestamoId !== null,
  });
}

export function useRegistrarPago() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegistroPagoPayload) => registrarPago(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_PRESTAMOS });
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY_PRESTAMOS, variables.prestamoId] });
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY_PRESTAMOS, variables.prestamoId, 'cuotas'] });
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY_PRESTAMOS, variables.prestamoId, 'pagos'] });
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY_PRESTAMOS, variables.prestamoId, 'resumen'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_DASHBOARD });
    },
  });
}
