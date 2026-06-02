import { redondearMontoHaciaArriba } from '../../../shared/lib/money';
import type {
  CuotaManualFila,
  CuotaManualPayload,
  GenerarCuotasPayload,
} from '../types/cuota';

export function construirFilasCuotasManuales(
  cantidadCuotas: number,
  fechaPrimeraCuota?: string | null,
): CuotaManualFila[] {
  return Array.from({ length: cantidadCuotas }, (_, index) => ({
    numeroCuota: String(index + 1),
    fechaVencimiento: index === 0 ? (fechaPrimeraCuota ?? '') : '',
    montoProgramado: '',
  }));
}

export function validarCuotasManuales(
  filas: CuotaManualFila[],
  cantidadCuotas: number,
  totalADevolver: number,
):
  | { valido: true; payload: GenerarCuotasPayload }
  | { valido: false; mensaje: string } {
  if (filas.length !== cantidadCuotas) {
    return {
      valido: false,
      mensaje: 'La cantidad de cuotas cargadas no coincide con la cantidad esperada.',
    };
  }

  const numeros = new Set<number>();
  const cuotasManuales: CuotaManualPayload[] = [];

  for (let index = 0; index < filas.length; index += 1) {
    const fila = filas[index];
    const numero = Number(fila.numeroCuota);
    const monto = redondearMontoHaciaArriba(Number(fila.montoProgramado));

    if (!Number.isInteger(numero)) {
      return {
        valido: false,
        mensaje: `La cuota ${index + 1} debe tener número obligatorio.`,
      };
    }

    if (numero < 1 || numero > cantidadCuotas) {
      return {
        valido: false,
        mensaje: `La cuota ${index + 1} debe tener un número entre 1 y ${cantidadCuotas}.`,
      };
    }

    if (numeros.has(numero)) {
      return {
        valido: false,
        mensaje: 'No puede haber números de cuota repetidos.',
      };
    }

    numeros.add(numero);

    if (!fila.fechaVencimiento) {
      return {
        valido: false,
        mensaje: `La cuota ${numero} debe tener fecha de vencimiento.`,
      };
    }

    if (!(monto > 0)) {
      return {
        valido: false,
        mensaje: `La cuota ${numero} debe tener un monto mayor a 0.`,
      };
    }

    cuotasManuales.push({
      numeroCuota: numero,
      fechaVencimiento: fila.fechaVencimiento,
      montoProgramado: monto,
    });
  }

  const totalCargado = cuotasManuales.reduce(
    (acumulado, cuota) => acumulado + cuota.montoProgramado,
    0,
  );

  if (Math.round(totalCargado * 100) !== Math.round(totalADevolver * 100)) {
    return {
      valido: false,
      mensaje: 'La suma de las cuotas debe coincidir con el total a devolver.',
    };
  }

  return { valido: true, payload: { cuotasManuales } };
}
