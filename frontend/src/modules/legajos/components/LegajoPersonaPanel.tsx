import { useEffect, useMemo, useState } from 'react';
import {
  useActualizarLegajoPersona,
  useAdjuntosLegajo,
  useCrearLegajoPersona,
  useDescargarAdjuntoLegajo,
  useEliminarAdjuntoLegajo,
  useLegajoPersona,
  useSubirAdjuntoLegajo,
} from '../hooks/useLegajoPersona';
import {
  crearPayloadDesdeLegajo,
  payloadInicialLegajo,
  type LegajoAdjunto,
  type LegajoPersonaPayload,
} from '../types/legajo';

type Props = {
  personaId: number;
};

function formatearTamano(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const kb = bytes / 1024;

  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }

  return `${(kb / 1024).toFixed(2)} MB`;
}

function descargarBlob(blob: Blob, nombreArchivo: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = nombreArchivo;
  link.click();

  URL.revokeObjectURL(url);
}

export function LegajoPersonaPanel({ personaId }: Props) {
  const legajo = useLegajoPersona(personaId);
  const crearLegajo = useCrearLegajoPersona(personaId);
  const actualizarLegajo = useActualizarLegajoPersona(personaId);
  const existeLegajo = Boolean(legajo.data);

  const adjuntos = useAdjuntosLegajo(personaId, existeLegajo);
  const subirAdjunto = useSubirAdjuntoLegajo(personaId);
  const eliminarAdjunto = useEliminarAdjuntoLegajo(personaId);
  const descargarAdjunto = useDescargarAdjuntoLegajo(personaId);

  const [formulario, setFormulario] = useState<LegajoPersonaPayload>(payloadInicialLegajo);
  const [errorFormulario, setErrorFormulario] = useState<string | null>(null);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [errorAdjuntos, setErrorAdjuntos] = useState<string | null>(null);

  useEffect(() => {
    if (legajo.data) {
      setFormulario(crearPayloadDesdeLegajo(legajo.data));
      return;
    }

    if (!legajo.data) {
      setFormulario(payloadInicialLegajo);
    }
  }, [legajo.data]);

  const textoEncabezado = useMemo(
    () => (existeLegajo ? 'Legajo de la persona' : 'Legajo no creado todavía'),
    [existeLegajo],
  );

  const guardandoLegajo = crearLegajo.isPending || actualizarLegajo.isPending;

  const guardarLegajo = async () => {
    setErrorFormulario(null);

    try {
      if (existeLegajo) {
        await actualizarLegajo.mutateAsync(formulario);
      } else {
        await crearLegajo.mutateAsync(formulario);
      }
    } catch {
      setErrorFormulario('No se pudo guardar el legajo. Revisá la conexión e intentá nuevamente.');
    }
  };

  const subirArchivo = async () => {
    if (!archivo) {
      setErrorAdjuntos('Seleccioná un archivo antes de subir.');
      return;
    }

    setErrorAdjuntos(null);

    try {
      await subirAdjunto.mutateAsync(archivo);
      setArchivo(null);
    } catch {
      setErrorAdjuntos('No se pudo subir el adjunto. Validá tipo/tamaño e intentá nuevamente.');
    }
  };

  const descargarArchivo = async (adjunto: LegajoAdjunto) => {
    setErrorAdjuntos(null);

    try {
      const respuesta = await descargarAdjunto.mutateAsync(adjunto.id);
      descargarBlob(respuesta.blob, respuesta.nombreArchivo);
    } catch {
      setErrorAdjuntos('No se pudo descargar el adjunto seleccionado.');
    }
  };

  const eliminarArchivo = async (adjuntoId: number) => {
    setErrorAdjuntos(null);

    try {
      await eliminarAdjunto.mutateAsync(adjuntoId);
    } catch {
      setErrorAdjuntos('No se pudo eliminar el adjunto.');
    }
  };

  return (
    <section className="panel space-y-5 p-4 sm:p-5">
      <header className="space-y-1">
        <h3 className="text-base font-semibold text-app">
          {textoEncabezado}
        </h3>

        <p className="text-sm text-soft">
          Información contextual y privada separada de los datos básicos.
        </p>
      </header>

      {legajo.isLoading ? (
        <p className="text-sm text-muted">Cargando legajo...</p>
      ) : legajo.isError ? (
        <p className="mensaje-error">No se pudo cargar el legajo de la persona.</p>
      ) : (
        <>
          {!existeLegajo && (
            <p className="surface-inset text-sm">
              La persona todavía no tiene legajo cargado.
              Completá los datos y presioná "Crear legajo" para registrarlo.
            </p>
          )}

          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm">
              <span className="label-ui mb-1 block">Dirección</span>
              <input
                value={formulario.direccion}
                onChange={(event) =>
                  setFormulario((actual) => ({
                    ...actual,
                    direccion: event.target.value,
                  }))
                }
              />
            </label>

            <label className="text-sm">
              <span className="label-ui mb-1 block">Ocupación</span>
              <input
                value={formulario.ocupacion}
                onChange={(event) =>
                  setFormulario((actual) => ({
                    ...actual,
                    ocupacion: event.target.value,
                  }))
                }
              />
            </label>

            <label className="text-sm">
              <span className="label-ui mb-1 block">Fuente de ingreso</span>
              <input
                value={formulario.fuenteIngreso}
                onChange={(event) =>
                  setFormulario((actual) => ({
                    ...actual,
                    fuenteIngreso: event.target.value,
                  }))
                }
              />
            </label>

            <label className="text-sm">
              <span className="label-ui mb-1 block">Contacto alternativo</span>
              <input
                value={formulario.contactoAlternativo}
                onChange={(event) =>
                  setFormulario((actual) => ({
                    ...actual,
                    contactoAlternativo: event.target.value,
                  }))
                }
              />
            </label>
          </div>

          <label className="block text-sm">
            <span className="label-ui mb-1 block">Documentación pendiente</span>
            <textarea
              value={formulario.documentacionPendiente}
              onChange={(event) =>
                setFormulario((actual) => ({
                  ...actual,
                  documentacionPendiente: event.target.value,
                }))
              }
              rows={2}
            />
          </label>

          <label className="block text-sm">
            <span className="label-ui mb-1 block">Notas internas</span>
            <textarea
              value={formulario.notasInternas}
              onChange={(event) =>
                setFormulario((actual) => ({
                  ...actual,
                  notasInternas: event.target.value,
                }))
              }
              rows={3}
            />
          </label>

          <label className="block text-sm">
            <span className="label-ui mb-1 block">Observaciones generales</span>
            <textarea
              value={formulario.observacionesGenerales}
              onChange={(event) =>
                setFormulario((actual) => ({
                  ...actual,
                  observacionesGenerales: event.target.value,
                }))
              }
              rows={3}
            />
          </label>

          {errorFormulario && (
            <p className="mensaje-error">
              {errorFormulario}
            </p>
          )}

          <div className="flex justify-end border-t border-subtle pt-4">
            <button
              type="button"
              onClick={guardarLegajo}
              className="boton-principal px-3 py-2"
              disabled={guardandoLegajo}
            >
              {guardandoLegajo
                ? 'Guardando...'
                : existeLegajo
                  ? 'Guardar cambios de legajo'
                  : 'Crear legajo'}
            </button>
          </div>

          <div className="space-y-4 border-t border-subtle pt-4">
            <header className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-semibold text-app">
                  Adjuntos del legajo
                </h4>

                <p className="mt-1 text-xs text-muted">
                  Documentación y archivos asociados a esta persona.
                </p>
              </div>
            </header>

            {!existeLegajo ? (
              <p className="surface-inset text-sm">
                Primero guardá el legajo para poder subir adjuntos.
              </p>
            ) : (
              <>
                <div className="surface-inset flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    type="file"
                    onChange={(event) => setArchivo(event.target.files?.[0] ?? null)}
                    className="text-sm"
                  />

                  <button
                    type="button"
                    className="boton-secundario px-3 py-2"
                    onClick={subirArchivo}
                    disabled={subirAdjunto.isPending}
                  >
                    {subirAdjunto.isPending ? 'Subiendo...' : 'Subir adjunto'}
                  </button>
                </div>

                {errorAdjuntos && (
                  <p className="mensaje-error">
                    {errorAdjuntos}
                  </p>
                )}

                {adjuntos.isLoading ? (
                  <p className="text-sm text-muted">Cargando adjuntos...</p>
                ) : adjuntos.isError ? (
                  <p className="mensaje-error">No se pudieron cargar los adjuntos.</p>
                ) : (adjuntos.data ?? []).length === 0 ? (
                  <p className="surface-inset text-sm">
                    Todavía no hay adjuntos cargados.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {(adjuntos.data ?? []).map((adjunto) => (
                      <li
                        key={adjunto.id}
                        className="card-interactiva flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0 text-sm">
                          <p className="truncate font-semibold text-app">
                            {adjunto.nombreOriginal}
                          </p>

                          <p className="mt-0.5 text-xs text-muted">
                            {adjunto.tipoContenido} · {formatearTamano(adjunto.tamanoBytes)}
                          </p>
                        </div>

                        <div className="flex shrink-0 flex-wrap gap-2">
                          <button
                            type="button"
                            className="boton-secundario px-3 py-1.5 text-xs"
                            onClick={() => descargarArchivo(adjunto)}
                          >
                            Descargar
                          </button>

                          <button
                            type="button"
                            className="boton-danger px-3 py-1.5 text-xs"
                            onClick={() => eliminarArchivo(adjunto.id)}
                            disabled={eliminarAdjunto.isPending}
                          >
                            Eliminar
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        </>
      )}
    </section>
  );
}
