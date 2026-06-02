import { useMemo, useState } from "react";
import type { PrestamoResponse } from "../../prestamos/types/prestamo";
import { formatearFecha, formatearMoneda } from "../../prestamos/utils/prestamoUi";
import type { CuotaAjusteFila, CuotaManualFila, CuotaPrestamo } from "../types/cuota";

export type { CuotaAjusteFila, CuotaManualFila } from "../types/cuota";

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
  onPagarCuota: (cuota: CuotaPrestamo) => void;
  pagandoCuotaId: number | null;
  puedeRegistrarPago: boolean;
  errorPagoCuota: string | null;
  mensajePagoCuota: string | null;
};

type SeccionCuotas = "generacion" | "listado" | "renegociacion";

const secciones: Array<{ id: SeccionCuotas; etiqueta: string }> = [
  { id: "generacion", etiqueta: "Generación/Carga" },
  { id: "listado", etiqueta: "Listado" },
  { id: "renegociacion", etiqueta: "Renegociación" },
];

function TabCuotas({
  activa,
  children,
  onClick,
}: {
  activa: boolean;
  children: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-lg px-2 py-1.5 text-xs font-semibold transition sm:text-sm",
        activa
          ? "bg-surface-raised text-app shadow-app-xs"
          : "text-muted hover:bg-surface-raised hover:text-app",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function MensajeExito({ children }: { children: string }) {
  return <p className="mensaje-exito mt-3">{children}</p>;
}

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
  onPagarCuota,
  pagandoCuotaId,
  puedeRegistrarPago,
  errorPagoCuota,
  mensajePagoCuota,
}: CuotasPrestamoPanelProps) {
  const [seccionActiva, setSeccionActiva] =
    useState<SeccionCuotas>("generacion");
  const tieneCuotasGeneradas = cuotas.length > 0;

  const pendientesRenegociacion = useMemo(
    () => cuotasAjuste.length,
    [cuotasAjuste.length],
  );

  return (
    <div className="space-y-4">
      <section className="surface-inset">
        <h3 className="text-sm font-semibold text-app">
          Cierre operativo de cuotas
        </h3>

        <dl className="mt-3 grid gap-3 text-sm md:grid-cols-4">
          <div>
            <dt className="label-ui">Estado</dt>
            <dd className="mt-1 font-semibold text-app">
              {tieneCuotasGeneradas
                ? "Cuotas generadas"
                : "Pendiente de generación"}
            </dd>
          </div>

          <div>
            <dt className="label-ui">Total programado</dt>
            <dd className="mt-1 font-semibold text-app">
              {formatearMoneda(totalProgramado)}
            </dd>
          </div>

          <div>
            <dt className="label-ui">Total pagado</dt>
            <dd className="mt-1 font-semibold text-app">
              {formatearMoneda(totalPagado)}
            </dd>
          </div>

          <div>
            <dt className="label-ui">Saldo pendiente</dt>
            <dd className="mt-1 font-semibold text-app">
              {formatearMoneda(saldoPendiente)}
            </dd>
          </div>
        </dl>
      </section>

      <nav className="grid grid-cols-3 gap-1 rounded-md border border-subtle bg-surface-inset p-1">
        {secciones.map((seccion) => {
          const cantidad =
            seccion.id === "listado"
              ? cuotas.length
              : seccion.id === "renegociacion"
                ? pendientesRenegociacion
                : null;

          return (
            <TabCuotas
              key={seccion.id}
              activa={seccionActiva === seccion.id}
              onClick={() => setSeccionActiva(seccion.id)}
            >
              {cantidad === null
                ? seccion.etiqueta
                : `${seccion.etiqueta} (${cantidad})`}
            </TabCuotas>
          );
        })}
      </nav>

      {seccionActiva === "generacion" && (
        <section className="surface-inset">
          {tieneCuotasGeneradas ? (
            <p className="text-sm text-soft">
              Este préstamo ya tiene cuotas generadas. No se permite
              regeneración desde esta vista.
            </p>
          ) : detalle.frecuenciaTipo === "FECHAS_MANUALES" ? (
            <div className="space-y-4">
              <p className="text-sm text-soft">
                Cargá cuotas manuales. Si informaste fecha inicial auxiliar en
                el alta, ya aparece en la primera fila.
              </p>

              <div className="space-y-3">
                {filasCuotasManuales.map((fila, index) => (
                  <div
                    key={`cuota-manual-${index}`}
                    className="card-interactiva grid gap-3 lg:grid-cols-3"
                  >
                    <label className="text-sm">
                      <span className="label-ui mb-1 block">
                        Número de cuota
                      </span>
                      <input
                        type="number"
                        min="1"
                        max={detalle.cantidadCuotas}
                        value={fila.numeroCuota}
                        onChange={(event) =>
                          onCambiarFilaManual(
                            index,
                            "numeroCuota",
                            event.target.value,
                          )
                        }
                      />
                    </label>

                    <label className="text-sm">
                      <span className="label-ui mb-1 block">
                        Fecha de vencimiento
                      </span>
                      <input
                        type="date"
                        value={fila.fechaVencimiento}
                        onChange={(event) =>
                          onCambiarFilaManual(
                            index,
                            "fechaVencimiento",
                            event.target.value,
                          )
                        }
                      />
                    </label>

                    <label className="text-sm">
                      <span className="label-ui mb-1 block">
                        Monto programado
                      </span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={fila.montoProgramado}
                        onChange={(event) =>
                          onCambiarFilaManual(
                            index,
                            "montoProgramado",
                            event.target.value,
                          )
                        }
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
                {generandoCuotas
                  ? "Guardando cuotas..."
                  : "Guardar cuotas manuales"}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-soft">
                Este préstamo todavía no tiene cuotas. Generalas para comenzar a
                operar pagos e imputaciones.
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

          {errorCuotas && <p className="mensaje-error mt-3">{errorCuotas}</p>}
          {mensajeCuotas && <MensajeExito>{mensajeCuotas}</MensajeExito>}
        </section>
      )}

      {seccionActiva === "listado" && (
        <section className="surface-inset">
          <h3 className="mb-3 text-sm font-semibold text-app">
            Listado de cuotas
          </h3>

          {cuotasLoading ? (
            <p className="text-sm text-muted">Cargando cuotas...</p>
          ) : cuotasError ? (
            <p className="mensaje-error">
              No se pudo cargar las cuotas del préstamo.
            </p>
          ) : cuotas.length === 0 ? (
            <p className="text-sm text-muted">
              Este préstamo todavía no tiene cuotas generadas.
            </p>
          ) : (
            <ul className="space-y-2">
              {cuotas.map((cuota) => {
                const saldoCuota = Math.max(
                  cuota.montoProgramado - cuota.montoPagado,
                  0,
                );
                const estaPagada = cuota.estado === "PAGADA" || saldoCuota <= 0;
                const estaPagando = pagandoCuotaId === cuota.id;

                return (
                  <li key={cuota.id} className="card-interactiva">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="font-semibold text-app">
                          Cuota #{cuota.numeroCuota}
                        </span>

                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
                          <span>
                            Vence: {formatearFecha(cuota.fechaVencimiento)}
                          </span>

                          <span>
                            Pago:{" "}
                            {cuota.fechaPago
                              ? formatearFecha(cuota.fechaPago)
                              : estaPagada
                                ? "sin fecha informada"
                                : "—"}
                          </span>
                        </div>
                      </div>

                      <span className="badge-ui">{cuota.estado}</span>
                    </div>

                    <p className="mt-2 text-xs text-muted">
                      Programado: {formatearMoneda(cuota.montoProgramado)} ·
                      Pagado: {formatearMoneda(cuota.montoPagado)} · Saldo:{" "}
                      <span className="font-semibold text-app">
                        {formatearMoneda(saldoCuota)}
                      </span>
                    </p>

                    {!estaPagada && (
                      <button
                        type="button"
                        onClick={() => onPagarCuota(cuota)}
                        disabled={
                          !puedeRegistrarPago || pagandoCuotaId !== null
                        }
                        className="mt-3 rounded-lg border border-subtle px-3 py-1.5 text-xs font-semibold text-app transition hover:bg-surface-raised disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {estaPagando ? "Pagando..." : "Pagar"}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          {errorPagoCuota && (
            <p className="mensaje-error mt-3">{errorPagoCuota}</p>
          )}
          {mensajePagoCuota && <MensajeExito>{mensajePagoCuota}</MensajeExito>}
        </section>
      )}

      {seccionActiva === "renegociacion" && (
        <section className="surface-inset">
          <h3 className="text-sm font-semibold text-app">
            Renegociación manual de cuotas futuras
          </h3>

          <p className="mt-1 text-xs text-muted">
            Permite ajustar cuotas no saldadas sin tocar pagos ya registrados.
          </p>

          {cuotasAjuste.length === 0 ? (
            <p className="mt-3 text-sm text-muted">
              No hay cuotas futuras pendientes para ajustar.
            </p>
          ) : (
            <div className="mt-3 space-y-3">
              {cuotasAjuste.map((cuota) => (
                <div
                  key={`ajuste-cuota-${cuota.cuotaId}`}
                  className="card-interactiva grid gap-3 lg:grid-cols-3"
                >
                  <p className="text-xs text-muted lg:col-span-3">
                    Cuota #{cuota.numeroCuota} · Estado {cuota.estado}
                  </p>

                  <label className="text-sm">
                    <span className="label-ui mb-1 block">Fecha</span>
                    <input
                      type="date"
                      value={cuota.fechaVencimiento}
                      onChange={(event) =>
                        onCambiarCuotaAjuste(
                          cuota.cuotaId,
                          "fechaVencimiento",
                          event.target.value,
                        )
                      }
                    />
                  </label>

                  <label className="text-sm">
                    <span className="label-ui mb-1 block">
                      Monto programado
                    </span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={cuota.montoProgramado}
                      onChange={(event) =>
                        onCambiarCuotaAjuste(
                          cuota.cuotaId,
                          "montoProgramado",
                          event.target.value,
                        )
                      }
                    />
                  </label>

                  <p className="self-end text-xs text-muted">
                    Pagado actual:{" "}
                    <span className="font-semibold text-app">
                      {formatearMoneda(cuota.montoPagado)}
                    </span>
                  </p>
                </div>
              ))}

              <button
                type="button"
                onClick={onGuardarAjuste}
                disabled={guardandoAjuste}
                className="boton-principal"
              >
                {guardandoAjuste
                  ? "Guardando ajuste..."
                  : "Guardar ajuste de cuotas"}
              </button>
            </div>
          )}

          {errorAjusteCuotas && (
            <p className="mensaje-error mt-3">{errorAjusteCuotas}</p>
          )}
          {mensajeAjusteCuotas && (
            <MensajeExito>{mensajeAjusteCuotas}</MensajeExito>
          )}
        </section>
      )}
    </div>
  );
}
