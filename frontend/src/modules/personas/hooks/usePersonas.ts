import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  actualizarPersona,
  crearPersona,
  eliminarPersona,
  obtenerPersonaPorId,
  obtenerPersonas,
} from '../api/personasApi';
import type { EstadoListadoPersonas, PersonaPayload } from '../types/persona';

const QUERY_KEY_PERSONAS = ['personas'];

export function useListadoPersonas(estado: EstadoListadoPersonas = 'activas') {
  return useQuery({
    queryKey: [...QUERY_KEY_PERSONAS, estado],
    queryFn: () => obtenerPersonas(estado),
  });
}

export function useDetallePersona(id: number | null) {
  return useQuery({
    queryKey: [...QUERY_KEY_PERSONAS, 'detalle', id],
    queryFn: () => obtenerPersonaPorId(id as number),
    enabled: id !== null,
  });
}

export function useCrearPersona() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PersonaPayload) => crearPersona(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_PERSONAS });
    },
  });
}

export function useActualizarPersona() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: PersonaPayload }) => actualizarPersona(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_PERSONAS });
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY_PERSONAS, 'detalle', variables.id] });
    },
  });
}

export function useEliminarPersona() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => eliminarPersona(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_PERSONAS });
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY_PERSONAS, 'detalle', id] });
    },
  });
}
