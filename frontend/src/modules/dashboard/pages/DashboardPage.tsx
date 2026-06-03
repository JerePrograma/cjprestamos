import { type FormEvent, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { obtenerMensajeErrorApi } from '../../../shared/api/apiError';
import { obtenerFechaHoyLocal, obtenerPrimerDiaMesActualLocal } from '../../../shared/lib/dates';
import { Button } from '../../../shared/ui/Button';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { PageHeader } from '../../../shared/ui/PageHeader';
import { SectionCard } from '../../../shared/ui/SectionCard';
import { ErrorState } from '../../../shared/ui/ErrorState';
import { LoadingState } from '../../../shared/ui/LoadingState';
import { MetricCard } from '../../../shared/ui/MetricCard';
import { MoneyValue } from '../../../shared/ui/MoneyValue';
import { useListadoPersonas } from '../../personas/hooks/usePersonas';
import { useListadoPrestamosActivos } from '../../prestamos/hooks/usePrestamos';
import { PrestamoEstadoPill } from '../../prestamos/components/PrestamoEstadoPill';
import { formatearFecha } from '../../prestamos/utils/prestamoUi';
import { useExportarDashboardPdf, useResumenDashboard } from '../hooks/useDashboard';

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

function ValorResumen({ valor, esMoneda }: { valor: number | undefined; esMoneda: boolean }) {
  if (valor === undefined || valor === null) {
    return <span className="text-muted">Sin datos</span>;
  }

  return esMoneda ? <MoneyValue valor={valor} /> : <>{valor}</>;
}

function LinkSecundario({ to, children }: { to: string; children: string }) {
  return (
    <Link to={to} className="link-action">
      {children}
    </Link>
  );
}

function nombreArchivoDashboard(desde: string, hasta: string) {
  return `cjprestamos-dashboard-${desde.replace(/-/g, '')}-${hasta.replace(/-/g, '')}.pdf`;
}

function descargarBlob(blob: Blob, nombreArchivo: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nombreArchivo;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export function DashboardPage() {
  const resumen = useResumenDashboard();
  const prestamosActivos = useListadoPrestamosActivos();
  const personas = useListadoPersonas();
  const exportarPdf = useExportarDashboardPdf();
  const [fechaDesde, setFechaDesde] = useState(() => obtenerPrimerDiaMesActualLocal());
  const [fechaHasta, setFechaHasta] = useState(() => obtenerFechaHoyLocal());
  const [errorExportacion, setErrorExportacion] = useState<string | null>(null);

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
  const exportandoPdf = exportarPdf.isPending;

  async function manejarExportacionPdf(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorExportacion(null);

    if (!fechaDesde || !fechaHasta) {
      setErrorExportacion('Completá fecha desde y fecha hasta.');
      return;
    }

    if (fechaDesde > fechaHasta) {
      setErrorExportacion('La fecha desde no puede ser posterior a la fecha hasta.');
      return;
    }

    try {
      const blob = await exportarPdf.mutateAsync({ desde: fechaDesde, hasta: fechaHasta });
      descargarBlob(blob, nombreArchivoDashboard(fechaDesde, fechaHasta));
    } catch (error) {
      setErrorExportacion(obtenerMensajeErrorApi(error, 'No se pudo exportar el PDF del dashboard.'));
    }
  }

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
        <ErrorState
          mensaje="No se pudo cargar el resumen del dashboard."
          onRetry={() => resumen.refetch()}
        />
      )}

      <div
        aria-busy={cargandoResumen}
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"
      >
        {tarjetas.map((tarjeta) => {
          const valor = resumen.data?.[tarjeta.clave];

          return (
            <MetricCard
              key={tarjeta.clave}
              titulo={tarjeta.titulo}
              descripcion={tarjeta.descripcion}
              tone={tarjeta.tono}
              cargando={cargandoResumen}
            >
              <ValorResumen valor={valor} esMoneda={tarjeta.esMoneda} />
            </MetricCard>
          );
        })}
      </div>

      <SectionCard
        titulo="Exportar resumen PDF"
        descripcion="Resumen ejecutivo y auditoría operativa del dashboard y control de caja."
      >
        <form
          className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end"
          onSubmit={manejarExportacionPdf}
        >
          <label>
            <span className="label-ui mb-1 block">Fecha desde</span>
            <input
              className="input-ui"
              type="date"
              value={fechaDesde}
              onChange={(event) => setFechaDesde(event.target.value)}
              required
            />
          </label>

          <label>
            <span className="label-ui mb-1 block">Fecha hasta</span>
            <input
              className="input-ui"
              type="date"
              value={fechaHasta}
              onChange={(event) => setFechaHasta(event.target.value)}
              required
            />
          </label>

          <Button
            variante="principal"
            type="submit"
            disabled={exportandoPdf}
            className="w-full md:w-auto"
          >
            {exportandoPdf ? 'Exportando...' : 'Exportar PDF'}
          </Button>
        </form>

        {errorExportacion && (
          <p className="mensaje-error mt-3">
            {errorExportacion}
          </p>
        )}
      </SectionCard>

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
            <LoadingState mensaje="Cargando préstamos activos..." />
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
                        <PrestamoEstadoPill estado={prestamo.estado} />
                      </div>
                    </div>

                    <div className="surface-inset mt-3 grid gap-2 text-xs">
                      <div className="flex items-center justify-between gap-3">
                        <span>Monto inicial</span>
                        <strong className="text-app">
                          <MoneyValue valor={prestamo.montoInicial} />
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
            <LoadingState mensaje="Cargando personas..." />
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
