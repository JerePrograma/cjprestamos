import { useState } from 'react';
import { PersonaLegajoPanel } from '../personas/components/PersonaLegajoPanel';
import { useListadoPersonas } from '../personas/hooks/usePersonas';

export function LegajosPage() {
  const personas = useListadoPersonas();
  const [personaSeleccionadaId, setPersonaSeleccionadaId] = useState<number | null>(null);

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h1 className="titulo-seccion">Legajos</h1>
        <p className="subtitulo-seccion">
          Información contextual separada de personas y préstamos operativos.
        </p>
      </header>

      <section className="rounded border border-slate-200 p-3">
        <label className="text-sm text-slate-700">
          Persona
          <select
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            value={personaSeleccionadaId ?? ''}
            onChange={(event) => setPersonaSeleccionadaId(event.target.value ? Number(event.target.value) : null)}
          >
            <option value="">Seleccionar persona</option>
            {(personas.data ?? []).map((persona) => (
              <option key={persona.id} value={persona.id}>
                {persona.nombre}
              </option>
            ))}
          </select>
        </label>
      </section>

      {personas.isLoading ? (
        <p className="text-sm text-slate-500">Cargando personas...</p>
      ) : personas.isError ? (
        <p className="text-sm text-red-700">No se pudo cargar el listado de personas.</p>
      ) : personaSeleccionadaId === null ? (
        <p className="text-sm text-slate-500">Seleccioná una persona para operar su legajo y adjuntos.</p>
      ) : (
        <PersonaLegajoPanel personaId={personaSeleccionadaId} />
      )}
    </section>
  );
}
