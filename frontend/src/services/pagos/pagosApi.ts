import { api } from '../api';
import type { Pago, RegistroPagoPayload } from '../../modules/pagos/types/pago';

export async function registrarPago(payload: RegistroPagoPayload): Promise<Pago> {
  const response = await api.post<Pago>('/pagos', payload);
  return response.data;
}

export async function obtenerPagosPorPrestamo(prestamoId: number): Promise<Pago[]> {
  const response = await api.get<Pago[]>(`/prestamos/${prestamoId}/pagos`);
  return response.data;
}
