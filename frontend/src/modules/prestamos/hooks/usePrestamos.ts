import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  actualizarReferenciaPrestamo,
  calcularPrestamo,
  crearPrestamo,
  eliminarPrestamo,
  obtenerPrestamoPorId,
  obtenerPrestamos,
  obtenerPrestamosActivos,
} from '../api/prestamosApi';
import type {
  CalculoPrestamoPayload,
  PrestamoPayload,
  PrestamoResponse,
  ReferenciaPrestamoPayload,
} from '../types/prestamo';

const QUERY_KEY_PRESTAMOS = ['prestamos'];
const QUERY_KEY_DASHBOARD = ['dashboard'];

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

export function useEliminarPrestamo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => eliminarPrestamo(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_PRESTAMOS });
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY_PRESTAMOS, 'activos'] });
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY_PRESTAMOS, id] });
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY_PRESTAMOS, id, 'cuotas'] });
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY_PRESTAMOS, id, 'pagos'] });
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY_PRESTAMOS, id, 'resumen'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_DASHBOARD });
    },
  });
}
