import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageHeader } from '../../components/ui/PageHeader';
import { SectionCard } from '../../components/ui/SectionCard';
import { StatusPill } from '../../components/ui/StatusPill';
import { useListadoPersonas } from '../personas/hooks/usePersonas';
import { useListadoPrestamosActivos } from '../prestamos/hooks/usePrestamos';
import type { PrestamoResponse } from '../prestamos/types/prestamo';
import { formatearFecha } from '../prestamos/utils/prestamoUi';
import { formatearMonedaSinCentavos } from '../../utils/moneda';
import { useResumenDashboard } from './hooks/useDashboard';

type TonoTarjeta = 'info' | 'success' | 'warning' | 'danger' | 'neutral';

function etiquetaEstado(estado: PrestamoResponse['estado']) {
  if (estado === 'ACTIVO') {
    return <StatusPill texto="Activo" tone="success" />;
  }

  if (estado === 'FINALIZADO') {
    return <StatusPill texto="Finalizado" tone="neutral" />;
  }

  if (estado === 'RENEGOCIADO') {
    return <StatusPill texto="Renegociado" tone="warning" />;
  }

  return <StatusPill texto={estado} tone="danger" />;
}

const tarjetas = [
  {
    clave: 'montoInvertido',
    titulo: 'Capital colocado',
    descripcion: 'Monto inicial actualmente prestado',
    esMoneda: true,
    tono: 'info',
  },
  {
    clave: 'montoGanado',
    titulo: 'Ganancia confirmada',
    descripcion: 'Interés ya cobrado por pagos registrados',
    esMoneda: true,
    tono: 'success',
  },
  {
    clave: 'montoPorGanar',
    titulo: 'Ganancia pendiente',
    descripcion: 'Interés estimado todavía no cobrado',
    esMoneda: true,
    tono: 'warning',
  },
  {
    clave: 'deudaTotal',
    titulo: 'Saldo pendiente',
    descripcion: 'Capital e intereses pendientes del sistema',
    esMoneda: true,
    tono: 'danger',
  },
  {
    clave: 'prestamosActivos',
    titulo: 'Préstamos activos',
    descripcion: 'Operaciones abiertas con seguimiento vigente',
    esMoneda: false,
    tono: 'neutral',
  },
] as const;

const accionesRapidas = [
  { etiqueta: 'Abrir control de caja', to: '/control-caja' },
  { etiqueta: 'Abrir libreta de personas', to: '/personas' },
  { etiqueta: 'Cargar préstamo nuevo', to: '/prestamos?alta=1&vista=workspace' },
  { etiqueta: 'Revisar préstamos activos', to: '/prestamos?vista=listado' },
  { etiqueta: 'Consultar legajos y adjuntos', to: '/legajos' },
] as const;

function ValorResumen({
  cargando,
  valor,
  esMoneda,
}: {
  cargando: boolean;
  valor: number | undefined;
  esMoneda: boolean;
}) {
  if (cargando) {
    return (
      <span className="inline-block h-8 w-28 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
    );
  }

  if (valor === undefined || valor === null) {
    return <span className="text-muted">Sin datos</span>;
  }

  return <>{esMoneda ? formatearMonedaSinCentavos(valor) : String(valor)}</>;
}

function TarjetaResumen({
  titulo,
  descripcion,
  valor,
  esMoneda,
  tono,
  cargando,
}: {
  titulo: string;
  descripcion: string;
  valor: number | undefined;
  esMoneda: boolean;
  tono: TonoTarjeta;
  cargando: boolean;
}) {
  return (
    <article data-tone={tono} className="metric-card">
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span aria-hidden="true" data-tone={tono} className="metric-dot" />

            <h2 className="metric-title">
              {titulo}
            </h2>
          </div>

          <p className="metric-value">
            <ValorResumen cargando={cargando} valor={valor} esMoneda={esMoneda} />
          </p>

          <p className="metric-description">
            {descripcion}
          </p>
        </div>
      </div>
    </article>
  );
}

function TextoCarga({ children }: { children: string }) {
  return (
    <p aria-live="polite" className="text-sm text-muted">
      {children}
    </p>
  );
}

