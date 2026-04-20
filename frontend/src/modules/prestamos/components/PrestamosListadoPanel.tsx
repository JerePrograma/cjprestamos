import type { PrestamoResponse } from "../types/prestamo";
import {
  etiquetaEstado,
  etiquetaFrecuencia,
  formatearFecha,
  formatearMoneda,
} from "../utils/prestamoUi";

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
      <h2 className="mb-2 text-sm font-semibold text-slate-900">Listado</h2>

      {isLoading ? (
        <p className="text-sm text-slate-500">Cargando préstamos...</p>
      ) : isError ? (
        <p className="text-sm text-red-700">No se pudo cargar el listado de préstamos.</p>
      ) : prestamos.length === 0 ? (
        <p className="text-sm text-slate-500">Todavía no hay préstamos cargados.</p>
      ) : (
        <ul className="max-h-[62vh] space-y-2 overflow-auto pr-1">
          {prestamos.map((prestamo) => (
            <li key={prestamo.id}>
              <button
                type="button"
                onClick={() => onSeleccionar(prestamo.id)}
                className={`w-full rounded-xl border px-3 py-2 text-left text-sm shadow-sm transition hover:border-slate-400 ${
                  seleccionId === prestamo.id
                    ? "border-slate-700 bg-slate-50"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-900">#{prestamo.id}</span>
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${etiquetaEstado(prestamo.estado)}`}
                  >
                    {prestamo.estado}
                  </span>
                </div>
                <p className="mt-1 text-slate-700">
                  {personasPorId.get(prestamo.personaId) ?? `Persona ${prestamo.personaId}`}
                </p>
                <p className="text-xs text-slate-500">
                  {formatearMoneda(prestamo.montoInicial)} · {prestamo.cantidadCuotas} cuotas
                </p>
                <p className="text-xs text-slate-500">
                  {etiquetaFrecuencia(prestamo.frecuenciaTipo, prestamo.frecuenciaCadaDias)}
                </p>
                {prestamo.referenciaCodigo && (
                  <p className="text-xs text-slate-500">Ref: {prestamo.referenciaCodigo}</p>
                )}
                {prestamo.fechaBase && (
                  <p className="text-xs text-slate-500">
                    {prestamo.frecuenciaTipo === "FECHAS_MANUALES" ? "Inicio aux." : "Base"}:{" "}
                    {formatearFecha(prestamo.fechaBase)}
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
