import { api } from '../../../shared/api/httpClient';
import type {
  AjustarCuotasFuturasPayload,
  CuotaPrestamo,
  GenerarCuotasPayload,
} from '../types/cuota';

export async function obtenerCuotasPorPrestamo(id: number): Promise<CuotaPrestamo[]> {
  const response = await api.get<CuotaPrestamo[]>(`/prestamos/${id}/cuotas`);
  return response.data;
}

export async function generarCuotasPrestamo(id: number, payload?: GenerarCuotasPayload): Promise<CuotaPrestamo[]> {
  const response = await api.post<CuotaPrestamo[]>(`/prestamos/${id}/cuotas/generar`, payload);
  return response.data;
}

export async function ajustarCuotasFuturasPrestamo(id: number, payload: AjustarCuotasFuturasPayload): Promise<CuotaPrestamo[]> {
  const response = await api.put<CuotaPrestamo[]>(`/prestamos/${id}/cuotas/ajustes-futuros`, payload);
  return response.data;
}
