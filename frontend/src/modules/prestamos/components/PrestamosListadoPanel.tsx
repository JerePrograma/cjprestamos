import type { PrestamoResponse } from '../types/prestamo';
import {
  etiquetaEstado,
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
      <div className="mb-3 flex items-center justify-between gap-2 border-b border-slate-200 pb-2 dark:border-slate-800">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Listado de préstamos</h2>
        <span className="text-xs text-slate-500 dark:text-slate-400">Seleccioná uno para operar</span>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">Cargando préstamos...</p>
      ) : isError ? (
        <p className="mensaje-error">No se pudo cargar el listado de préstamos.</p>
      ) : prestamos.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">Todavía no hay préstamos cargados. Usá “Nuevo préstamo” para comenzar.</p>
      ) : (
        <ul className="max-h-[62vh] space-y-2 overflow-auto pr-1">
          {prestamos.map((prestamo) => (
            <li key={prestamo.id}>
              <button
                type="button"
                onClick={() => onSeleccionar(prestamo.id)}
                className={`w-full rounded-xl border px-3 py-3 text-left text-sm transition ${
                  seleccionId === prestamo.id
                    ? 'border-slate-900 bg-slate-900 text-white dark:border-sky-400 dark:bg-sky-500 dark:text-slate-950'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">#{prestamo.id}</span>
                  <span className={`rounded px-2 py-0.5 text-xs font-medium ${etiquetaEstado(prestamo.estado)}`}>
                    {prestamo.estado}
                  </span>
                </div>
                <p className="mt-1">{personasPorId.get(prestamo.personaId) ?? `Persona ${prestamo.personaId}`}</p>
                <p className="text-xs opacity-80">
                  {formatearMoneda(prestamo.montoInicial)} · {prestamo.cantidadCuotas} cuotas
                </p>
                <p className="text-xs opacity-80">{etiquetaFrecuencia(prestamo.frecuenciaTipo, prestamo.frecuenciaCadaDias)}</p>
                {prestamo.referenciaCodigo && <p className="text-xs opacity-80">Ref: {prestamo.referenciaCodigo}</p>}
                {prestamo.fechaBase && (
                  <p className="text-xs opacity-80">
                    {prestamo.frecuenciaTipo === 'FECHAS_MANUALES' ? 'Inicio aux.' : 'Base'}: {formatearFecha(prestamo.fechaBase)}
                  </p>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
