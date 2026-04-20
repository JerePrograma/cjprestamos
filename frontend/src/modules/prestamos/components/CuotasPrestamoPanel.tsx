import { useMemo, useState } from "react";
import type { CuotaPrestamo, PrestamoResponse } from "../types/prestamo";
import { formatearFecha, formatearMoneda } from "../utils/prestamoUi";

export type CuotaManualFila = {
  numeroCuota: string;
  fechaVencimiento: string;
  montoProgramado: string;
};

export type CuotaAjusteFila = {
  cuotaId: number;
  numeroCuota: number;
  fechaVencimiento: string;
  montoProgramado: string;
  montoPagado: number;
  estado: string;
};

type CuotasPrestamoPanelProps = {
  detalle: PrestamoResponse;
  cuotas: CuotaPrestamo[];
  cuotasLoading: boolean;
  cuotasError: boolean;
  totalProgramado: number;
  totalPagado: number;
  saldoPendiente: number;
  filasCuotasManuales: CuotaManualFila[];
  onCambiarFilaManual: (
    index: number,
    campo: keyof CuotaManualFila,
    valor: string,
  ) => void;
  onGenerarCuotas: () => void;
  generandoCuotas: boolean;
  cuotasAjuste: CuotaAjusteFila[];
  onCambiarCuotaAjuste: (
    cuotaId: number,
    campo: "fechaVencimiento" | "montoProgramado",
    valor: string,
  ) => void;
  onGuardarAjuste: () => void;
  guardandoAjuste: boolean;
  errorCuotas: string | null;
  mensajeCuotas: string | null;
  errorAjusteCuotas: string | null;
  mensajeAjusteCuotas: string | null;
};

type SeccionCuotas = "generacion" | "listado" | "renegociacion";

