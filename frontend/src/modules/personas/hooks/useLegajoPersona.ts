import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  actualizarLegajo,
  crearLegajo,
  descargarAdjuntoLegajo,
  eliminarAdjuntoLegajo,
  listarAdjuntosLegajo,
  obtenerLegajoPorPersonaId,
  subirAdjuntoLegajo,
} from '../../../services/legajos/legajosApi';
import type { LegajoPersonaPayload } from '../types/legajo';

const QUERY_KEY_LEGAJO = ['legajo-persona'];
const QUERY_KEY_ADJUNTOS = ['legajo-adjuntos'];

export function useLegajoPersona(personaId: number | null) {
  return useQuery({
    queryKey: [...QUERY_KEY_LEGAJO, personaId],
    queryFn: () => obtenerLegajoPorPersonaId(personaId as number),
    enabled: personaId !== null,
    retry: false,
  });
}

export function useCrearLegajoPersona(personaId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LegajoPersonaPayload) => crearLegajo(personaId as number, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY_LEGAJO, personaId] });
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY_ADJUNTOS, personaId] });
    },
  });
}

export function useActualizarLegajoPersona(personaId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LegajoPersonaPayload) => actualizarLegajo(personaId as number, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY_LEGAJO, personaId] });
    },
  });
}

export function useAdjuntosLegajo(personaId: number | null, habilitado = true) {
  return useQuery({
    queryKey: [...QUERY_KEY_ADJUNTOS, personaId],
    queryFn: () => listarAdjuntosLegajo(personaId as number),
    enabled: personaId !== null && habilitado,
    retry: false,
  });
}

export function useSubirAdjuntoLegajo(personaId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (archivo: File) => subirAdjuntoLegajo(personaId as number, archivo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY_ADJUNTOS, personaId] });
    },
  });
}

export function useEliminarAdjuntoLegajo(personaId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (adjuntoId: number) => eliminarAdjuntoLegajo(personaId as number, adjuntoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY_ADJUNTOS, personaId] });
    },
  });
}

export function useDescargarAdjuntoLegajo(personaId: number | null) {
  return useMutation({
    mutationFn: (adjuntoId: number) => descargarAdjuntoLegajo(personaId as number, adjuntoId),
  });
}
