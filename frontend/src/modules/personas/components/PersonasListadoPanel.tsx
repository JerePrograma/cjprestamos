import { EmptyState } from '../../../shared/ui/EmptyState';
import { SectionCard } from '../../../shared/ui/SectionCard';
import { StatusPill } from '../../../shared/ui/StatusPill';
import type { Persona } from '../types/persona';
import { estiloColorReferencia } from '../utils/personaUi';

type PersonasListadoPanelProps = {
  busqueda: string;
  personas: Persona[];
  isLoading: boolean;
  isError: boolean;
  seleccionId: number | null;
  onCambiarBusqueda: (valor: string) => void;
  onSeleccionar: (personaId: number) => void;
  onLimpiarFiltro: () => void;
};

export function PersonasListadoPanel({
  busqueda,
  personas,
  isLoading,
  isError,
  seleccionId,
  onCambiarBusqueda,
  onSeleccionar,
  onLimpiarFiltro,
}: PersonasListadoPanelProps) {
  return (
    <SectionCard
      titulo="Búsqueda y listado"
      descripcion="Filtrá por nombre, alias o teléfono para abrir una ficha en un clic."
    >
      <label className="block text-sm">
        <span className="label-ui mb-1 block">
          Buscar por nombre, alias o teléfono
        </span>

        <input
          value={busqueda}
          onChange={(event) => onCambiarBusqueda(event.target.value)}
          placeholder="Ej: Ana, Ani, 11..."
        />
      </label>

      <div className="mt-4 overflow-hidden rounded-lg border border-subtle bg-surface">
        <div className="flex items-center justify-between border-b border-subtle px-3 py-2">
          <span className="text-sm font-semibold text-app">Resultados</span>

          {busqueda.trim() ? (
            <StatusPill texto="Filtro activo" tone="neutral" />
          ) : (
            <span className="text-xs text-muted">Sin filtro</span>
          )}
        </div>

        {isLoading ? (
          <p className="px-3 py-4 text-sm text-muted">Cargando personas...</p>
        ) : isError ? (
          <p className="mensaje-error m-3">No se pudo cargar el listado.</p>
        ) : personas.length === 0 ? (
          <div className="p-3">
            <EmptyState
              titulo="No hay resultados"
              descripcion="Probá otro término o registrá una persona nueva."
              accion={{ etiqueta: 'Limpiar filtro', onClick: onLimpiarFiltro }}
            />
          </div>
        ) : (
          <ul className="grid max-h-[58vh] gap-2 overflow-auto p-2">
            {personas.map((persona) => {
              const activa = seleccionId === persona.id;

              return (
                <li key={persona.id}>
                  <button
                    type="button"
                    onClick={() => onSeleccionar(persona.id)}
                    className={[
                      'w-full text-left',
                      activa ? 'card-activa' : 'card-interactiva',
                    ].join(' ')}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="inline-block h-2.5 w-2.5 rounded-full border border-subtle"
                        style={estiloColorReferencia(persona.colorReferencia)}
                      />

                      <span className="truncate font-semibold text-app">
                        {persona.nombre}
                      </span>
                    </div>

                    <div className="mt-1 truncate text-xs text-muted">
                      {persona.alias || persona.telefono || 'Sin dato extra'}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </SectionCard>
  );
}
