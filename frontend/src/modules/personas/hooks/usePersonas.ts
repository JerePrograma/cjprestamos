import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  actualizarPersona,
  crearPersona,
  eliminarPersona,
  obtenerPersonaPorId,
  obtenerPersonas,
} from '../../../services/personas/personasApi';
import type { PersonaPayload } from '../types/persona';

const QUERY_KEY_PERSONAS = ['personas'];

export function useListadoPersonas() {
  return useQuery({
    queryKey: QUERY_KEY_PERSONAS,
    queryFn: obtenerPersonas,
  });
}

export function useDetallePersona(id: number | null) {
  return useQuery({
    queryKey: [...QUERY_KEY_PERSONAS, id],
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
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY_PERSONAS, variables.id] });
    },
  });
}

export function useEliminarPersona() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => eliminarPersona(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_PERSONAS });
      queryClient.removeQueries({ queryKey: [...QUERY_KEY_PERSONAS, id] });
    },
  });
}
