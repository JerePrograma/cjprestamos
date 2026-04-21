import { api } from '../api';
import type {
  AjustarCuotasFuturasPayload,
  CalculoPrestamoPayload,
  CalculoPrestamoResultado,
  CuotaPrestamo,
  GenerarCuotasPayload,
  PrestamoPayload,
  PrestamoResponse,
  ReferenciaPrestamoPayload,
  SimulacionPrestamoPayload,
  SimulacionPrestamoResponse,
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

export async function generarCuotasPrestamo(id: number, payload?: GenerarCuotasPayload): Promise<CuotaPrestamo[]> {
  const response = await api.post<CuotaPrestamo[]>(`/prestamos/${id}/cuotas/generar`, payload);
  return response.data;
}

export async function ajustarCuotasFuturasPrestamo(id: number, payload: AjustarCuotasFuturasPayload): Promise<CuotaPrestamo[]> {
  const response = await api.put<CuotaPrestamo[]>(`/prestamos/${id}/cuotas/ajustes-futuros`, payload);
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


export async function simularPrestamo(payload: SimulacionPrestamoPayload): Promise<SimulacionPrestamoResponse> {
  const response = await api.post<SimulacionPrestamoResponse>('/prestamos/simulador', payload);
  return response.data;
}

export async function descargarPdfSimulacionPrestamo(payload: SimulacionPrestamoPayload): Promise<Blob> {
  const response = await api.post('/prestamos/simulador/pdf', payload, { responseType: 'blob' });
  return response.data as Blob;
}
