import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { PageHeader } from '../../../shared/ui/PageHeader';
import { SectionCard } from '../../../shared/ui/SectionCard';
import { obtenerMensajeErrorApi } from '../../../shared/api/apiError';
import { PersonaDetalle } from '../components/PersonaDetalle';
import { PersonaFormulario } from '../components/PersonaFormulario';
import { PersonasListadoPanel } from '../components/PersonasListadoPanel';
import {
  useActualizarPersona,
  useCrearPersona,
  useDetallePersona,
  useEliminarPersona,
  useListadoPersonas,
} from '../hooks/usePersonas';
import {
  crearPayloadDesdePersona,
  type EstadoListadoPersonas,
  payloadInicialPersona,
  type PersonaPayload,
} from '../types/persona';
import { coincideBusquedaPersona } from '../utils/personaUi';

const estadosListadoPersonas: EstadoListadoPersonas[] = ['activas', 'bajas', 'todas'];

function obtenerEstadoDesdeParams(searchParams: URLSearchParams): EstadoListadoPersonas {
  const estado = searchParams.get('estado');
  return estadosListadoPersonas.includes(estado as EstadoListadoPersonas)
    ? (estado as EstadoListadoPersonas)
    : 'activas';
}

export function PersonasPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [busqueda, setBusqueda] = useState(searchParams.get('q') ?? '');
  const [estadoPersonas, setEstadoPersonas] = useState<EstadoListadoPersonas>(() =>
    obtenerEstadoDesdeParams(searchParams),
  );
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

  const listado = useListadoPersonas(estadoPersonas);
  const listadoCompleto = useListadoPersonas('todas');
  const detalle = useDetallePersona(seleccionId);
  const crear = useCrearPersona();
  const actualizar = useActualizarPersona();
  const eliminar = useEliminarPersona();

  const personasFiltradas = useMemo(
    () => (listado.data ?? []).filter((persona) => coincideBusquedaPersona(persona, busqueda)),
    [listado.data, busqueda],
  );

  const contadores = useMemo(() => {
    const todas = listadoCompleto.data ?? [];
    return {
      activas: todas.filter((persona) => persona.activo).length,
      bajas: todas.filter((persona) => !persona.activo).length,
      visibles: personasFiltradas.length,
    };
  }, [listadoCompleto.data, personasFiltradas.length]);

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

    setErrorEdicion(null);

    try {
      await eliminar.mutateAsync(seleccionId);
      setErrorEdicion(null);
    } catch (error) {
      setErrorEdicion(obtenerMensajeErrorApi(error, 'No se pudo dar de baja la persona.'));
    }
  };

  const reactivarPersona = async () => {
    if (!seleccionId || !detalle.data) {
      return;
    }

    setErrorEdicion(null);

    try {
      await actualizar.mutateAsync({
        id: seleccionId,
        payload: { ...crearPayloadDesdePersona(detalle.data), activo: true },
      });
      setErrorEdicion(null);
      setEstadoPersonas('activas');
      setSearchParams((actual) => {
        const siguiente = new URLSearchParams(actual);
        siguiente.set('estado', 'activas');
        return siguiente;
      });
    } catch (error) {
      setErrorEdicion(obtenerMensajeErrorApi(error, 'No se pudo reactivar la persona.'));
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

  const actualizarBusqueda = (valor: string) => {
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
  };

  const seleccionarPersona = (personaId: number) => {
    setSeleccionId(personaId);
    setSearchParams((actual) => {
      const siguiente = new URLSearchParams(actual);
      siguiente.set('personaId', String(personaId));
      return siguiente;
    });
    setModoEdicion(false);
  };

  const actualizarEstado = (estado: EstadoListadoPersonas) => {
    setEstadoPersonas(estado);
    setSearchParams((actual) => {
      const siguiente = new URLSearchParams(actual);
      if (estado === 'activas') {
        siguiente.delete('estado');
      } else {
        siguiente.set('estado', estado);
      }
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
          { etiqueta: 'personas activas', valor: String(contadores.activas) },
          { etiqueta: 'dadas de baja', valor: String(contadores.bajas) },
          { etiqueta: 'visible(s)', valor: String(contadores.visibles) },
          { etiqueta: 'persona seleccionada', valor: seleccionId ? `#${seleccionId}` : 'ninguna' },
        ]}
      />

      <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <aside className="space-y-4">
          <PersonasListadoPanel
            busqueda={busqueda}
            estado={estadoPersonas}
            personas={personasFiltradas}
            contadores={contadores}
            isLoading={listado.isLoading}
            isError={listado.isError}
            seleccionId={seleccionId}
            onCambiarBusqueda={actualizarBusqueda}
            onCambiarEstado={actualizarEstado}
            onSeleccionar={seleccionarPersona}
            onLimpiarFiltro={limpiarFiltro}
          />

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
                onReactivar={reactivarPersona}
                deshabilitarBaja={eliminar.isPending}
                deshabilitarReactivar={actualizar.isPending}
              />

              {errorEdicion && (
                <p className="mensaje-error">{errorEdicion}</p>
              )}

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
