import { api } from '../../../shared/api/httpClient';
import type { SimulacionPrestamoPayload, SimulacionPrestamoResponse } from '../types/simulacion';

export async function simularPrestamo(payload: SimulacionPrestamoPayload): Promise<SimulacionPrestamoResponse> {
  const response = await api.post<SimulacionPrestamoResponse>('/prestamos/simulador', payload);
  return response.data;
}

export async function descargarPdfSimulacionPrestamo(payload: SimulacionPrestamoPayload): Promise<Blob> {
  const response = await api.post('/prestamos/simulador/pdf', payload, { responseType: 'blob' });
  return response.data as Blob;
}
