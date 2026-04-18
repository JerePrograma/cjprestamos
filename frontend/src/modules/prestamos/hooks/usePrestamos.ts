import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  actualizarReferenciaPrestamo,
  calcularPrestamo,
  crearPrestamo,
  obtenerCuotasPorPrestamo,
  obtenerPrestamoPorId,
  obtenerPrestamos,
  obtenerPrestamosActivos,
} from '../../../services/prestamos/prestamosApi';
import type { CalculoPrestamoPayload, PrestamoPayload, PrestamoResponse, ReferenciaPrestamoPayload } from '../types/prestamo';

const QUERY_KEY_PRESTAMOS = ['prestamos'];

export function useListadoPrestamos() {
  return useQuery({
    queryKey: QUERY_KEY_PRESTAMOS,
    queryFn: obtenerPrestamos,
  });
}

export function useListadoPrestamosActivos() {
  return useQuery({
    queryKey: [...QUERY_KEY_PRESTAMOS, 'activos'],
    queryFn: obtenerPrestamosActivos,
  });
}

export function useDetallePrestamo(id: number | null) {
  return useQuery({
    queryKey: [...QUERY_KEY_PRESTAMOS, id],
    queryFn: () => obtenerPrestamoPorId(id as number),
    enabled: id !== null,
  });
}

export function useCuotasPrestamo(id: number | null) {
  return useQuery({
    queryKey: [...QUERY_KEY_PRESTAMOS, id, 'cuotas'],
    queryFn: () => obtenerCuotasPorPrestamo(id as number),
    enabled: id !== null,
  });
}

export function useResumenPrestamo(prestamo: PrestamoResponse | null) {
  return useQuery({
    queryKey: [...QUERY_KEY_PRESTAMOS, prestamo?.id, 'resumen'],
    queryFn: () =>
      calcularPrestamo({
        montoInicial: prestamo?.montoInicial ?? 0,
        porcentajeFijoSugerido: prestamo?.porcentajeFijoSugerido ?? null,
        interesManualOpcional: prestamo?.interesManualOpcional ?? null,
        cantidadCuotas: prestamo?.cantidadCuotas ?? 0,
      }),
    enabled: prestamo !== null,
  });
}

export function useCrearPrestamo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PrestamoPayload) => crearPrestamo(payload),
    onSuccess: (prestamo) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_PRESTAMOS });
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY_PRESTAMOS, prestamo.id] });
    },
  });
}

export function useActualizarReferenciaPrestamo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ReferenciaPrestamoPayload }) =>
      actualizarReferenciaPrestamo(id, payload),
    onSuccess: (prestamo) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_PRESTAMOS });
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY_PRESTAMOS, prestamo.id] });
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY_PRESTAMOS, prestamo.id, 'resumen'] });
    },
  });
}

export function useCalcularPrestamo() {
  return useMutation({
    mutationFn: (payload: CalculoPrestamoPayload) => calcularPrestamo(payload),
  });
}
