export type Persona = {
  id: number;
  nombre: string;
  alias: string | null;
  telefono: string | null;
  observacionRapida: string | null;
  colorReferencia: string | null;
  cobraEnFecha: boolean;
  tieneIngresoExtra: boolean;
  activo: boolean;
  createdAt: string | null;
  updatedAt: string | null;
};

export type PersonaPayload = {
  nombre: string;
  alias: string;
  telefono: string;
  observacionRapida: string;
  colorReferencia: string;
  cobraEnFecha: boolean;
  tieneIngresoExtra: boolean;
  activo: boolean;
};

export const payloadInicialPersona: PersonaPayload = {
  nombre: '',
  alias: '',
  telefono: '',
  observacionRapida: '',
  colorReferencia: '',
  cobraEnFecha: false,
  tieneIngresoExtra: false,
  activo: true,
};

export function crearPayloadDesdePersona(persona: Persona): PersonaPayload {
  return {
    nombre: persona.nombre,
    alias: persona.alias ?? '',
    telefono: persona.telefono ?? '',
    observacionRapida: persona.observacionRapida ?? '',
    colorReferencia: persona.colorReferencia ?? '',
    cobraEnFecha: persona.cobraEnFecha,
    tieneIngresoExtra: persona.tieneIngresoExtra,
    activo: persona.activo,
  };
}
