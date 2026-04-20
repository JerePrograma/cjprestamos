import { useMemo } from 'react';
import { useListadoPersonas } from '../personas/hooks/usePersonas';
import { useListadoPrestamosActivos } from '../prestamos/hooks/usePrestamos';
import type { PrestamoResponse } from '../prestamos/types/prestamo';
import { useResumenDashboard } from './hooks/useDashboard';

function formatearMoneda(valor: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 2,
  }).format(valor);
}

function formatearMontoCard(valor: number, esMoneda: boolean) {
  if (!Number.isFinite(valor)) {
    return 'Sin datos';
  }

  return esMoneda ? formatearMoneda(valor) : String(valor);
}

function etiquetaEstado(estado: PrestamoResponse['estado']) {
  if (estado === 'ACTIVO') {
    return 'bg-emerald-100 text-emerald-800';
  }

  if (estado === 'FINALIZADO') {
    return 'bg-slate-200 text-slate-700';
  }

  if (estado === 'RENEGOCIADO') {
    return 'bg-amber-100 text-amber-800';
  }

  return 'bg-red-100 text-red-700';
}

const tarjetas = [
  { clave: 'montoInvertido', titulo: 'Monto inicial', esMoneda: true },
  { clave: 'montoGanado', titulo: 'Monto ganado', esMoneda: true },
  { clave: 'montoPorGanar', titulo: 'Monto por ganar', esMoneda: true },
  { clave: 'deudaTotal', titulo: 'Deuda total', esMoneda: true },
  { clave: 'prestamosActivos', titulo: 'Préstamos activos', esMoneda: false },
] as const;

export function DashboardPage() {
  const resumen = useResumenDashboard();
  const prestamosActivos = useListadoPrestamosActivos();
  const personas = useListadoPersonas();

  const personasPorId = useMemo(() => {
    const mapa = new Map<number, string>();
    (personas.data ?? []).forEach((persona) => {
      mapa.set(persona.id, persona.nombre);
    });
    return mapa;
  }, [personas.data]);

  const activosRecientes = useMemo(() => (prestamosActivos.data ?? []).slice(0, 5), [prestamosActivos.data]);

  const estadoVacioResumen =
    !resumen.isLoading &&
    !resumen.isError &&
    resumen.data !== undefined &&
    resumen.data.prestamosActivos === 0 &&
    resumen.data.montoInvertido === 0 &&
    resumen.data.montoGanado === 0 &&
    resumen.data.montoPorGanar === 0 &&
    resumen.data.deudaTotal === 0;

  return (
    <section className="space-y-5">
      <header className="space-y-1">
        <h1 className="titulo-seccion">Dashboard</h1>
        <p className="subtitulo-seccion">Resumen operativo para controlar el estado económico actual.</p>
      </header>

      {resumen.isError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          No se pudo cargar el resumen del dashboard.
          <button
            type="button"
            onClick={() => resumen.refetch()}
            className="ml-2 font-medium underline decoration-red-400 underline-offset-2"
          >
            Reintentar
          </button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {tarjetas.map((tarjeta) => {
          const valor = resumen.data?.[tarjeta.clave];

          return (
            <article key={tarjeta.clave} className="panel-soft p-3 sm:p-4">
              <h2 className="text-sm text-slate-600">{tarjeta.titulo}</h2>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                {resumen.isLoading || resumen.isFetching
                  ? 'Cargando...'
                  : valor === undefined
                    ? 'Sin datos'
                    : formatearMontoCard(valor, tarjeta.esMoneda)}
              </p>
            </article>
          );
        })}
      </div>

      {estadoVacioResumen && (
        <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
          Todavía no hay préstamos activos para mostrar en el dashboard.
        </p>
      )}

      <section className="panel p-3 sm:p-4">
        <header className="mb-2 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900">Préstamos activos recientes</h2>
          <span className="text-xs text-slate-500">Máximo 5</span>
        </header>

        {prestamosActivos.isLoading ? (
          <p className="text-sm text-slate-500">Cargando préstamos activos...</p>
        ) : prestamosActivos.isError ? (
          <p className="text-sm text-red-700">No se pudo cargar el listado de activos.</p>
        ) : activosRecientes.length === 0 ? (
          <p className="text-sm text-slate-500">No hay préstamos activos para listar.</p>
        ) : (
          <ul className="space-y-2">
            {activosRecientes.map((prestamo) => (
              <li key={prestamo.id} className="rounded-md border border-slate-200 px-3 py-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-slate-900">{prestamo.referenciaCodigo ? prestamo.referenciaCodigo : `Préstamo #${prestamo.id}`}</p>
                  <span className={`rounded px-2 py-0.5 text-xs font-medium ${etiquetaEstado(prestamo.estado)}`}>
                    {prestamo.estado}
                  </span>
                </div>
                <p className="text-slate-700">{personasPorId.get(prestamo.personaId) ?? `Persona ${prestamo.personaId}`}</p>
                <p className="text-xs text-slate-500">
                  {formatearMoneda(prestamo.montoInicial)} · {prestamo.cantidadCuotas} cuotas
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}