export function CuotasPrestamoPanel({
  detalle,
  cuotas,
  cuotasLoading,
  cuotasError,
  totalProgramado,
  totalPagado,
  saldoPendiente,
  filasCuotasManuales,
  onCambiarFilaManual,
  onGenerarCuotas,
  generandoCuotas,
  cuotasAjuste,
  onCambiarCuotaAjuste,
  onGuardarAjuste,
  guardandoAjuste,
  errorCuotas,
  mensajeCuotas,
  errorAjusteCuotas,
  mensajeAjusteCuotas,
}: CuotasPrestamoPanelProps) {
  const [seccionActiva, setSeccionActiva] = useState<SeccionCuotas>("generacion");
  const tieneCuotasGeneradas = cuotas.length > 0;

  const pendientesRenegociacion = useMemo(
    () => cuotasAjuste.length,
    [cuotasAjuste.length],
  );

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <h3 className="text-sm font-semibold text-slate-900">Cierre operativo de cuotas</h3>
        <dl className="mt-2 grid gap-2 text-sm md:grid-cols-4">
          <div>
            <dt className="text-xs text-slate-500">Estado</dt>
            <dd className="font-medium text-slate-800">
              {tieneCuotasGeneradas
                ? "Cuotas generadas"
                : "Pendiente de generación de cuotas"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Total programado</dt>
            <dd>{formatearMoneda(totalProgramado)}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Total pagado</dt>
            <dd>{formatearMoneda(totalPagado)}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Saldo pendiente</dt>
            <dd>{formatearMoneda(saldoPendiente)}</dd>
          </div>
        </dl>
      </div>

      <nav className="grid grid-cols-3 gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
        {[
          { id: "generacion", etiqueta: "Generación/Carga" },
          { id: "listado", etiqueta: `Listado (${cuotas.length})` },
          { id: "renegociacion", etiqueta: `Renegociación (${pendientesRenegociacion})` },
        ].map((seccion) => (
          <button
            key={seccion.id}
            type="button"
            onClick={() => setSeccionActiva(seccion.id as SeccionCuotas)}
            className={`rounded-md px-2 py-1.5 text-xs font-medium sm:text-sm ${
              seccionActiva === seccion.id
                ? "bg-slate-800 text-white"
                : "text-slate-700 hover:bg-white"
            }`}
          >
            {seccion.etiqueta}
          </button>
        ))}
      </nav>

      {seccionActiva === "generacion" && (
        <div className="rounded-xl border border-slate-200 p-3">
          {tieneCuotasGeneradas ? (
            <p className="subtitulo-seccion">
              Este préstamo ya tiene cuotas generadas. No se permite regeneración desde esta vista.
            </p>
          ) : detalle.frecuenciaTipo === "FECHAS_MANUALES" ? (
            <div className="space-y-3">
              <p className="subtitulo-seccion">
                Cargá cuotas manuales. Si informaste fecha inicial auxiliar en el alta, ya aparece en la primera fila.
              </p>
              <div className="space-y-2">
                {filasCuotasManuales.map((fila, index) => (
                  <div key={`cuota-manual-${index}`} className="grid gap-2 lg:grid-cols-3">
                    <label className="text-xs text-slate-600">
                      Número de cuota
                      <input
                        type="number"
                        min="1"
                        max={detalle.cantidadCuotas}
                        value={fila.numeroCuota}
                        onChange={(event) =>
                          onCambiarFilaManual(index, "numeroCuota", event.target.value)
                        }
                        className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                      />
                    </label>
                    <label className="text-xs text-slate-600">
                      Fecha de vencimiento
                      <input
                        type="date"
                        value={fila.fechaVencimiento}
                        onChange={(event) =>
                          onCambiarFilaManual(index, "fechaVencimiento", event.target.value)
                        }
                        className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                      />
                    </label>
                    <label className="text-xs text-slate-600">
                      Monto programado
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={fila.montoProgramado}
                        onChange={(event) =>
                          onCambiarFilaManual(index, "montoProgramado", event.target.value)
                        }
                        className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                      />
                    </label>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={onGenerarCuotas}
                disabled={generandoCuotas}
                className="boton-principal"
              >
                {generandoCuotas ? "Guardando cuotas..." : "Guardar cuotas manuales"}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="subtitulo-seccion">
                Este préstamo todavía no tiene cuotas. Generalas para comenzar a operar pagos e imputaciones.
              </p>
              <button
                type="button"
                onClick={onGenerarCuotas}
                disabled={generandoCuotas}
                className="boton-principal"
              >
                {generandoCuotas ? "Generando cuotas..." : "Generar cuotas"}
              </button>
            </div>
          )}
          {errorCuotas && <p className="mt-2 text-sm text-red-700">{errorCuotas}</p>}
          {mensajeCuotas && <p className="mt-2 text-sm text-emerald-700">{mensajeCuotas}</p>}
        </div>
      )}

      {seccionActiva === "listado" && (
        <div className="rounded-xl border border-slate-200 p-3">
          <h3 className="mb-2 text-sm font-semibold">Listado de cuotas</h3>
          {cuotasLoading ? (
            <p className="text-sm text-slate-500">Cargando cuotas...</p>
          ) : cuotasError ? (
            <p className="text-sm text-red-700">No se pudo cargar las cuotas del préstamo.</p>
          ) : cuotas.length === 0 ? (
            <p className="text-sm text-slate-500">Este préstamo todavía no tiene cuotas generadas.</p>
          ) : (
            <ul className="space-y-2">
              {cuotas.map((cuota) => (
                <li key={cuota.id} className="rounded border border-slate-200 px-3 py-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Cuota #{cuota.numeroCuota}</span>
                    <span className="text-xs text-slate-500">{cuota.estado}</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Vence: {formatearFecha(cuota.fechaVencimiento)}
                  </p>
                  <p className="text-xs text-slate-500">
                    Programado: {formatearMoneda(cuota.montoProgramado)} · Pagado: {formatearMoneda(cuota.montoPagado)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {seccionActiva === "renegociacion" && (
        <div className="rounded-xl border border-slate-200 p-3">
          <h3 className="mb-2 text-sm font-semibold">Renegociación manual de cuotas futuras</h3>
          <p className="mb-3 text-xs text-slate-500">
            Permite ajustar cuotas no saldadas sin tocar pagos ya registrados.
          </p>
          {cuotasAjuste.length === 0 ? (
            <p className="text-sm text-slate-500">No hay cuotas futuras pendientes para ajustar.</p>
          ) : (
            <div className="space-y-2">
              {cuotasAjuste.map((cuota) => (
                <div
                  key={`ajuste-cuota-${cuota.cuotaId}`}
                  className="grid gap-2 rounded border border-slate-200 p-2 lg:grid-cols-3"
                >
                  <p className="text-xs text-slate-600 lg:col-span-3">
                    Cuota #{cuota.numeroCuota} · Estado {cuota.estado}
                  </p>
                  <label className="text-xs text-slate-600">
                    Fecha
                    <input
                      type="date"
                      value={cuota.fechaVencimiento}
                      onChange={(event) =>
                        onCambiarCuotaAjuste(cuota.cuotaId, "fechaVencimiento", event.target.value)
                      }
                      className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                    />
                  </label>
                  <label className="text-xs text-slate-600">
                    Monto programado
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={cuota.montoProgramado}
                      onChange={(event) =>
                        onCambiarCuotaAjuste(cuota.cuotaId, "montoProgramado", event.target.value)
                      }
                      className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                    />
                  </label>
                  <p className="text-xs text-slate-500">
                    Pagado actual: {formatearMoneda(cuota.montoPagado)}
                  </p>
                </div>
              ))}
              <button
                type="button"
                onClick={onGuardarAjuste}
                disabled={guardandoAjuste}
                className="boton-principal"
              >
                {guardandoAjuste ? "Guardando ajuste..." : "Guardar ajuste de cuotas"}
              </button>
            </div>
          )}
          {errorAjusteCuotas && <p className="mt-2 text-sm text-red-700">{errorAjusteCuotas}</p>}
          {mensajeAjusteCuotas && (
            <p className="mt-2 text-sm text-emerald-700">{mensajeAjusteCuotas}</p>
          )}
        </div>
      )}
    </div>
  );
}
