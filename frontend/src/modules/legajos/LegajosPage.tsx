import { useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageHeader } from '../../components/ui/PageHeader';
import { SectionCard } from '../../components/ui/SectionCard';
import { PersonaLegajoPanel } from '../personas/components/PersonaLegajoPanel';
import { useListadoPersonas } from '../personas/hooks/usePersonas';

export function LegajosPage() {
  const personas = useListadoPersonas();
  const [personaSeleccionadaId, setPersonaSeleccionadaId] = useState<number | null>(null);

  return (
    <section className="space-y-4">
      <PageHeader
        titulo="Legajos"
        descripcion="Información contextual separada de la operación económica diaria. Elegí persona y gestioná notas + adjuntos."
        breadcrumbs={[{ etiqueta: 'Inicio', to: '/' }, { etiqueta: 'Legajos' }]}
        acciones={[{ etiqueta: 'Ir a personas', to: '/personas', variante: 'secundario' }]}
        estados={[
          { etiqueta: 'personas disponibles', valor: String(personas.data?.length ?? 0) },
          { etiqueta: 'persona seleccionada', valor: personaSeleccionadaId ? `#${personaSeleccionadaId}` : 'ninguna' },
        ]}
      />

      <SectionCard titulo="Selector de persona" descripcion="Elegí a quién corresponde el legajo a editar o consultar.">
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
        <p className="mt-2 text-xs text-slate-500">
          Si necesitás corregir datos básicos (nombre, alias, contacto), hacelo desde{' '}
          <Link to="/personas" className="font-medium text-slate-800 underline decoration-slate-300 underline-offset-2">
            Personas
          </Link>
          .
        </p>
      </SectionCard>

      {personas.isLoading ? (
        <SectionCard titulo="Legajo" descripcion="Cargando información base.">
          <p className="text-sm text-slate-500">Cargando personas...</p>
        </SectionCard>
      ) : personas.isError ? (
        <SectionCard titulo="Legajo" descripcion="Error al cargar datos base.">
          <p className="text-sm text-red-700">No se pudo cargar el listado de personas.</p>
        </SectionCard>
      ) : personaSeleccionadaId === null ? (
        <SectionCard titulo="Legajo" descripcion="Seleccioná persona para continuar.">
          <EmptyState
            titulo="Esperando selección"
            descripcion="Elegí una persona para operar su legajo y gestionar adjuntos desde esta misma pantalla."
          />
        </SectionCard>
      ) : (
        <PersonaLegajoPanel personaId={personaSeleccionadaId} />
      )}
    </section>
  );
}
