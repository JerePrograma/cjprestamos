export function redondearMontoHaciaArriba(valor: number): number {
  if (!Number.isFinite(valor)) {
    return 0;
  }

  return Math.ceil(valor);
}

export function parsearMontoSinCentavos(valor: string): number | null {
  const normalizado = valor.replace(',', '.').trim();

  if (!normalizado) {
    return null;
  }

  const numero = Number(normalizado);

  if (!Number.isFinite(numero) || numero <= 0) {
    return null;
  }

  return redondearMontoHaciaArriba(numero);
}

export function formatearMonedaSinCentavos(valor?: number): string {
  if (valor === undefined) {
    return '$ -';
  }

  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(redondearMontoHaciaArriba(valor));
}
