import { api } from '../../../shared/api/httpClient';
import type {
  CalculoPrestamoPayload,
  CalculoPrestamoResultado,
  PrestamoPayload,
  PrestamoResponse,
  ReferenciaPrestamoPayload,
} from '../types/prestamo';

export async function obtenerPrestamos(): Promise<PrestamoResponse[]> {
  const response = await api.get<PrestamoResponse[]>('/prestamos');
  return response.data;
}

export async function obtenerPrestamosActivos(): Promise<PrestamoResponse[]> {
  const response = await api.get<PrestamoResponse[]>('/prestamos/activos');
  return response.data;
}

export async function obtenerPrestamoPorId(id: number): Promise<PrestamoResponse> {
  const response = await api.get<PrestamoResponse>(`/prestamos/${id}`);
  return response.data;
}

export async function crearPrestamo(payload: PrestamoPayload): Promise<PrestamoResponse> {
  const response = await api.post<PrestamoResponse>('/prestamos', payload);
  return response.data;
}

export async function actualizarReferenciaPrestamo(
  id: number,
  payload: ReferenciaPrestamoPayload,
): Promise<PrestamoResponse> {
  const response = await api.put<PrestamoResponse>(`/prestamos/${id}/referencia`, payload);
  return response.data;
}

export async function calcularPrestamo(payload: CalculoPrestamoPayload): Promise<CalculoPrestamoResultado> {
  const response = await api.post<CalculoPrestamoResultado>('/prestamos/calcular', payload);
  return response.data;
}

