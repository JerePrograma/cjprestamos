import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageHeader } from '../../components/ui/PageHeader';
import { SectionCard } from '../../components/ui/SectionCard';
import { StatusPill } from '../../components/ui/StatusPill';
import { obtenerMensajeErrorApi } from '../../services/apiError';
import { PersonaDetalle } from './components/PersonaDetalle';
import { PersonaFormulario } from './components/PersonaFormulario';
import {
  useActualizarPersona,
  useCrearPersona,
  useDetallePersona,
  useEliminarPersona,
  useListadoPersonas,
} from './hooks/usePersonas';
import {
  crearPayloadDesdePersona,
  payloadInicialPersona,
  type Persona,
  type PersonaPayload,
} from './types/persona';

function coincideBusqueda(persona: Persona, termino: string) {
  const t = termino.toLowerCase().trim();

  if (!t) {
    return true;
  }

  return [persona.nombre, persona.alias ?? '', persona.telefono ?? '']
    .join(' ')
    .toLowerCase()
    .includes(t);
}

function estiloColor(colorReferencia: string | null) {
  if (!colorReferencia || !colorReferencia.trim()) {
    return { backgroundColor: '#cbd5e1' };
  }

  return { backgroundColor: colorReferencia };
}

export function PersonasPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [busqueda, setBusqueda] = useState(searchParams.get('q') ?? '');
  const [seleccionId, setSeleccionId] = useState<number | null>(() => {
    const valor = searchParams.get('personaId');
    return valor ? Number(valor) : null;
  });
  const [modoEdicion, setModoEdicion] = useState(false);
  const [mostrarAlta, setMostrarAlta] = useState(false);
  const [nuevo, setNuevo] = useState<PersonaPayload>(payloadInicialPersona);
  const [errorNuevo, setErrorNuevo] = useState<string | null>(null);
  const [edicion, setEdicion] = useState<PersonaPayload>(payloadInicialPersona);
  const [errorEdicion, setErrorEdicion] = useState<string | null>(null);

  const listado = useListadoPersonas();
  const detalle = useDetallePersona(seleccionId);
  const crear = useCrearPersona();
  const actualizar = useActualizarPersona();
  const eliminar = useEliminarPersona();

  const personasFiltradas = useMemo(
    () => (listado.data ?? []).filter((persona) => coincideBusqueda(persona, busqueda)),
    [listado.data, busqueda],
  );

  const iniciarEdicion = () => {
    if (!detalle.data) {
      return;
    }

    setErrorEdicion(null);
    setEdicion(crearPayloadDesdePersona(detalle.data));
    setModoEdicion(true);
  };

  const guardarNueva = async () => {
    if (!nuevo.nombre.trim()) {
      setErrorNuevo('El nombre es obligatorio.');
      return;
    }

    setErrorNuevo(null);

    try {
      const persona = await crear.mutateAsync(nuevo);
      setNuevo(payloadInicialPersona);
      setSeleccionId(persona.id);
      setSearchParams((actual) => {
        const siguiente = new URLSearchParams(actual);
        siguiente.set('personaId', String(persona.id));
        return siguiente;
      });
    } catch {
      setErrorNuevo(
        obtenerMensajeErrorApi(
          crear.error,
          'No se pudo guardar la persona. Revisá los datos e intentá nuevamente.',
        ),
      );
    }
  };

  const guardarEdicion = async () => {
    if (!seleccionId) {
      return;
    }

    if (!edicion.nombre.trim()) {
      setErrorEdicion('El nombre es obligatorio.');
      return;
    }

    setErrorEdicion(null);

    try {
      await actualizar.mutateAsync({ id: seleccionId, payload: edicion });
      setModoEdicion(false);
    } catch (error) {
      setErrorEdicion(obtenerMensajeErrorApi(error, 'No se pudo actualizar la persona.'));
    }
  };

  const darDeBaja = async () => {
    if (!seleccionId) {
      return;
    }

    try {
      await eliminar.mutateAsync(seleccionId);
    } catch (error) {
      setErrorEdicion(obtenerMensajeErrorApi(error, 'No se pudo dar de baja la persona.'));
    }
  };

  return (
    <section className="space-y-4">
      <PageHeader
        titulo="Personas"
        descripcion="Libreta operativa central: buscá rápido, editá datos base y saltá a préstamos o legajos sin fricción."
        breadcrumbs={[{ etiqueta: 'Inicio', to: '/' }, { etiqueta: 'Personas' }]}
        acciones={[
          { etiqueta: mostrarAlta ? 'Ocultar alta' : 'Alta rápida', onClick: () => setMostrarAlta((actual) => !actual), variante: 'principal' },
          { etiqueta: 'Ir a legajos', to: '/legajos', variante: 'secundario' },
        ]}
        estados={[
          { etiqueta: 'personas registradas', valor: String(listado.data?.length ?? 0) },
          { etiqueta: 'resultado(s) filtrado(s)', valor: String(personasFiltradas.length) },
          { etiqueta: 'persona seleccionada', valor: seleccionId ? `#${seleccionId}` : 'ninguna' },
        ]}
      />

      <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <aside className="space-y-4">
          <SectionCard titulo="Búsqueda y listado" descripcion="Filtrá por nombre, alias o teléfono para abrir una ficha en un clic.">
            <label className="block text-sm text-slate-700">
              Buscar por nombre, alias o teléfono
              <input
                value={busqueda}
                onChange={(event) => {
                  const valor = event.target.value;
                  setBusqueda(valor);
                  setSearchParams((actual) => {
                    const siguiente = new URLSearchParams(actual);
                    if (valor.trim()) siguiente.set('q', valor);
                    else siguiente.delete('q');
                    return siguiente;
                  });
                }}
                placeholder="Ej: Ana, Ani, 11..."
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
              />
            </label>

            <div className="mt-3 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2 text-sm">
                <span className="font-medium text-slate-700">Resultados</span>
                {busqueda.trim() ? <StatusPill texto="Filtro activo" tone="neutral" /> : <span className="text-xs text-slate-500">Sin filtro</span>}
              </div>

              {listado.isLoading ? (
                <p className="px-3 py-4 text-sm text-slate-600">Cargando personas...</p>
              ) : listado.isError ? (
                <p className="px-3 py-4 text-sm text-red-700">No se pudo cargar el listado.</p>
              ) : personasFiltradas.length === 0 ? (
                <div className="p-3">
                  <EmptyState titulo="No hay resultados" descripcion="Probá otro término o registrá una persona nueva." accion={{ etiqueta: 'Limpiar filtro', onClick: () => setBusqueda('') }} />
                </div>
              ) : (
                <ul className="max-h-[58vh] overflow-auto">
                  {personasFiltradas.map((persona) => (
                    <li key={persona.id}>
                      <button
                        onClick={() => {
                          setSeleccionId(persona.id);
                          setSearchParams((actual) => {
                            const siguiente = new URLSearchParams(actual);
                            siguiente.set('personaId', String(persona.id));
                            return siguiente;
                          });
                          setModoEdicion(false);
                        }}
                        className={`w-full border-b border-slate-100 px-3 py-2.5 text-left text-sm hover:bg-slate-50 ${
                          seleccionId === persona.id ? 'bg-slate-100' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="inline-block h-2.5 w-2.5 rounded-full border border-slate-300" style={estiloColor(persona.colorReferencia)} />
                          <span className="font-medium text-slate-900">{persona.nombre}</span>
                        </div>
                        <div className="text-xs text-slate-500">{persona.alias || persona.telefono || 'Sin dato extra'}</div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </SectionCard>

          {mostrarAlta && (
            <SectionCard titulo="Alta de persona" descripcion="Completá solo lo necesario. Se puede editar después.">
              <PersonaFormulario
                titulo="Nueva persona"
                textoBoton="Guardar persona"
                valor={nuevo}
                onChange={setNuevo}
                onSubmit={guardarNueva}
                loading={crear.isPending}
                error={errorNuevo}
              />
            </SectionCard>
          )}
        </aside>

        <div className="space-y-3">
          {!detalle.data && !detalle.isLoading && !detalle.isError && !seleccionId ? (
            <SectionCard titulo="Detalle de persona" descripcion="Seleccioná una persona del listado para ver su información operativa.">
              <EmptyState titulo="Sin persona seleccionada" descripcion="Elegí una persona para editar datos, revisar préstamos y operar legajo." />
            </SectionCard>
          ) : modoEdicion ? (
            <SectionCard titulo="Editar persona" descripcion="Ajustes de datos operativos de contacto y referencia.">
              <PersonaFormulario
                titulo="Editar persona"
                textoBoton="Guardar cambios"
                valor={edicion}
                onChange={setEdicion}
                onSubmit={guardarEdicion}
                onCancel={() => setModoEdicion(false)}
                loading={actualizar.isPending}
                error={errorEdicion}
              />
            </SectionCard>
          ) : (
            <>
              <PersonaDetalle
                persona={detalle.data ?? null}
                loading={detalle.isLoading}
                error={detalle.isError ? 'No se pudo cargar el detalle.' : null}
                onEditar={iniciarEdicion}
                onDarDeBaja={darDeBaja}
                deshabilitarBaja={eliminar.isPending}
              />

              {detalle.data && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  Consejo rápido: desde esta persona podés abrir préstamos relacionados en el módulo{' '}
                  <Link to="/prestamos" className="font-medium text-slate-800 underline decoration-slate-300 underline-offset-2">
                    Préstamos
                  </Link>{' '}
                  o revisar información contextual en{' '}
                  <Link to={`/legajos`} className="font-medium text-slate-800 underline decoration-slate-300 underline-offset-2">
                    Legajos
                  </Link>
                  .
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
