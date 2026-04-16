import { api } from '../api';
import type { Persona, PersonaPayload } from '../../modules/personas/types/persona';

export async function obtenerPersonas(): Promise<Persona[]> {
  const response = await api.get<Persona[]>('/personas');
  return response.data;
}

export async function obtenerPersonaPorId(id: number): Promise<Persona> {
  const response = await api.get<Persona>(`/personas/${id}`);
  return response.data;
}

export async function crearPersona(payload: PersonaPayload): Promise<Persona> {
  const response = await api.post<Persona>('/personas', payload);
  return response.data;
}

export async function actualizarPersona(id: number, payload: PersonaPayload): Promise<Persona> {
  const response = await api.put<Persona>(`/personas/${id}`, payload);
  return response.data;
}

export async function eliminarPersona(id: number): Promise<void> {
  await api.delete(`/personas/${id}`);
}
