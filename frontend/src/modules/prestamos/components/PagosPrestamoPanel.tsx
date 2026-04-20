import type { Pago, PagoFormulario } from "../../pagos/types/pago";
import type { CuotaPrestamo } from "../types/prestamo";
import { formatearFecha, formatearMoneda } from "../utils/prestamoUi";

type PagosPrestamoPanelProps = {
  formularioPago: PagoFormulario;
  onCambiarCampoPago: <K extends keyof PagoFormulario>(
    campo: K,
    valor: PagoFormulario[K],
  ) => void;
  cuotasConSaldo: CuotaPrestamo[];
  onAlternarCuotaPago: (cuotaId: number, seleccionada: boolean) => void;
  onGuardarPago: () => void;
  guardandoPago: boolean;
  puedeRegistrarPago: boolean;
  errorPago: string | null;
  mensajePago: string | null;
  pagosLoading: boolean;
  pagosError: boolean;
  pagos: Pago[];
};

export function PagosPrestamoPanel({
  formularioPago,
  onCambiarCampoPago,
  cuotasConSaldo,
  onAlternarCuotaPago,
  onGuardarPago,
  guardandoPago,
  puedeRegistrarPago,
  errorPago,
  mensajePago,
  pagosLoading,
  pagosError,
  pagos,
}: PagosPrestamoPanelProps) {
  return (
    <>
      <div className="rounded-xl border border-slate-200 p-3">
        <h3 className="mb-2 text-sm font-semibold">Registrar pago</h3>
        <p className="mb-3 text-xs text-slate-500">
          Si no seleccionás cuotas, el backend mantiene la imputación automática actual por orden.
          Si seleccionás cuotas, imputa solo sobre esas cuotas.
        </p>

        <div className="grid gap-3 lg:grid-cols-2">
          <label className="text-sm text-slate-700">
            Fecha de pago
            <input
              type="date"
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
              value={formularioPago.fechaPago}
              onChange={(event) => onCambiarCampoPago("fechaPago", event.target.value)}
            />
          </label>
          <label className="text-sm text-slate-700">
            Monto
            <input
              type="number"
              min="0"
              step="0.01"
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
              value={formularioPago.monto}
              onChange={(event) => onCambiarCampoPago("monto", event.target.value)}
            />
          </label>
          <label className="text-sm text-slate-700">
            Referencia
            <input
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
              maxLength={120}
              value={formularioPago.referencia}
              onChange={(event) => onCambiarCampoPago("referencia", event.target.value)}
            />
          </label>
          <label className="text-sm text-slate-700">
            Observación
            <input
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
              maxLength={600}
              value={formularioPago.observacion}
              onChange={(event) => onCambiarCampoPago("observacion", event.target.value)}
            />
          </label>
        </div>

        {cuotasConSaldo.length > 0 && (
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Cuotas destino (opcional)
            </p>
            <p className="mb-2 text-xs text-slate-500">
              Dejá todas desmarcadas para usar imputación automática.
            </p>
            <div className="space-y-1">
              {cuotasConSaldo.map((cuota) => (
                <label
                  key={`pago-cuota-${cuota.id}`}
                  className="flex items-center justify-between gap-2 text-xs text-slate-700"
                >
                  <span>
                    Cuota #{cuota.numeroCuota} · Pendiente{" "}
                    {formatearMoneda(cuota.montoProgramado - cuota.montoPagado)}
                  </span>
                  <input
                    type="checkbox"
                    checked={formularioPago.cuotasSeleccionadas.includes(cuota.id)}
                    onChange={(event) => onAlternarCuotaPago(cuota.id, event.target.checked)}
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        {errorPago && <p className="mt-3 text-sm text-red-700">{errorPago}</p>}
        {mensajePago && <p className="mt-3 text-sm text-emerald-700">{mensajePago}</p>}

        <button
          type="button"
          onClick={onGuardarPago}
          disabled={guardandoPago || !puedeRegistrarPago}
          className="boton-principal mt-3"
        >
          {guardandoPago ? "Registrando pago..." : "Registrar pago"}
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 p-3">
        <h3 className="mb-2 text-sm font-semibold">Historial de pagos</h3>
        {pagosLoading ? (
          <p className="text-sm text-slate-500">Cargando pagos...</p>
        ) : pagosError ? (
          <p className="text-sm text-red-700">No se pudo cargar el historial de pagos.</p>
        ) : pagos.length === 0 ? (
          <p className="text-sm text-slate-500">Todavía no hay pagos registrados para este préstamo.</p>
        ) : (
          <ul className="space-y-2">
            {pagos.map((pago) => (
              <li key={pago.id} className="rounded border border-slate-200 px-3 py-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{formatearFecha(pago.fechaPago)}</span>
                  <span className="text-xs text-slate-500">{pago.estado}</span>
                </div>
                <p className="text-xs text-slate-500">Monto: {formatearMoneda(pago.monto)}</p>
                <p className="text-xs text-slate-500">Referencia: {pago.referencia || "-"}</p>
                <p className="text-xs text-slate-500">Observación: {pago.observacion || "-"}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
