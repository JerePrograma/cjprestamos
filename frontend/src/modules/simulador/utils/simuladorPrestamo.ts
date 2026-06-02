import { redondearMontoHaciaArriba } from '../../../shared/lib/money';
import type { FrecuenciaTipo } from '../../prestamos/types/prestamo';
import type { SimulacionPrestamoPayload } from '../types/simulacion';

export type FormularioSimulador = {
  montoInicial: string;
  porcentajeFijoSugerido: string;
  interesManualOpcional: string;
  cantidadCuotas: string;
  frecuenciaTipo: FrecuenciaTipo;
  frecuenciaCadaDias: string;
  fechaPrimerVencimiento: string;
};

export const formularioInicialSimulador: FormularioSimulador = {
  montoInicial: '',
  porcentajeFijoSugerido: '',
  interesManualOpcional: '',
  cantidadCuotas: '4',
  frecuenciaTipo: 'MENSUAL',
  frecuenciaCadaDias: '7',
  fechaPrimerVencimiento: '',
};

function numeroOpcional(valor: string): number | null {
  const limpio = valor.trim();

  if (!limpio) {
    return null;
  }

  const numero = Number(limpio);

  return Number.isFinite(numero) ? redondearMontoHaciaArriba(numero) : null;
}

export function construirPayloadSimulador(formulario: FormularioSimulador): SimulacionPrestamoPayload {
  const montoInicial = Number(formulario.montoInicial);
  const cantidadCuotas = Number(formulario.cantidadCuotas);

  if (!Number.isFinite(montoInicial) || montoInicial <= 0) {
    throw new Error('Ingresá un monto inicial válido mayor a 0.');
  }

  if (!Number.isInteger(cantidadCuotas) || cantidadCuotas <= 0) {
    throw new Error('Ingresá una cantidad de cuotas válida.');
  }

  return {
    montoInicial: redondearMontoHaciaArriba(montoInicial),
    porcentajeFijoSugerido: numeroOpcional(formulario.porcentajeFijoSugerido),
    interesManualOpcional: numeroOpcional(formulario.interesManualOpcional),
    cantidadCuotas,
    frecuenciaTipo: formulario.frecuenciaTipo,
    frecuenciaCadaDias:
      formulario.frecuenciaTipo === 'CADA_X_DIAS'
        ? Number(formulario.frecuenciaCadaDias)
        : null,
    fechaPrimerVencimiento:
      formulario.frecuenciaTipo === 'FECHAS_MANUALES'
        ? null
        : formulario.fechaPrimerVencimiento || null,
  };
}
