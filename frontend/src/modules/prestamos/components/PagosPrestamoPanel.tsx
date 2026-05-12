import type { Pago, PagoFormulario } from '../../pagos/types/pago';
import type { CuotaPrestamo } from '../types/prestamo';
import { formatearFecha, formatearMoneda } from '../utils/prestamoUi';

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
    <div className="space-y-4">
      <section className="surface-inset">
        <h3 className="text-sm font-semibold text-app">
          Registrar pago
        </h3>

        <p className="mt-1 text-xs text-muted">
          Si no seleccionás cuotas, el backend mantiene la imputación automática actual por orden.
          Si seleccionás cuotas, imputa solo sobre esas cuotas.
        </p>

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <label className="text-sm">
            <span className="label-ui mb-1 block">Fecha de pago</span>
            <input
              type="date"
              value={formularioPago.fechaPago}
              onChange={(event) => onCambiarCampoPago('fechaPago', event.target.value)}
            />
          </label>

          <label className="text-sm">
            <span className="label-ui mb-1 block">Monto</span>
            <input
              type="number"
              min="0"
              step="1"
              value={formularioPago.monto}
              onChange={(event) => onCambiarCampoPago('monto', event.target.value)}
            />
          </label>

          <label className="text-sm">
            <span className="label-ui mb-1 block">Referencia</span>
            <input
              maxLength={120}
              value={formularioPago.referencia}
              onChange={(event) => onCambiarCampoPago('referencia', event.target.value)}
            />
          </label>

          <label className="text-sm">
            <span className="label-ui mb-1 block">Observación</span>
            <input
              maxLength={600}
              value={formularioPago.observacion}
              onChange={(event) => onCambiarCampoPago('observacion', event.target.value)}
            />
          </label>
        </div>

        {cuotasConSaldo.length > 0 && (
          <div className="panel-accent mt-4">
            <p className="label-ui">
              Cuotas destino opcional
            </p>

            <p className="mt-1 text-xs text-muted">
              Dejá todas desmarcadas para usar imputación automática.
            </p>

            <div className="mt-3 space-y-2">
              {cuotasConSaldo.map((cuota) => (
                <label
                  key={`pago-cuota-${cuota.id}`}
                  className="quick-link cursor-pointer"
                >
                  <span className="truncate">
                    Cuota #{cuota.numeroCuota} · Pendiente{' '}
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

        {errorPago && <p className="mensaje-error mt-3">{errorPago}</p>}
        {mensajePago && <p className="mensaje-exito mt-3">{mensajePago}</p>}

        <button
          type="button"
          onClick={onGuardarPago}
          disabled={guardandoPago || !puedeRegistrarPago}
          className="boton-principal mt-4"
        >
          {guardandoPago ? 'Registrando pago...' : 'Registrar pago'}
        </button>
      </section>

      <section className="surface-inset">
        <h3 className="mb-3 text-sm font-semibold text-app">
          Historial de pagos
        </h3>

        {pagosLoading ? (
          <p className="text-sm text-muted">Cargando pagos...</p>
        ) : pagosError ? (
          <p className="mensaje-error">No se pudo cargar el historial de pagos.</p>
        ) : pagos.length === 0 ? (
          <p className="text-sm text-muted">Todavía no hay pagos registrados para este préstamo.</p>
        ) : (
          <ul className="space-y-2">
            {pagos.map((pago) => (
              <li key={pago.id} className="card-interactiva">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-app">
                    {formatearFecha(pago.fechaPago)}
                  </span>

                  <span className="badge-ui">
                    {pago.estado}
                  </span>
                </div>

                <p className="mt-1 text-xs text-muted">
                  Monto: <span className="font-semibold text-app">{formatearMoneda(pago.monto)}</span>
                </p>

                <p className="text-xs text-muted">
                  Referencia: {pago.referencia || '—'}
                </p>

                <p className="text-xs text-muted">
                  Observación: {pago.observacion || '—'}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}