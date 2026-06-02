import type { CSSProperties } from 'react';
import type { Persona } from '../types/persona';

export function coincideBusquedaPersona(persona: Persona, termino: string) {
  const busqueda = termino.toLowerCase().trim();

  if (!busqueda) {
    return true;
  }

  return [persona.nombre, persona.alias ?? '', persona.telefono ?? '']
    .join(' ')
    .toLowerCase()
    .includes(busqueda);
}

export function estiloColorReferencia(colorReferencia: string | null): CSSProperties {
  if (!colorReferencia || !colorReferencia.trim()) {
    return { backgroundColor: '#cbd5e1' };
  }

  return { backgroundColor: colorReferencia };
}
