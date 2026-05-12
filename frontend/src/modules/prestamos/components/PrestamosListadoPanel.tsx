import { StatusPill } from '../../../components/ui/StatusPill';
import type { PrestamoResponse } from '../types/prestamo';
import {
  etiquetaFrecuencia,
  formatearFecha,
  formatearMoneda,
} from '../utils/prestamoUi';

type PrestamosListadoPanelProps = {
  isLoading: boolean;
  isError: boolean;
  prestamos: PrestamoResponse[];
  personasPorId: Map<number, string>;
  seleccionId: number | null;
  onSeleccionar: (prestamoId: number) => void;
};

function tonoEstado(estado: PrestamoResponse['estado']) {
  if (estado === 'ACTIVO') return 'success';
  if (estado === 'RENEGOCIADO') return 'warning';
  if (estado === 'FINALIZADO') return 'neutral';
  return 'danger';
}

export function PrestamosListadoPanel({
  isLoading,
  isError,
  prestamos,
  personasPorId,
  seleccionId,
  onSeleccionar,
}: PrestamosListadoPanelProps) {
  return (
    <aside className="panel p-3 sm:p-4">
      <header className="mb-3 flex items-center justify-between gap-2 border-b border-subtle pb-3">
        <div>
          <h2 className="text-sm font-semibold text-app">
            Listado de préstamos
          </h2>

          <p className="mt-0.5 text-xs text-muted">
            Seleccioná uno para operar
          </p>
        </div>

        <span className="badge-count">
          {prestamos.length}
        </span>
      </header>

      {isLoading ? (
        <p className="text-sm text-muted">Cargando préstamos...</p>
      ) : isError ? (
        <p className="mensaje-error">No se pudo cargar el listado de préstamos.</p>
      ) : prestamos.length === 0 ? (
        <p className="text-sm text-muted">
          Todavía no hay préstamos cargados. Usá “Nuevo préstamo” para comenzar.
        </p>
      ) : (
        <ul className="grid max-h-[62vh] gap-2 overflow-auto pr-1">
          {prestamos.map((prestamo) => {
            const activo = seleccionId === prestamo.id;

            return (
              <li key={prestamo.id}>
                <button
                  type="button"
                  onClick={() => onSeleccionar(prestamo.id)}
                  className={[
                    'w-full text-left',
                    activo ? 'card-activa' : 'card-interactiva',
                  ].join(' ')}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-app">
                      #{prestamo.id}
                    </span>

                    <StatusPill texto={prestamo.estado} tone={tonoEstado(prestamo.estado)} />
                  </div>

                  <p className="mt-1 truncate text-sm font-medium text-app">
                    {personasPorId.get(prestamo.personaId) ?? `Persona ${prestamo.personaId}`}
                  </p>

                  <p className="mt-1 text-xs text-muted">
                    {formatearMoneda(prestamo.montoInicial)} · {prestamo.cantidadCuotas} cuotas
                  </p>

                  <p className="text-xs text-muted">
                    {etiquetaFrecuencia(prestamo.frecuenciaTipo, prestamo.frecuenciaCadaDias)}
                  </p>

                  {prestamo.referenciaCodigo && (
                    <p className="text-xs text-muted">
                      Ref: {prestamo.referenciaCodigo}
                    </p>
                  )}

                  {prestamo.fechaBase && (
                    <p className="text-xs text-muted">
                      {prestamo.frecuenciaTipo === 'FECHAS_MANUALES' ? 'Inicio aux.' : 'Base'}:{' '}
                      {formatearFecha(prestamo.fechaBase)}
                    </p>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}