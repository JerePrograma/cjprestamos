import { useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { PageHeader } from '../../../shared/ui/PageHeader';
import { SectionCard } from '../../../shared/ui/SectionCard';
import { useListadoPersonas } from '../../personas/hooks/usePersonas';
import { LegajoPersonaPanel } from '../components/LegajoPersonaPanel';

export function LegajosPage() {
  const personas = useListadoPersonas();
  const [personaSeleccionadaId, setPersonaSeleccionadaId] = useState<number | null>(null);

  return (
    <section className="space-y-6">
      <PageHeader
        titulo="Legajos"
        descripcion="Información contextual separada de la operación económica diaria. Elegí persona y gestioná notas + adjuntos."
        breadcrumbs={[{ etiqueta: 'Inicio', to: '/' }, { etiqueta: 'Legajos' }]}
        acciones={[
          { etiqueta: 'Ir a personas', to: '/personas', variante: 'secundario' },
        ]}
        estados={[
          { etiqueta: 'personas disponibles', valor: String(personas.data?.length ?? 0) },
          {
            etiqueta: 'persona seleccionada',
            valor: personaSeleccionadaId ? `#${personaSeleccionadaId}` : 'ninguna',
          },
        ]}
      />

      <SectionCard
        titulo="Selector de persona"
        descripcion="Elegí a quién corresponde el legajo a editar o consultar."
      >
        <label className="block text-sm">
          <span className="label-ui mb-1 block">
            Persona
          </span>

          <select
            value={personaSeleccionadaId ?? ''}
            onChange={(event) =>
              setPersonaSeleccionadaId(
                event.target.value ? Number(event.target.value) : null,
              )
            }
          >
            <option value="">Seleccionar persona</option>
            {(personas.data ?? []).map((persona) => (
              <option key={persona.id} value={persona.id}>
                {persona.nombre}
              </option>
            ))}
          </select>
        </label>

        <p className="mt-3 text-sm text-soft">
          Si necesitás corregir datos básicos, hacelo desde{' '}
          <Link
            to="/personas"
            className="font-semibold text-app underline decoration-sky-300 underline-offset-4 hover:text-app"
          >
            Personas
          </Link>
          .
        </p>
      </SectionCard>

      {personas.isLoading ? (
        <SectionCard titulo="Legajo" descripcion="Cargando información base.">
          <p className="text-sm text-muted">Cargando personas...</p>
        </SectionCard>
      ) : personas.isError ? (
        <SectionCard titulo="Legajo" descripcion="Error al cargar datos base.">
          <p className="mensaje-error">No se pudo cargar el listado de personas.</p>
        </SectionCard>
      ) : personaSeleccionadaId === null ? (
        <SectionCard titulo="Legajo" descripcion="Seleccioná persona para continuar.">
          <EmptyState
            titulo="Esperando selección"
            descripcion="Elegí una persona para operar su legajo y gestionar adjuntos desde esta misma pantalla."
          />
        </SectionCard>
      ) : (
        <LegajoPersonaPanel personaId={personaSeleccionadaId} />
      )}
    </section>
  );
}
