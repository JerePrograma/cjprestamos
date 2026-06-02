export function obtenerFechaHoyLocal() {
  const hoy = new Date();
  const year = hoy.getFullYear();
  const month = String(hoy.getMonth() + 1).padStart(2, '0');
  const day = String(hoy.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatearFechaArgentina(valor: string | null, fallback = 'Sin fecha') {
  if (!valor) {
    return fallback;
  }

  return new Date(`${valor}T00:00:00`).toLocaleDateString('es-AR');
}
