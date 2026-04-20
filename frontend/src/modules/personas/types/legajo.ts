export type LegajoPersona = {
  id: number;
  personaId: number;
  direccion: string | null;
  ocupacion: string | null;
  fuenteIngreso: string | null;
  contactoAlternativo: string | null;
  documentacionPendiente: string | null;
  notasInternas: string | null;
  observacionesGenerales: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type LegajoPersonaPayload = {
  direccion: string;
  ocupacion: string;
  fuenteIngreso: string;
  contactoAlternativo: string;
  documentacionPendiente: string;
  notasInternas: string;
  observacionesGenerales: string;
};

export const payloadInicialLegajo: LegajoPersonaPayload = {
  direccion: '',
  ocupacion: '',
  fuenteIngreso: '',
  contactoAlternativo: '',
  documentacionPendiente: '',
  notasInternas: '',
  observacionesGenerales: '',
};

export type LegajoAdjunto = {
  id: number;
  personaId: number;
  nombreOriginal: string;
  tipoContenido: string;
  tamanoBytes: number;
  createdAt: string | null;
};

export function crearPayloadDesdeLegajo(legajo: LegajoPersona): LegajoPersonaPayload {
  return {
    direccion: legajo.direccion ?? '',
    ocupacion: legajo.ocupacion ?? '',
    fuenteIngreso: legajo.fuenteIngreso ?? '',
    contactoAlternativo: legajo.contactoAlternativo ?? '',
    documentacionPendiente: legajo.documentacionPendiente ?? '',
    notasInternas: legajo.notasInternas ?? '',
    observacionesGenerales: legajo.observacionesGenerales ?? '',
  };
}