function LinkSecundario({ to, children }: { to: string; children: string }) {
  return (
    <Link to={to} className="link-action">
      {children}
    </Link>
  );
}

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

  const activosRecientes = useMemo(
    () => (prestamosActivos.data ?? []).slice(0, 5),
    [prestamosActivos.data],
  );

  const personasRecientes = useMemo(
    () => (personas.data ?? []).slice(0, 5),
    [personas.data],
  );

  const cargandoResumen = resumen.isLoading || resumen.isFetching;

  return (
    <section className="space-y-6">
      <PageHeader
        titulo="Dashboard"
        descripcion="Punto de control diario para revisar capital, ganancias, deuda pendiente y operaciones abiertas sin perder contexto."
        breadcrumbs={[{ etiqueta: 'Inicio' }, { etiqueta: 'Dashboard' }]}
        acciones={[
          { etiqueta: 'Nueva persona', to: '/personas', variante: 'secundario' },
          { etiqueta: 'Nuevo préstamo', to: '/prestamos?alta=1&vista=workspace', variante: 'principal' },
        ]}
      />

      {resumen.isError && (
        <div className="mensaje-error flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span>No se pudo cargar el resumen del dashboard.</span>

          <button
            type="button"
            onClick={() => resumen.refetch()}
            className="inline-flex w-fit rounded-lg border border-red-300/70 px-2.5 py-1 text-xs font-semibold transition hover:bg-red-100 dark:border-red-500/40 dark:hover:bg-red-950/60"
          >
            Reintentar
          </button>
        </div>
      )}

      <div
        aria-busy={cargandoResumen}
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"
      >
        {tarjetas.map((tarjeta) => {
          const valor = resumen.data?.[tarjeta.clave];

          return (
            <TarjetaResumen
              key={tarjeta.clave}
              titulo={tarjeta.titulo}
              descripcion={tarjeta.descripcion}
              valor={valor}
              esMoneda={tarjeta.esMoneda}
              tono={tarjeta.tono}
              cargando={cargandoResumen}
            />
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <SectionCard
          titulo="Acciones rápidas"
          descripcion="Atajos operativos para ir directo a las pantallas de mayor uso."
        >
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
            {accionesRapidas.map((accion) => (
              <Link key={accion.to} to={accion.to} className="quick-link">
                <span className="truncate">{accion.etiqueta}</span>
                <span className="quick-link-arrow">→</span>
              </Link>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          titulo="Préstamos activos recientes"
          descripcion="Operaciones abiertas para seguir cuotas, pagos y estado de cobranza."
          acciones={<span className="badge-count">5</span>}
        >
          {prestamosActivos.isLoading ? (
            <TextoCarga>Cargando préstamos activos...</TextoCarga>
          ) : prestamosActivos.isError ? (
            <p className="mensaje-error">No se pudo cargar el listado de activos.</p>
          ) : activosRecientes.length === 0 ? (
            <EmptyState
              titulo="Sin préstamos activos"
              descripcion="Cuando cargues un préstamo activo aparecerá aquí para seguimiento rápido."
            />
          ) : (
            <ul className="space-y-3">
              {activosRecientes.map((prestamo) => {
                const nombrePersona =
                  personasPorId.get(prestamo.personaId) ?? `Persona ${prestamo.personaId}`;

                return (
                  <li key={prestamo.id} className="card-interactiva">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-app">
                          {prestamo.referenciaCodigo || `Préstamo #${prestamo.id}`}
                        </p>

                        <p className="mt-0.5 truncate text-sm text-soft">
                          {nombrePersona}
                        </p>
                      </div>

                      <div className="shrink-0">
                        {etiquetaEstado(prestamo.estado)}
                      </div>
                    </div>

                    <div className="surface-inset mt-3 grid gap-2 text-xs">
                      <div className="flex items-center justify-between gap-3">
                        <span>Monto inicial</span>
                        <strong className="text-app">
                          {formatearMonedaSinCentavos(prestamo.montoInicial)}
                        </strong>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <span>Cuotas</span>
                        <strong className="text-app">
                          {prestamo.cantidadCuotas}
                        </strong>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <span>Fecha base</span>
                        <strong className="text-app">
                          {formatearFecha(prestamo.fechaBase)}
                        </strong>
                      </div>
                    </div>

                    <LinkSecundario to={`/prestamos?prestamoId=${prestamo.id}&vista=workspace`}>
                      Abrir workspace
                    </LinkSecundario>
                  </li>
                );
              })}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          titulo="Personas recientes"
          descripcion="Acceso directo para revisar datos, editar información o abrir legajos."
          acciones={
            <Link to="/personas" className="link-action mt-0">
              Ver todas
            </Link>
          }
        >
          {personas.isLoading ? (
            <TextoCarga>Cargando personas...</TextoCarga>
          ) : personas.isError ? (
            <p className="mensaje-error">No se pudo cargar el listado de personas.</p>
          ) : personasRecientes.length === 0 ? (
            <EmptyState
              titulo="Sin personas cargadas"
              descripcion="Comenzá registrando una persona para poder crear préstamos."
            />
          ) : (
            <ul className="space-y-3">
              {personasRecientes.map((persona) => (
                <li key={persona.id} className="card-interactiva">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-app">
                        {persona.nombre}
                      </p>

                      <p className="mt-0.5 truncate text-xs text-muted">
                        {persona.alias || persona.telefono || 'Sin alias/teléfono'}
                      </p>
                    </div>

                    <span className="badge-ui shrink-0">
                      #{persona.id}
                    </span>
                  </div>

                  <LinkSecundario to={`/personas?personaId=${persona.id}`}>
                    Abrir ficha
                  </LinkSecundario>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </section>
  );
}