import { useMutation, useQueryClient } from '@tanstack/react-query';
import { calcularPrestamo, crearPrestamo } from '../../../services/prestamos/prestamosApi';
import type { CalculoPrestamoPayload, PrestamoPayload } from '../types/prestamo';

const QUERY_KEY_PRESTAMOS = ['prestamos'];

export function useCrearPrestamo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PrestamoPayload) => crearPrestamo(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_PRESTAMOS });
    },
  });
}

export function useCalcularPrestamo() {
  return useMutation({
    mutationFn: (payload: CalculoPrestamoPayload) => calcularPrestamo(payload),
  });
}
