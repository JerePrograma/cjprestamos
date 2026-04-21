import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageHeader } from '../../components/ui/PageHeader';
import { SectionCard } from '../../components/ui/SectionCard';
import { useListadoPersonas } from '../personas/hooks/usePersonas';
import { PrestamoAltaPanel } from './components/PrestamoAltaPanel';
import { PrestamosListadoPanel } from './components/PrestamosListadoPanel';
import { PrestamoWorkspace } from './components/PrestamoWorkspace';
import { useListadoPrestamos } from './hooks/usePrestamos';

type VistaMovilPrestamos = 'listado' | 'workspace';

const vistasMoviles: Array<{ id: VistaMovilPrestamos; etiqueta: string; descripcion: string }> = [
  { id: 'listado', etiqueta: 'Explorar', descripcion: 'Buscar y elegir préstamo' },
  { id: 'workspace', etiqueta: 'Operar', descripcion: 'Cuotas, pagos y resumen' },
];

export function PrestamosPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [seleccionId, setSeleccionId] = useState<number | null>(() => {
    const prestamoId = searchParams.get('prestamoId');
    return prestamoId ? Number(prestamoId) : null;
  });
  const [vistaMovil, setVistaMovil] = useState<VistaMovilPrestamos>(() => {
    const vista = searchParams.get('vista');
    return vista === 'workspace' || vista === 'listado' ? vista : 'listado';
  });
  const [mostrarAlta, setMostrarAlta] = useState(() => searchParams.get('alta') === '1');

  const personas = useListadoPersonas();
  const prestamos = useListadoPrestamos();

  useEffect(() => {
    const primerPrestamo = prestamos.data?.[0];

    if (seleccionId === null && primerPrestamo) {
      setSeleccionId(primerPrestamo.id);
    }
  }, [prestamos.data, seleccionId]);

  useEffect(() => {
    setSearchParams((actual) => {
      const siguiente = new URLSearchParams(actual);
      if (seleccionId) {
        siguiente.set('prestamoId', String(seleccionId));
      } else {
        siguiente.delete('prestamoId');
      }
      siguiente.set('vista', vistaMovil);
      if (mostrarAlta) {
        siguiente.set('alta', '1');
      } else {
        siguiente.delete('alta');
      }
      return siguiente;
    });
  }, [seleccionId, vistaMovil, mostrarAlta, setSearchParams]);

  const personasPorId = useMemo(() => {
    const mapa = new Map<number, string>();
    (personas.data ?? []).forEach((persona) => {
      mapa.set(persona.id, persona.nombre);
    });
    return mapa;
  }, [personas.data]);

  const onCreado = (prestamoId: number) => {
    setSeleccionId(prestamoId);
    setMostrarAlta(false);
    setVistaMovil('workspace');
  };

  const prestamosTotal = prestamos.data?.length ?? 0;

  return (
    <section className="space-y-5">
      <PageHeader
        titulo="Préstamos"
        descripcion="Flujo operativo completo: explorá préstamos, abrí workspace y resolvé cuotas/pagos desde una misma pantalla."
        breadcrumbs={[{ etiqueta: 'Inicio', to: '/' }, { etiqueta: 'Préstamos' }]}
        acciones={[
          {
            etiqueta: mostrarAlta ? 'Cerrar alta' : 'Nuevo préstamo',
            onClick: () => setMostrarAlta((actual) => !actual),
            variante: 'principal',
          },
          { etiqueta: 'Ir a personas', to: '/personas', variante: 'secundario' },
        ]}
        estados={[
          { etiqueta: 'préstamo(s) total(es)', valor: String(prestamosTotal) },
          { etiqueta: 'selección activa', valor: seleccionId ? `#${seleccionId}` : 'ninguna' },
          { etiqueta: 'vista móvil', valor: vistaMovil },
        ]}
      />

      <SectionCard
        titulo="Circuito sugerido"
        descripcion="1) Elegir préstamo, 2) revisar resumen/cuotas/pagos, 3) volver al listado."
        suave
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Si todavía no existe el préstamo, usá <strong>Nuevo préstamo</strong>. Para editar datos base de persona, entrá a{' '}
          <Link to="/personas" className="font-semibold text-slate-800 underline decoration-slate-300 underline-offset-2 dark:text-slate-200">
            Personas
          </Link>
          .
        </p>
      </SectionCard>

      <div className="panel p-2 sm:hidden">
        <nav className="grid grid-cols-2 gap-1" aria-label="Navegación de préstamos en móvil">
          {vistasMoviles.map((vista) => (
            <button
              key={vista.id}
              type="button"
              onClick={() => setVistaMovil(vista.id)}
              className={`rounded-lg px-2 py-2 text-left text-xs font-medium transition ${
                vistaMovil === vista.id ? 'bg-slate-900 text-white dark:bg-sky-500 dark:text-slate-950' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <span className="block">{vista.etiqueta}</span>
              <span className="text-[11px] opacity-80">{vista.descripcion}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="space-y-4 xl:hidden">
        {mostrarAlta && (
          <PrestamoAltaPanel personas={personas.data ?? []} personasLoading={personas.isLoading} onCreado={onCreado} />
        )}

        {vistaMovil === 'listado' && (
          <PrestamosListadoPanel
            isLoading={prestamos.isLoading}
            isError={prestamos.isError}
            prestamos={prestamos.data ?? []}
            personasPorId={personasPorId}
            seleccionId={seleccionId}
            onSeleccionar={(prestamoId) => {
              setSeleccionId(prestamoId);
              setVistaMovil('workspace');
            }}
          />
        )}

        {vistaMovil === 'workspace' && <PrestamoWorkspace prestamoId={seleccionId} personasPorId={personasPorId} />}
      </div>

      <div className="hidden gap-4 xl:grid xl:grid-cols-[320px_minmax(0,1fr)]">
        <PrestamosListadoPanel
          isLoading={prestamos.isLoading}
          isError={prestamos.isError}
          prestamos={prestamos.data ?? []}
          personasPorId={personasPorId}
          seleccionId={seleccionId}
          onSeleccionar={setSeleccionId}
        />

        <div className="space-y-4">
          {mostrarAlta && (
            <PrestamoAltaPanel personas={personas.data ?? []} personasLoading={personas.isLoading} onCreado={onCreado} />
          )}

          {prestamosTotal === 0 && !mostrarAlta ? (
            <SectionCard titulo="Workspace" descripcion="No hay préstamos activos para operar todavía.">
              <EmptyState
                titulo="Empezá cargando un préstamo"
                descripcion="El workspace se habilita automáticamente cuando exista un préstamo en el listado."
                accion={{ etiqueta: 'Abrir alta', onClick: () => setMostrarAlta(true) }}
              />
            </SectionCard>
          ) : (
            <PrestamoWorkspace prestamoId={seleccionId} personasPorId={personasPorId} />
          )}
        </div>
      </div>
    </section>
  );
}
