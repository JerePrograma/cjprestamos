import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { PageHeader } from '../../../shared/ui/PageHeader';
import { SectionCard } from '../../../shared/ui/SectionCard';
import { useListadoPersonas } from '../../personas/hooks/usePersonas';
import { PrestamoAltaPanel } from '../components/PrestamoAltaPanel';
import { PrestamosListadoPanel } from '../components/PrestamosListadoPanel';
import { PrestamoWorkspace } from '../components/PrestamoWorkspace';
import {
  DEFAULT_WORKSPACE_TAB,
  esWorkspaceTab,
  type WorkspaceTab,
} from '../components/WorkspaceTabs';
import { useListadoPrestamos } from '../hooks/usePrestamos';

type VistaMovilPrestamos = 'listado' | 'workspace';

const vistasMoviles: Array<{
  id: VistaMovilPrestamos;
  etiqueta: string;
  descripcion: string;
}> = [
  { id: 'listado', etiqueta: 'Explorar', descripcion: 'Buscar y elegir préstamo' },
  { id: 'workspace', etiqueta: 'Operar', descripcion: 'Cuotas, pagos y resumen' },
];

function obtenerPrestamoIdDesdeParams(searchParams: URLSearchParams) {
  const prestamoId = searchParams.get('prestamoId');

  if (!prestamoId) {
    return null;
  }

  const valor = Number(prestamoId);
  return Number.isFinite(valor) && valor > 0 ? valor : null;
}

export function PrestamosPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [seleccionId, setSeleccionId] = useState<number | null>(() => {
    return obtenerPrestamoIdDesdeParams(searchParams);
  });

  const [vistaMovil, setVistaMovil] = useState<VistaMovilPrestamos>(() => {
    const vista = searchParams.get('vista');
    return vista === 'workspace' || vista === 'listado' ? vista : 'listado';
  });

  const [mostrarAlta, setMostrarAlta] = useState(
    () => searchParams.get('alta') === '1',
  );

  const [tabWorkspace, setTabWorkspace] = useState<WorkspaceTab>(() => {
    const tab = searchParams.get('tab');
    return esWorkspaceTab(tab) ? tab : DEFAULT_WORKSPACE_TAB;
  });

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

      siguiente.set('tab', tabWorkspace);

      return siguiente;
    });
  }, [seleccionId, vistaMovil, mostrarAlta, tabWorkspace, setSearchParams]);

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
    setTabWorkspace(DEFAULT_WORKSPACE_TAB);
  };

  const seleccionarPrestamo = (prestamoId: number) => {
    if (seleccionId !== prestamoId) {
      setTabWorkspace(DEFAULT_WORKSPACE_TAB);
    }

    setSeleccionId(prestamoId);
  };

  const prestamosTotal = prestamos.data?.length ?? 0;

  return (
    <section className="space-y-6">
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
          { etiqueta: 'pestaña activa', valor: tabWorkspace },
        ]}
      />

      <SectionCard
        titulo="Circuito sugerido"
        descripcion="1) Elegir préstamo, 2) revisar resumen/cuotas/pagos, 3) volver al listado."
        suave
      >
        <p className="text-sm text-soft">
          Si todavía no existe el préstamo, usá <strong className="text-app">Nuevo préstamo</strong>.
          Para editar datos base de persona, entrá a{' '}
          <Link
            to="/personas"
            className="font-semibold text-app underline decoration-sky-300 underline-offset-4"
          >
            Personas
          </Link>
          .
        </p>
      </SectionCard>

      <div className="panel p-2 sm:hidden">
        <nav className="grid grid-cols-2 gap-2" aria-label="Navegación de préstamos en móvil">
          {vistasMoviles.map((vista) => {
            const activa = vistaMovil === vista.id;

            return (
              <button
                key={vista.id}
                type="button"
                onClick={() => setVistaMovil(vista.id)}
                className={activa ? 'card-activa text-left' : 'card-interactiva text-left'}
              >
                <span className="block text-sm font-semibold text-app">
                  {vista.etiqueta}
                </span>

                <span className="mt-0.5 block text-xs text-muted">
                  {vista.descripcion}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="space-y-4 xl:hidden">
        {mostrarAlta && (
          <PrestamoAltaPanel
            personas={personas.data ?? []}
            personasLoading={personas.isLoading}
            onCreado={onCreado}
          />
        )}

        {vistaMovil === 'listado' && (
          <PrestamosListadoPanel
            isLoading={prestamos.isLoading}
            isError={prestamos.isError}
            prestamos={prestamos.data ?? []}
            personasPorId={personasPorId}
            seleccionId={seleccionId}
            onSeleccionar={(prestamoId) => {
              seleccionarPrestamo(prestamoId);
              setVistaMovil('workspace');
            }}
          />
        )}

        {vistaMovil === 'workspace' && (
          <PrestamoWorkspace
            prestamoId={seleccionId}
            personasPorId={personasPorId}
            tabActiva={tabWorkspace}
            onCambiarTab={setTabWorkspace}
          />
        )}
      </div>

      <div className="hidden gap-4 xl:grid xl:grid-cols-[320px_minmax(0,1fr)]">
        <PrestamosListadoPanel
          isLoading={prestamos.isLoading}
          isError={prestamos.isError}
          prestamos={prestamos.data ?? []}
          personasPorId={personasPorId}
          seleccionId={seleccionId}
          onSeleccionar={seleccionarPrestamo}
        />

        <div className="space-y-4">
          {mostrarAlta && (
            <PrestamoAltaPanel
              personas={personas.data ?? []}
              personasLoading={personas.isLoading}
              onCreado={onCreado}
            />
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
            <PrestamoWorkspace
              prestamoId={seleccionId}
              personasPorId={personasPorId}
              tabActiva={tabWorkspace}
              onCambiarTab={setTabWorkspace}
            />
          )}
        </div>
      </div>
    </section>
  );
}
