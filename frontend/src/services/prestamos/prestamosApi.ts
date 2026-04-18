import { api } from '../api';
import type {
  CalculoPrestamoPayload,
  CalculoPrestamoResultado,
  CuotaPrestamo,
  PrestamoPayload,
  PrestamoResponse,
} from '../../modules/prestamos/types/prestamo';

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

export async function obtenerCuotasPorPrestamo(id: number): Promise<CuotaPrestamo[]> {
  const response = await api.get<CuotaPrestamo[]>(`/prestamos/${id}/cuotas`);
  return response.data;
}

export async function crearPrestamo(payload: PrestamoPayload): Promise<PrestamoResponse> {
  const response = await api.post<PrestamoResponse>('/prestamos', payload);
  return response.data;
}

export async function calcularPrestamo(payload: CalculoPrestamoPayload): Promise<CalculoPrestamoResultado> {
  const response = await api.post<CalculoPrestamoResultado>('/prestamos/calcular', payload);
  return response.data;
}
