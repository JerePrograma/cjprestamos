export function mostrarTextoONulo(valor: string | number | null | undefined, fallback = '—') {
  if (valor === null || valor === undefined || String(valor).trim() === '') {
    return fallback;
  }

  return String(valor);
}
