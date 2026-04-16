import { api } from '../api';
import type {
  CalculoPrestamoPayload,
  CalculoPrestamoResultado,
  PrestamoPayload,
  PrestamoResponse,
} from '../../modules/prestamos/types/prestamo';

export async function crearPrestamo(payload: PrestamoPayload): Promise<PrestamoResponse> {
  const response = await api.post<PrestamoResponse>('/prestamos', payload);
  return response.data;
}

export async function calcularPrestamo(payload: CalculoPrestamoPayload): Promise<CalculoPrestamoResultado> {
  const response = await api.post<CalculoPrestamoResultado>('/prestamos/calcular', payload);
  return response.data;
}
