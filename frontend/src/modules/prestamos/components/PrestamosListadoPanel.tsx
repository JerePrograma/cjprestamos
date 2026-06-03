import { PrestamoEstadoPill } from './PrestamoEstadoPill';
import { StatusPill } from '../../../shared/ui/StatusPill';
import type { PersonaPrestamoResumen, PrestamoResponse } from '../types/prestamo';
import {
  etiquetaFrecuencia,
  formatearFecha,
  formatearMoneda,
} from '../utils/prestamoUi';

export type FiltroEstadoPrestamos = 'cobrables' | 'cerrados' | 'todos';

const filtrosEstado: Array<{ id: FiltroEstadoPrestamos; etiqueta: string }> = [
  { id: 'todos', etiqueta: 'Todos visibles' },
  { id: 'cobrables', etiqueta: 'Activos/Renegociados' },
  { id: 'cerrados', etiqueta: 'Finalizados/Cancelados' },
];

type PrestamosListadoPanelProps = {
  isLoading: boolean;
  isError: boolean;
  busqueda: string;
  filtroEstado: FiltroEstadoPrestamos;
  prestamos: PrestamoResponse[];
  totalPrestamos: number;
  personasPorId: Map<number, PersonaPrestamoResumen>;
  seleccionId: number | null;
  onCambiarBusqueda: (valor: string) => void;
  onCambiarFiltroEstado: (filtro: FiltroEstadoPrestamos) => void;
  onSeleccionar: (prestamoId: number) => void;
};

export function PrestamosListadoPanel({
  isLoading,
  isError,
  busqueda,
  filtroEstado,
  prestamos,
  totalPrestamos,
  personasPorId,
  seleccionId,
  onCambiarBusqueda,
  onCambiarFiltroEstado,
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
          {prestamos.length}/{totalPrestamos}
        </span>
      </header>

      <div className="mb-3 space-y-3">
        <label className="block text-sm">
          <span className="label-ui mb-1 block">
            Buscar por persona, referencia, id o estado
          </span>
          <input
            value={busqueda}
            onChange={(event) => onCambiarBusqueda(event.target.value)}
            placeholder="Ej: Ana, REF-12, activo..."
          />
        </label>

        <div className="grid gap-2">
          {filtrosEstado.map((filtro) => {
            const activo = filtroEstado === filtro.id;

            return (
              <button
                key={filtro.id}
                type="button"
                aria-pressed={activo}
                onClick={() => onCambiarFiltroEstado(filtro.id)}
                className={activo ? 'card-activa text-left text-xs' : 'card-interactiva text-left text-xs'}
              >
                <span className="font-semibold text-app">{filtro.etiqueta}</span>
              </button>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted">Cargando préstamos...</p>
      ) : isError ? (
        <p className="mensaje-error">No se pudo cargar el listado de préstamos.</p>
      ) : prestamos.length === 0 ? (
        <p className="text-sm text-muted">
          {totalPrestamos === 0
            ? 'Todavía no hay préstamos cargados. Usá “Nuevo préstamo” para comenzar.'
            : 'No hay préstamos que coincidan con la búsqueda o el filtro elegido.'}
        </p>
      ) : (
        <ul className="grid max-h-[62vh] gap-2 overflow-auto pr-1">
          {prestamos.map((prestamo) => {
            const activo = seleccionId === prestamo.id;
            const persona = personasPorId.get(prestamo.personaId);
            const nombrePersona = persona?.nombre ?? `Persona ${prestamo.personaId}`;
            const personaDadaDeBaja = persona ? !persona.activo : false;
            const referencia = prestamo.referenciaCodigo || `Préstamo #${prestamo.id}`;

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
                    <span className="min-w-0 truncate font-semibold text-app">
                      {referencia}
                    </span>

                    <PrestamoEstadoPill estado={prestamo.estado} />
                  </div>

                  <div className="mt-1 flex items-center gap-2">
                    <p className="min-w-0 truncate text-sm font-medium text-app">
                      {nombrePersona}
                    </p>

                    {personaDadaDeBaja && (
                      <StatusPill texto="Persona dada de baja" tone="warning" />
                    )}
                  </div>

                  <p className="mt-1 text-xs text-muted">
                    {formatearMoneda(prestamo.montoInicial)} · {prestamo.cantidadCuotas} cuotas
                  </p>

                  <p className="text-xs text-muted">
                    {etiquetaFrecuencia(prestamo.frecuenciaTipo, prestamo.frecuenciaCadaDias)}
                  </p>

                  <p className="text-xs text-muted">
                    ID: #{prestamo.id}
                  </p>

                  <p className="text-xs text-muted">
                    {prestamo.frecuenciaTipo === 'FECHAS_MANUALES' ? 'Inicio aux.' : 'Base'}:{' '}
                    {formatearFecha(prestamo.fechaBase)}
                  </p>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
