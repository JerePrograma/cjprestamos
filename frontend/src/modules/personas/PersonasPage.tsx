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
      setMostrarAlta(false);
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

  const limpiarFiltro = () => {
    setBusqueda('');
    setSearchParams((actual) => {
      const siguiente = new URLSearchParams(actual);
      siguiente.delete('q');
      return siguiente;
    });
  };

  return (
    <section className="space-y-6">
      <PageHeader
        titulo="Personas"
        descripcion="Libreta operativa central: buscá rápido, editá datos base y saltá a préstamos o legajos sin fricción."
        breadcrumbs={[{ etiqueta: 'Inicio', to: '/' }, { etiqueta: 'Personas' }]}
        acciones={[
          {
            etiqueta: mostrarAlta ? 'Ocultar alta' : 'Alta rápida',
            onClick: () => setMostrarAlta((actual) => !actual),
            variante: 'principal',
          },
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
          <SectionCard
            titulo="Búsqueda y listado"
            descripcion="Filtrá por nombre, alias o teléfono para abrir una ficha en un clic."
          >
            <label className="block text-sm">
              <span className="label-ui mb-1 block">
                Buscar por nombre, alias o teléfono
              </span>

              <input
                value={busqueda}
                onChange={(event) => {
                  const valor = event.target.value;

                  setBusqueda(valor);
                  setSearchParams((actual) => {
                    const siguiente = new URLSearchParams(actual);

                    if (valor.trim()) {
                      siguiente.set('q', valor);
                    } else {
                      siguiente.delete('q');
                    }

                    return siguiente;
                  });
                }}
                placeholder="Ej: Ana, Ani, 11..."
              />
            </label>

            <div className="mt-4 overflow-hidden rounded-2xl border border-subtle bg-surface">
              <div className="flex items-center justify-between border-b border-subtle px-3 py-2">
                <span className="text-sm font-semibold text-app">
                  Resultados
                </span>

                {busqueda.trim() ? (
                  <StatusPill texto="Filtro activo" tone="neutral" />
                ) : (
                  <span className="text-xs text-muted">Sin filtro</span>
                )}
              </div>

              {listado.isLoading ? (
                <p className="px-3 py-4 text-sm text-muted">
                  Cargando personas...
                </p>
              ) : listado.isError ? (
                <p className="mensaje-error m-3">
                  No se pudo cargar el listado.
                </p>
              ) : personasFiltradas.length === 0 ? (
                <div className="p-3">
                  <EmptyState
                    titulo="No hay resultados"
                    descripcion="Probá otro término o registrá una persona nueva."
                    accion={{ etiqueta: 'Limpiar filtro', onClick: limpiarFiltro }}
                  />
                </div>
              ) : (
                <ul className="grid max-h-[58vh] gap-2 overflow-auto p-2">
                  {personasFiltradas.map((persona) => {
                    const activa = seleccionId === persona.id;

                    return (
                      <li key={persona.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setSeleccionId(persona.id);
                            setSearchParams((actual) => {
                              const siguiente = new URLSearchParams(actual);
                              siguiente.set('personaId', String(persona.id));
                              return siguiente;
                            });
                            setModoEdicion(false);
                          }}
                          className={[
                            'w-full text-left',
                            activa ? 'card-activa' : 'card-interactiva',
                          ].join(' ')}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              aria-hidden="true"
                              className="inline-block h-2.5 w-2.5 rounded-full border border-subtle"
                              style={estiloColor(persona.colorReferencia)}
                            />

                            <span className="truncate font-semibold text-app">
                              {persona.nombre}
                            </span>
                          </div>

                          <div className="mt-1 truncate text-xs text-muted">
                            {persona.alias || persona.telefono || 'Sin dato extra'}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </SectionCard>

          {mostrarAlta && (
            <SectionCard
              titulo="Alta de persona"
              descripcion="Completá solo lo necesario. Se puede editar después."
            >
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

        <div className="space-y-4">
          {!detalle.data && !detalle.isLoading && !detalle.isError && !seleccionId ? (
            <SectionCard
              titulo="Detalle de persona"
              descripcion="Seleccioná una persona del listado para ver su información operativa."
            >
              <EmptyState
                titulo="Sin persona seleccionada"
                descripcion="Elegí una persona para editar datos, revisar préstamos y operar legajo."
              />
            </SectionCard>
          ) : modoEdicion ? (
            <SectionCard
              titulo="Editar persona"
              descripcion="Ajustes de datos operativos de contacto y referencia."
            >
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
                <div className="panel-accent text-sm text-soft">
                  Consejo rápido: desde esta persona podés abrir préstamos relacionados en el módulo{' '}
                  <Link
                    to="/prestamos"
                    className="font-semibold text-app underline decoration-sky-300 underline-offset-4"
                  >
                    Préstamos
                  </Link>{' '}
                  o revisar información contextual en{' '}
                  <Link
                    to="/legajos"
                    className="font-semibold text-app underline decoration-sky-300 underline-offset-4"
                  >
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