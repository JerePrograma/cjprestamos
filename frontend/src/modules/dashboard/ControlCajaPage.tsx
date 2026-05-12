import { PageHeader } from '../../components/ui/PageHeader';
import { SectionCard } from '../../components/ui/SectionCard';
import { formatearMonedaSinCentavos } from '../../utils/moneda';
import { useControlCajaDashboard } from './hooks/useDashboard';

type TonoTarjeta = 'info' | 'success' | 'warning' | 'danger' | 'neutral';

const tarjetasCaja = [
  {
    clave: 'cajaDisponible',
    titulo: 'Caja disponible',
    descripcion: 'Capital recuperado + ganancia realizada.',
    tono: 'success',
  },
  {
    clave: 'inversionActiva',
    titulo: 'Inversión activa',
    descripcion: 'Capital actualmente colocado en préstamos activos.',
    tono: 'info',
  },
  {
    clave: 'capitalPendiente',
    titulo: 'Capital pendiente',
    descripcion: 'Capital aún no recuperado en cartera activa.',
    tono: 'warning',
  },
  {
    clave: 'gananciaRealizada',
    titulo: 'Ganancia realizada',
    descripcion: 'Ganancia ya confirmada por pagos registrados.',
    tono: 'success',
  },
  {
    clave: 'gananciaProyectada',
    titulo: 'Ganancia proyectada',
    descripcion: 'Ganancia esperada por cobrar en préstamos activos.',
    tono: 'neutral',
  },
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

function ValorMoneda({
  cargando,
  valor,
}: {
  cargando: boolean;
  valor: number | undefined;
}) {
  if (cargando) {
    return (
      <span className="inline-block h-7 w-28 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
    );
  }

  if (valor === undefined || valor === null) {
    return <span className="text-muted">Sin datos</span>;
  }

  return <>{formatearMonedaSinCentavos(valor)}</>;
}

function TarjetaMetrica({
  titulo,
  descripcion,
  valor,
  cargando,
  tono,
}: {
  titulo: string;
  descripcion: string;
  valor: number | undefined;
  cargando: boolean;
  tono: TonoTarjeta;
}) {
  return (
    <article data-tone={tono} className="metric-card">
      <div className="relative">
        <div className="flex items-center gap-2">
          <span aria-hidden="true" data-tone={tono} className="metric-dot" />
          <h2 className="metric-title">
            {titulo}
          </h2>
        </div>

        <p className="metric-value">
          <ValorMoneda cargando={cargando} valor={valor} />
        </p>

        <p className="metric-description">
          {descripcion}
        </p>
      </div>
    </article>
  );
}

function MiniMetrica({
  titulo,
  valor,
  cargando,
}: {
  titulo: string;
  valor: number | undefined;
  cargando: boolean;
}) {
  return (
    <article className="surface-inset">
      <p className="label-ui">
        {titulo}
      </p>

      <p className="mt-1 text-lg font-semibold text-app">
        <ValorMoneda cargando={cargando} valor={valor} />
      </p>
    </article>
  );
}

function MiniNumero({
  titulo,
  valor,
  sufijo = '',
  cargando,
}: {
  titulo: string;
  valor: number | undefined;
  sufijo?: string;
  cargando: boolean;
}) {
  return (
    <article className="surface-inset">
      <p className="label-ui">
        {titulo}
      </p>

      <p className="mt-1 text-lg font-semibold text-app">
        {cargando || valor === undefined || valor === null
          ? 'Cargando...'
          : `${valor.toFixed(sufijo ? 2 : 0)}${sufijo}`}
      </p>
    </article>
  );
}

export function ControlCajaPage() {
  const controlCaja = useControlCajaDashboard();
  const cargando = controlCaja.isLoading || controlCaja.isFetching;

  return (
    <section className="space-y-6">
      <PageHeader
        titulo="Control de caja"
        descripcion="Módulo contable operativo para controlar inversión, recupero, rentabilidad y proyección de cobros sin salir del flujo manual-first."
        breadcrumbs={[{ etiqueta: 'Inicio' }, { etiqueta: 'Control de caja' }]}
      />

      {controlCaja.isError && (
        <div className="mensaje-error flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span>No se pudo cargar el módulo de control de caja.</span>

          <button
            type="button"
            onClick={() => controlCaja.refetch()}
            className="link-action mt-0"
          >
            Reintentar
          </button>
        </div>
      )}

      <div
        aria-busy={cargando}
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"
      >
        {tarjetasCaja.map((tarjeta) => (
          <TarjetaMetrica
            key={tarjeta.clave}
            titulo={tarjeta.titulo}
            descripcion={tarjeta.descripcion}
            valor={controlCaja.data?.[tarjeta.clave]}
            cargando={cargando}
            tono={tarjeta.tono}
          />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          titulo="Cierre del mes"
          descripcion="Foto mensual para seguimiento de ingresos, egresos y balance operativo."
        >
          <div className="grid gap-3 sm:grid-cols-3">
            {tarjetasMes.map((tarjeta) => (
              <MiniMetrica
                key={tarjeta.clave}
                titulo={tarjeta.titulo}
                valor={controlCaja.data?.[tarjeta.clave]}
                cargando={cargando}
              />
            ))}
          </div>
        </SectionCard>

        <SectionCard
          titulo="Rendimiento de cartera"
          descripcion="Indicadores rápidos para contaduría diaria."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <MiniNumero
              titulo="Recupero de capital"
              valor={controlCaja.data?.recuperoCapitalPorcentaje}
              sufijo="%"
              cargando={cargando}
            />

            <MiniNumero
              titulo="Rendimiento esperado"
              valor={controlCaja.data?.rendimientoEsperadoPorcentaje}
              sufijo="%"
              cargando={cargando}
            />

            <MiniNumero
              titulo="Cuotas pendientes"
              valor={controlCaja.data?.cuotasPendientes}
              cargando={cargando}
            />

            <MiniNumero
              titulo="Vencen próximos 7 días"
              valor={controlCaja.data?.cuotasVencenProximos7Dias}
              cargando={cargando}
            />
          </div>
        </SectionCard>
      </div>

      <SectionCard
        titulo="Proyección de cobro"
        descripcion="Herramienta simple para planificar caja y prioridades de cobranza."
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {proyecciones.map((item) => (
            <MiniMetrica
              key={item.clave}
              titulo={item.titulo}
              valor={controlCaja.data?.[item.clave]}
              cargando={cargando}
            />
          ))}
        </div>

        <p className="mt-4 text-sm text-soft">
          Cartera en mora actual:{' '}
          <span className="font-semibold text-app">
            {cargando || controlCaja.data?.carteraEnMora === undefined
              ? 'Cargando...'
              : formatearMonedaSinCentavos(controlCaja.data.carteraEnMora)}
          </span>
        </p>
      </SectionCard>
    </section>
  );
}