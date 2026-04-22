import { PageHeader } from '../../components/ui/PageHeader';
import { SectionCard } from '../../components/ui/SectionCard';
import { formatearMonedaSinCentavos } from '../../utils/moneda';
import { useControlCajaDashboard } from './hooks/useDashboard';

const tarjetasCaja = [
  { clave: 'cajaDisponible', titulo: 'Caja disponible', descripcion: 'Capital recuperado + ganancia realizada.' },
  { clave: 'inversionActiva', titulo: 'Inversión activa', descripcion: 'Capital actualmente colocado en préstamos activos.' },
  { clave: 'capitalPendiente', titulo: 'Capital pendiente', descripcion: 'Capital aún no recuperado en cartera activa.' },
  { clave: 'gananciaRealizada', titulo: 'Ganancia realizada', descripcion: 'Ganancia ya confirmada por pagos registrados.' },
  { clave: 'gananciaProyectada', titulo: 'Ganancia proyectada', descripcion: 'Ganancia esperada por cobrar en préstamos activos.' },
] as const;

const tarjetasMes = [
  { clave: 'ingresosMesActual', titulo: 'Ingresos mes actual' },
  { clave: 'egresosMesActual', titulo: 'Egresos mes actual' },
  { clave: 'balanceMesActual', titulo: 'Balance mes actual' },
] as const;

const proyecciones = [
  { clave: 'proyeccionCobro30Dias', titulo: 'Cobro proyectado 30 días' },
  { clave: 'proyeccionCobro60Dias', titulo: 'Cobro proyectado 60 días' },
  { clave: 'proyeccionCobro90Dias', titulo: 'Cobro proyectado 90 días' },
] as const;

export function ControlCajaPage() {
  const controlCaja = useControlCajaDashboard();

  return (
    <section className="space-y-5">
      <PageHeader
        titulo="Control de caja"
        descripcion="Módulo contable operativo para controlar inversión, recupero, rentabilidad y proyección de cobros sin salir del flujo manual-first."
        breadcrumbs={[{ etiqueta: 'Inicio' }, { etiqueta: 'Control de caja' }]}
      />

      {controlCaja.isError && (
        <div className="mensaje-error">
          No se pudo cargar el módulo de control de caja.
          <button
            type="button"
            onClick={() => controlCaja.refetch()}
            className="ml-2 font-medium underline decoration-red-400 underline-offset-2"
          >
            Reintentar
          </button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {tarjetasCaja.map((tarjeta) => {
          const valor = controlCaja.data?.[tarjeta.clave];
          return (
            <article key={tarjeta.clave} className="panel-soft p-4">
              <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-300">{tarjeta.titulo}</h2>
              <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                {controlCaja.isLoading || controlCaja.isFetching || valor === undefined ? 'Cargando...' : formatearMonedaSinCentavos(valor)}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{tarjeta.descripcion}</p>
            </article>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard titulo="Cierre del mes" descripcion="Foto mensual para seguimiento de ingresos, egresos y balance operativo.">
          <div className="grid gap-3 sm:grid-cols-3">
            {tarjetasMes.map((tarjeta) => (
              <article key={tarjeta.clave} className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-900/60">
                <p className="text-xs text-slate-500 dark:text-slate-400">{tarjeta.titulo}</p>
                <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {controlCaja.data ? formatearMonedaSinCentavos(controlCaja.data[tarjeta.clave]) : 'Cargando...'}
                </p>
              </article>
            ))}
          </div>
        </SectionCard>

        <SectionCard titulo="Rendimiento de cartera" descripcion="Indicadores rápidos para contaduría diaria.">
          <div className="grid gap-3 sm:grid-cols-2">
            <article className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-900/60">
              <p className="text-xs text-slate-500 dark:text-slate-400">Recupero de capital</p>
              <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
                {controlCaja.data ? `${controlCaja.data.recuperoCapitalPorcentaje.toFixed(2)}%` : 'Cargando...'}
              </p>
            </article>
            <article className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-900/60">
              <p className="text-xs text-slate-500 dark:text-slate-400">Rendimiento esperado</p>
              <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
                {controlCaja.data ? `${controlCaja.data.rendimientoEsperadoPorcentaje.toFixed(2)}%` : 'Cargando...'}
              </p>
            </article>
            <article className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-900/60">
              <p className="text-xs text-slate-500 dark:text-slate-400">Cuotas pendientes</p>
              <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">{controlCaja.data?.cuotasPendientes ?? 'Cargando...'}</p>
            </article>
            <article className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-900/60">
              <p className="text-xs text-slate-500 dark:text-slate-400">Vencen próximos 7 días</p>
              <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">{controlCaja.data?.cuotasVencenProximos7Dias ?? 'Cargando...'}</p>
            </article>
          </div>
        </SectionCard>
      </div>

      <SectionCard titulo="Proyección de cobro" descripcion="Herramienta simple para planificar caja y prioridades de cobranza.">
        <div className="grid gap-3 sm:grid-cols-3">
          {proyecciones.map((item) => (
            <article key={item.clave} className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-900/60">
              <p className="text-xs text-slate-500 dark:text-slate-400">{item.titulo}</p>
              <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
                {controlCaja.data ? formatearMonedaSinCentavos(controlCaja.data[item.clave]) : 'Cargando...'}
              </p>
            </article>
          ))}
        </div>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          Cartera en mora actual: <span className="font-semibold">{controlCaja.data ? formatearMonedaSinCentavos(controlCaja.data.carteraEnMora) : 'Cargando...'}</span>
        </p>
      </SectionCard>
    </section>
  );
}
