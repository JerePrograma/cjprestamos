import type { CalculoPrestamoResultado, PrestamoResponse } from "../types/prestamo";
import {
  etiquetaFrecuencia,
  formatearFecha,
  formatearMoneda,
} from "../utils/prestamoUi";

type ReferenciaFormulario = {
  referenciaCodigo: string;
  observaciones: string;
};

type PrestamoDetallePanelProps = {
  detalle: PrestamoResponse;
  personasPorId: Map<number, string>;
  formularioReferencia: ReferenciaFormulario;
  onCambiarReferencia: (campo: keyof ReferenciaFormulario, valor: string) => void;
  onGuardarReferencia: () => void;
  guardandoReferencia: boolean;
  errorReferencia: string | null;
  mensajeReferencia: string | null;
  resumen: CalculoPrestamoResultado | null;
  resumenLoading: boolean;
  resumenError: boolean;
};

export function PrestamoDetallePanel({
  detalle,
  personasPorId,
  formularioReferencia,
  onCambiarReferencia,
  onGuardarReferencia,
  guardandoReferencia,
  errorReferencia,
  mensajeReferencia,
  resumen,
  resumenLoading,
  resumenError,
}: PrestamoDetallePanelProps) {
  return (
    <>
      <dl className="grid gap-2 md:grid-cols-2">
        <div>
          <dt className="text-xs text-slate-500">Préstamo</dt>
          <dd className="font-medium">#{detalle.id}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Persona</dt>
          <dd>{personasPorId.get(detalle.personaId) ?? `Persona ${detalle.personaId}`}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Monto inicial</dt>
          <dd>{formatearMoneda(detalle.montoInicial)}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Estado</dt>
          <dd>{detalle.estado}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">% fijo sugerido</dt>
          <dd>{detalle.porcentajeFijoSugerido ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Interés manual</dt>
          <dd>{detalle.interesManualOpcional ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Cantidad de cuotas</dt>
          <dd>{detalle.cantidadCuotas}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Frecuencia</dt>
          <dd>{etiquetaFrecuencia(detalle.frecuenciaTipo, detalle.frecuenciaCadaDias)}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Frecuencia cada X días</dt>
          <dd>{detalle.frecuenciaCadaDias ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">
            {detalle.frecuenciaTipo === "FECHAS_MANUALES" ? "Fecha inicial auxiliar" : "Fecha base"}
          </dt>
          <dd>{formatearFecha(detalle.fechaBase)}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Usa fechas manuales</dt>
          <dd>{detalle.usarFechasManuales ? "Sí" : "No"}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Referencia</dt>
          <dd>{detalle.referenciaCodigo ?? "-"}</dd>
        </div>
        <div className="md:col-span-2">
          <dt className="text-xs text-slate-500">Observaciones</dt>
          <dd>{detalle.observaciones ?? "-"}</dd>
        </div>
      </dl>

      <div className="rounded-xl border border-slate-200 p-3">
        <h3 className="mb-2 text-sm font-semibold">Referencia y notas</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm text-slate-700">
            Referencia
            <input
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
              maxLength={80}
              value={formularioReferencia.referenciaCodigo}
              onChange={(event) =>
                onCambiarReferencia("referenciaCodigo", event.target.value)
              }
            />
          </label>
          <label className="text-sm text-slate-700">
            Observaciones
            <textarea
              className="mt-1 h-20 w-full rounded border border-slate-300 px-3 py-2"
              maxLength={600}
              value={formularioReferencia.observaciones}
              onChange={(event) => onCambiarReferencia("observaciones", event.target.value)}
            />
          </label>
        </div>

        {errorReferencia && <p className="mt-2 text-sm text-red-700">{errorReferencia}</p>}
        {mensajeReferencia && (
          <p className="mt-2 text-sm text-emerald-700">{mensajeReferencia}</p>
        )}

        <button
          type="button"
          onClick={onGuardarReferencia}
          disabled={guardandoReferencia}
          className="boton-principal mt-3"
        >
          {guardandoReferencia ? "Guardando referencia..." : "Guardar referencia"}
        </button>
      </div>

      <div className="panel-soft rounded-xl p-3">
        <h3 className="mb-2 text-sm font-semibold">Resumen económico</h3>
        {resumenLoading ? (
          <p className="text-sm text-slate-500">Calculando resumen...</p>
        ) : resumenError || !resumen ? (
          <p className="text-sm text-red-700">No se pudo calcular el resumen económico.</p>
        ) : (
          <dl className="grid gap-2 text-sm md:grid-cols-2">
            <div>
              <dt className="text-xs text-slate-500">Total a devolver</dt>
              <dd>{formatearMoneda(resumen.totalADevolver)}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Cuota sugerida</dt>
              <dd>{formatearMoneda(resumen.cuotaSugerida)}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Monto inicial</dt>
              <dd>{formatearMoneda(resumen.montoInvertido)}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Monto ganado estimado</dt>
              <dd>{formatearMoneda(resumen.montoGanadoEstimado)}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Monto por ganar</dt>
              <dd>{formatearMoneda(resumen.montoPorGanar)}</dd>
            </div>
          </dl>
        )}
      </div>
    </>
  );
}
