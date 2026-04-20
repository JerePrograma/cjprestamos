import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageHeader } from '../../components/ui/PageHeader';
import { SectionCard } from '../../components/ui/SectionCard';
import { StatusPill } from '../../components/ui/StatusPill';
import { useListadoPersonas } from '../personas/hooks/usePersonas';
import { useListadoPrestamosActivos } from '../prestamos/hooks/usePrestamos';
import type { PrestamoResponse } from '../prestamos/types/prestamo';
import { formatearFecha, formatearMoneda } from '../prestamos/utils/prestamoUi';
import { useResumenDashboard } from './hooks/useDashboard';

function etiquetaEstado(estado: PrestamoResponse['estado']) {
  if (estado === 'ACTIVO') {
    return <StatusPill texto={estado} tone="success" />;
  }

  if (estado === 'FINALIZADO') {
    return <StatusPill texto={estado} tone="neutral" />;
  }

  if (estado === 'RENEGOCIADO') {
    return <StatusPill texto={estado} tone="warning" />;
  }

  return <StatusPill texto={estado} tone="danger" />;
}

const tarjetas = [
  { clave: 'montoInvertido', titulo: 'Monto inicial', descripcion: 'Capital actualmente colocado', esMoneda: true },
  { clave: 'montoGanado', titulo: 'Monto ganado', descripcion: 'Ganancia confirmada por pagos', esMoneda: true },
  { clave: 'montoPorGanar', titulo: 'Monto por ganar', descripcion: 'Ganancia estimada pendiente', esMoneda: true },
  { clave: 'deudaTotal', titulo: 'Deuda total', descripcion: 'Saldo total pendiente del sistema', esMoneda: true },
  { clave: 'prestamosActivos', titulo: 'Préstamos activos', descripcion: 'Préstamos operativos abiertos', esMoneda: false },
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
  const personasRecientes = useMemo(() => (personas.data ?? []).slice(0, 5), [personas.data]);

  return (
    <section className="space-y-4">
      <PageHeader
        titulo="Dashboard"
        descripcion="Punto de control diario para revisar números clave, abrir acciones rápidas y continuar flujos sin perder contexto."
        breadcrumbs={[{ etiqueta: 'Inicio' }, { etiqueta: 'Dashboard' }]}
        acciones={[
          { etiqueta: 'Nueva persona', to: '/personas', variante: 'secundario' },
          { etiqueta: 'Nuevo préstamo', to: '/prestamos?alta=1&vista=workspace', variante: 'principal' },
        ]}
      />

      {resumen.isError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          No se pudo cargar el resumen del dashboard.
          <button type="button" onClick={() => resumen.refetch()} className="ml-2 font-medium underline decoration-red-400 underline-offset-2">
            Reintentar
          </button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {tarjetas.map((tarjeta) => {
          const valor = resumen.data?.[tarjeta.clave];

          return (
            <article key={tarjeta.clave} className="panel-soft p-4">
              <h2 className="text-sm font-medium text-slate-700">{tarjeta.titulo}</h2>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {resumen.isLoading || resumen.isFetching
                  ? 'Cargando...'
                  : valor === undefined
                    ? 'Sin datos'
                    : tarjeta.esMoneda
                      ? formatearMoneda(valor)
                      : String(valor)}
              </p>
              <p className="mt-1 text-xs text-slate-500">{tarjeta.descripcion}</p>
            </article>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <SectionCard
          titulo="Acciones rápidas"
          descripcion="Atajos para continuar el flujo operativo sin buscar pantalla por pantalla."
        >
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
            <Link to="/personas" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50">
              Abrir libreta de personas
            </Link>
            <Link to="/prestamos?alta=1&vista=workspace" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50">
              Cargar préstamo nuevo
            </Link>
            <Link to="/prestamos?vista=listado" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50">
              Revisar préstamos activos
            </Link>
            <Link to="/legajos" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50">
              Consultar legajos y adjuntos
            </Link>
          </div>
        </SectionCard>

        <SectionCard
          titulo="Préstamos activos recientes"
          descripcion="Últimos préstamos activos para seguir cuotas, pagos y referencia rápidamente."
          acciones={<span className="text-xs text-slate-500">Máximo 5</span>}
        >
          {prestamosActivos.isLoading ? (
            <p className="text-sm text-slate-500">Cargando préstamos activos...</p>
          ) : prestamosActivos.isError ? (
            <p className="text-sm text-red-700">No se pudo cargar el listado de activos.</p>
          ) : activosRecientes.length === 0 ? (
            <EmptyState titulo="Sin préstamos activos" descripcion="Cuando cargues un préstamo activo aparecerá aquí para seguimiento rápido." />
          ) : (
            <ul className="space-y-2">
              {activosRecientes.map((prestamo) => (
                <li key={prestamo.id} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-slate-900">{prestamo.referenciaCodigo ? prestamo.referenciaCodigo : `Préstamo #${prestamo.id}`}</p>
                    {etiquetaEstado(prestamo.estado)}
                  </div>
                  <p className="text-slate-700">{personasPorId.get(prestamo.personaId) ?? `Persona ${prestamo.personaId}`}</p>
                  <p className="text-xs text-slate-500">
                    {formatearMoneda(prestamo.montoInicial)} · {prestamo.cantidadCuotas} cuotas · base {formatearFecha(prestamo.fechaBase)}
                  </p>
                  <Link to={`/prestamos?prestamoId=${prestamo.id}&vista=workspace`} className="mt-2 inline-flex text-xs font-medium text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-slate-900">
                    Abrir workspace
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard titulo="Personas recientes" descripcion="Acceso directo a personas para editar datos o revisar legajo.">
          {personas.isLoading ? (
            <p className="text-sm text-slate-500">Cargando personas...</p>
          ) : personas.isError ? (
            <p className="text-sm text-red-700">No se pudo cargar el listado de personas.</p>
          ) : personasRecientes.length === 0 ? (
            <EmptyState titulo="Sin personas cargadas" descripcion="Comenzá registrando una persona para poder crear préstamos." />
          ) : (
            <ul className="space-y-2">
              {personasRecientes.map((persona) => (
                <li key={persona.id} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  <p className="font-semibold text-slate-900">{persona.nombre}</p>
                  <p className="text-xs text-slate-500">{persona.alias || persona.telefono || 'Sin alias/teléfono'}</p>
                  <Link to={`/personas?personaId=${persona.id}`} className="mt-1 inline-flex text-xs font-medium text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-slate-900">
                    Abrir ficha de persona
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </section>
  );
}
