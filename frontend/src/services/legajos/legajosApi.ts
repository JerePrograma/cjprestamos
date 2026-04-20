import { api } from '../api';
import type { LegajoAdjunto, LegajoPersona, LegajoPersonaPayload } from '../../modules/personas/types/legajo';

export async function obtenerLegajoPorPersonaId(personaId: number): Promise<LegajoPersona> {
  const response = await api.get<LegajoPersona>(`/personas/${personaId}/legajo`);
  return response.data;
}

export async function crearLegajo(personaId: number, payload: LegajoPersonaPayload): Promise<LegajoPersona> {
  const response = await api.post<LegajoPersona>(`/personas/${personaId}/legajo`, payload);
  return response.data;
}

export async function actualizarLegajo(personaId: number, payload: LegajoPersonaPayload): Promise<LegajoPersona> {
  const response = await api.put<LegajoPersona>(`/personas/${personaId}/legajo`, payload);
  return response.data;
}

export async function listarAdjuntosLegajo(personaId: number): Promise<LegajoAdjunto[]> {
  const response = await api.get<LegajoAdjunto[]>(`/personas/${personaId}/legajo/adjuntos`);
  return response.data;
}

export async function subirAdjuntoLegajo(personaId: number, archivo: File): Promise<LegajoAdjunto> {
  const data = new FormData();
  data.append('archivo', archivo);

  const response = await api.post<LegajoAdjunto>(`/personas/${personaId}/legajo/adjuntos`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

export async function descargarAdjuntoLegajo(personaId: number, adjuntoId: number): Promise<{ blob: Blob; nombreArchivo: string }> {
  const response = await api.get(`/personas/${personaId}/legajo/adjuntos/${adjuntoId}/descargar`, {
    responseType: 'blob',
  });

  const disposition = response.headers['content-disposition'] as string | undefined;
  const match = disposition?.match(/filename\*?=(?:UTF-8''|\")?([^\";]+)/i);
  const nombreArchivo = match ? decodeURIComponent(match[1].replace(/"/g, '')) : `adjunto-${adjuntoId}`;

  return { blob: response.data as Blob, nombreArchivo };
}

export async function eliminarAdjuntoLegajo(personaId: number, adjuntoId: number): Promise<void> {
  await api.delete(`/personas/${personaId}/legajo/adjuntos/${adjuntoId}`);
}
