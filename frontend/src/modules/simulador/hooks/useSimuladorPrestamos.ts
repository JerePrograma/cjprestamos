import { useMutation } from '@tanstack/react-query';
import { descargarPdfSimulacionPrestamo, simularPrestamo } from '../api/simuladorApi';
import type { SimulacionPrestamoPayload } from '../types/simulacion';

export function useSimularPrestamo() {
  return useMutation({
    mutationFn: (payload: SimulacionPrestamoPayload) => simularPrestamo(payload),
  });
}

export function useDescargarPdfSimulacionPrestamo() {
  return useMutation({
    mutationFn: (payload: SimulacionPrestamoPayload) => descargarPdfSimulacionPrestamo(payload),
  });
}
