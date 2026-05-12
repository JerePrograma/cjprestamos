import { StatusPill } from '../../../components/ui/StatusPill';
import type { CalculoPrestamoResultado, PrestamoResponse } from '../types/prestamo';
import {
  etiquetaFrecuencia,
  formatearFecha,
  formatearMoneda,
} from '../utils/prestamoUi';

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

function valorTexto(valor: string | number | null | undefined) {
  if (valor === null || valor === undefined || String(valor).trim() === '') {
    return '—';
  }

  return String(valor);
}

function tonoEstado(estado: PrestamoResponse['estado']) {
  if (estado === 'ACTIVO') return 'success';
  if (estado === 'RENEGOCIADO') return 'warning';
  if (estado === 'FINALIZADO') return 'neutral';
  return 'danger';
}

function DatoDetalle({ etiqueta, valor }: { etiqueta: string; valor: string | number | null | undefined }) {
  return (
    <div className="card-interactiva">
      <dt className="label-ui">{etiqueta}</dt>
      <dd className="mt-1 font-semibold text-app">{valorTexto(valor)}</dd>
    </div>
  );
}

function DatoEconomico({ etiqueta, valor }: { etiqueta: string; valor: number }) {
  return (
    <div className="surface-inset">
      <dt className="label-ui">{etiqueta}</dt>
      <dd className="mt-1 text-base font-semibold text-app">{formatearMoneda(valor)}</dd>
    </div>
  );
}

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
    <div className="space-y-4">
      <dl className="grid gap-3 md:grid-cols-2">
        <DatoDetalle etiqueta="Préstamo" valor={`#${detalle.id}`} />
        <DatoDetalle
          etiqueta="Persona"
          valor={personasPorId.get(detalle.personaId) ?? `Persona ${detalle.personaId}`}
        />
        <DatoDetalle etiqueta="Monto inicial" valor={formatearMoneda(detalle.montoInicial)} />

        <div className="card-interactiva">
          <dt className="label-ui">Estado</dt>
          <dd className="mt-2">
            <StatusPill texto={detalle.estado} tone={tonoEstado(detalle.estado)} />
          </dd>
        </div>

        <DatoDetalle etiqueta="% fijo sugerido" valor={detalle.porcentajeFijoSugerido} />
        <DatoDetalle etiqueta="Interés manual" valor={detalle.interesManualOpcional} />
        <DatoDetalle etiqueta="Cantidad de cuotas" valor={detalle.cantidadCuotas} />
        <DatoDetalle
          etiqueta="Frecuencia"
          valor={etiquetaFrecuencia(detalle.frecuenciaTipo, detalle.frecuenciaCadaDias)}
        />
        <DatoDetalle etiqueta="Frecuencia cada X días" valor={detalle.frecuenciaCadaDias} />
        <DatoDetalle
          etiqueta={detalle.frecuenciaTipo === 'FECHAS_MANUALES' ? 'Fecha inicial auxiliar' : 'Fecha base'}
          valor={formatearFecha(detalle.fechaBase)}
        />
        <DatoDetalle etiqueta="Usa fechas manuales" valor={detalle.usarFechasManuales ? 'Sí' : 'No'} />
        <DatoDetalle etiqueta="Referencia" valor={detalle.referenciaCodigo} />

        <div className="card-interactiva md:col-span-2">
          <dt className="label-ui">Observaciones</dt>
          <dd className="mt-1 font-medium text-app">{valorTexto(detalle.observaciones)}</dd>
        </div>
      </dl>

      <section className="surface-inset">
        <h3 className="mb-3 text-sm font-semibold text-app">
          Referencia y notas
        </h3>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm">
            <span className="label-ui mb-1 block">Referencia</span>
            <input
              maxLength={80}
              value={formularioReferencia.referenciaCodigo}
              onChange={(event) =>
                onCambiarReferencia('referenciaCodigo', event.target.value)
              }
            />
          </label>

          <label className="text-sm">
            <span className="label-ui mb-1 block">Observaciones</span>
            <textarea
              maxLength={600}
              value={formularioReferencia.observaciones}
              onChange={(event) =>
                onCambiarReferencia('observaciones', event.target.value)
              }
              rows={3}
            />
          </label>
        </div>

        {errorReferencia && <p className="mensaje-error mt-3">{errorReferencia}</p>}
        {mensajeReferencia && <p className="mensaje-exito mt-3">{mensajeReferencia}</p>}

        <button
          type="button"
          onClick={onGuardarReferencia}
          disabled={guardandoReferencia}
          className="boton-principal mt-3"
        >
          {guardandoReferencia ? 'Guardando referencia...' : 'Guardar referencia'}
        </button>
      </section>

      <section className="panel-accent">
        <h3 className="mb-3 text-sm font-semibold text-app">
          Resumen económico
        </h3>

        {resumenLoading ? (
          <p className="text-sm text-muted">Calculando resumen...</p>
        ) : resumenError || !resumen ? (
          <p className="mensaje-error">No se pudo calcular el resumen económico.</p>
        ) : (
          <dl className="grid gap-3 text-sm md:grid-cols-2">
            <DatoEconomico etiqueta="Total a devolver" valor={resumen.totalADevolver} />
            <DatoEconomico etiqueta="Cuota sugerida" valor={resumen.cuotaSugerida} />
            <DatoEconomico etiqueta="Monto inicial" valor={resumen.montoInvertido} />
            <DatoEconomico etiqueta="Monto ganado estimado" valor={resumen.montoGanadoEstimado} />
            <DatoEconomico etiqueta="Monto por ganar" valor={resumen.montoPorGanar} />
          </dl>
        )}
      </section>
    </div>
  );
}