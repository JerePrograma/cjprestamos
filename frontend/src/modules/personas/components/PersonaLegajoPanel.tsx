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

export function PersonaLegajoPanel({ personaId }: Props) {
  const legajo = useLegajoPersona(personaId);
  const crearLegajo = useCrearLegajoPersona(personaId);
  const actualizarLegajo = useActualizarLegajoPersona(personaId);
  const existeLegajo = legajo.isSuccess;
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

    if (legajo.isError) {
      setFormulario(payloadInicialLegajo);
    }
  }, [legajo.data, legajo.isError]);

  const textoEncabezado = useMemo(
    () => (existeLegajo ? 'Legajo de la persona' : 'Legajo no creado todavía'),
    [existeLegajo],
  );

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
    <section className="panel space-y-4 p-4 sm:p-5">
      <header className="space-y-1">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{textoEncabezado}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-300">Información contextual y privada separada de los datos básicos.</p>
      </header>

      {legajo.isLoading ? (
        <p className="text-sm text-slate-600 dark:text-slate-300">Cargando legajo...</p>
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm">
              Dirección
              <input
                value={formulario.direccion}
                onChange={(event) => setFormulario((actual) => ({ ...actual, direccion: event.target.value }))}
                className="mt-1 w-full"
              />
            </label>
            <label className="text-sm">
              Ocupación
              <input
                value={formulario.ocupacion}
                onChange={(event) => setFormulario((actual) => ({ ...actual, ocupacion: event.target.value }))}
                className="mt-1 w-full"
              />
            </label>
            <label className="text-sm">
              Fuente de ingreso
              <input
                value={formulario.fuenteIngreso}
                onChange={(event) => setFormulario((actual) => ({ ...actual, fuenteIngreso: event.target.value }))}
                className="mt-1 w-full"
              />
            </label>
            <label className="text-sm">
              Contacto alternativo
              <input
                value={formulario.contactoAlternativo}
                onChange={(event) => setFormulario((actual) => ({ ...actual, contactoAlternativo: event.target.value }))}
                className="mt-1 w-full"
              />
            </label>
          </div>

          <label className="text-sm">
            Documentación pendiente
            <textarea
              value={formulario.documentacionPendiente}
              onChange={(event) => setFormulario((actual) => ({ ...actual, documentacionPendiente: event.target.value }))}
              className="mt-1 w-full"
              rows={2}
            />
          </label>

          <label className="text-sm">
            Notas internas
            <textarea
              value={formulario.notasInternas}
              onChange={(event) => setFormulario((actual) => ({ ...actual, notasInternas: event.target.value }))}
              className="mt-1 w-full"
              rows={3}
            />
          </label>

          <label className="text-sm">
            Observaciones generales
            <textarea
              value={formulario.observacionesGenerales}
              onChange={(event) => setFormulario((actual) => ({ ...actual, observacionesGenerales: event.target.value }))}
              className="mt-1 w-full"
              rows={3}
            />
          </label>

          {errorFormulario && <p className="mensaje-error">{errorFormulario}</p>}

          <div className="flex justify-end border-t border-slate-200 pt-3 dark:border-slate-800">
            <button onClick={guardarLegajo} className="boton-principal px-3 py-2" disabled={crearLegajo.isPending || actualizarLegajo.isPending}>
              {crearLegajo.isPending || actualizarLegajo.isPending
                ? 'Guardando...'
                : existeLegajo
                  ? 'Guardar cambios de legajo'
                  : 'Crear legajo'}
            </button>
          </div>

          <div className="space-y-3 border-t border-slate-200 pt-3 dark:border-slate-800">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Adjuntos del legajo</h4>

            {!existeLegajo ? (
              <p className="text-sm text-slate-500 dark:text-slate-300">Primero guardá el legajo para poder subir adjuntos.</p>
            ) : (
              <>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    type="file"
                    onChange={(event) => setArchivo(event.target.files?.[0] ?? null)}
                    className="text-sm"
                  />
                  <button className="boton-secundario px-3 py-2" onClick={subirArchivo} disabled={subirAdjunto.isPending}>
                    {subirAdjunto.isPending ? 'Subiendo...' : 'Subir adjunto'}
                  </button>
                </div>

                {errorAdjuntos && <p className="mensaje-error">{errorAdjuntos}</p>}

                {adjuntos.isLoading ? (
                  <p className="text-sm text-slate-600 dark:text-slate-300">Cargando adjuntos...</p>
                ) : adjuntos.isError ? (
                  <p className="mensaje-error">No se pudieron cargar los adjuntos.</p>
                ) : (adjuntos.data ?? []).length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-300">Todavía no hay adjuntos cargados.</p>
                ) : (
                  <ul className="space-y-2">
                    {(adjuntos.data ?? []).map((adjunto) => (
                      <li key={adjunto.id} className="card-interactiva flex flex-col gap-2 p-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-sm">
                          <p className="font-medium text-slate-800 dark:text-slate-100">{adjunto.nombreOriginal}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {adjunto.tipoContenido} · {formatearTamano(adjunto.tamanoBytes)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button className="boton-secundario px-3 py-1.5 text-xs" onClick={() => descargarArchivo(adjunto)}>
                            Descargar
                          </button>
                          <button
                            className="boton-secundario px-3 py-1.5 text-xs"
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
