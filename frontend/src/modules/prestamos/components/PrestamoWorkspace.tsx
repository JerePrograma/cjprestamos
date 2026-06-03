import { useMemo } from "react";
import { useCuotasPrestamo } from "../../cuotas/hooks/useCuotasPrestamo";
import { usePagosPrestamo } from "../../pagos/hooks/usePagos";
import {
  useDetallePrestamo,
  useResumenPrestamo,
} from "../hooks/usePrestamos";
import { usePrestamoCuotasOperacion } from "../hooks/usePrestamoCuotasOperacion";
import { usePrestamoPagosOperacion } from "../hooks/usePrestamoPagosOperacion";
import { usePrestamoReferenciaForm } from "../hooks/usePrestamoReferenciaForm";
import type { PersonaPrestamoResumen } from "../types/prestamo";
import { CuotasPrestamoTab } from "./CuotasPrestamoTab";
import { PagosPrestamoTab } from "./PagosPrestamoTab";
import { ResumenPrestamoTab } from "./ResumenPrestamoTab";
import { WorkspaceTabs, type WorkspaceTab } from "./WorkspaceTabs";

type PrestamoWorkspaceProps = {
  prestamoId: number | null;
  personasPorId: Map<number, PersonaPrestamoResumen>;
  tabActiva: WorkspaceTab;
  onCambiarTab: (tab: WorkspaceTab) => void;
  onEliminarPrestamo: (prestamoId: number) => void;
  eliminandoPrestamo: boolean;
  mensajeOperacion: string | null;
  errorOperacion: string | null;
};

export function PrestamoWorkspace({
  prestamoId,
  personasPorId,
  tabActiva,
  onCambiarTab,
  onEliminarPrestamo,
  eliminandoPrestamo,
  mensajeOperacion,
  errorOperacion,
}: PrestamoWorkspaceProps) {
  const detallePrestamo = useDetallePrestamo(prestamoId);
  const cuotasPrestamo = useCuotasPrestamo(prestamoId);
  const resumenPrestamo = useResumenPrestamo(detallePrestamo.data ?? null);
  const pagosPrestamo = usePagosPrestamo(prestamoId);

  const detalle = detallePrestamo.data ?? null;
  const resumen = resumenPrestamo.data ?? null;

  const puedeRegistrarPago =
    !detalle?.eliminado &&
    (detalle?.estado === "ACTIVO" || detalle?.estado === "RENEGOCIADO");

  const cuotasActuales = useMemo(
    () => cuotasPrestamo.data ?? [],
    [cuotasPrestamo.data],
  );

  const cuotasConSaldo = useMemo(
    () =>
      cuotasActuales.filter(
        (cuota) => cuota.montoProgramado > cuota.montoPagado,
      ),
    [cuotasActuales],
  );

  const totalProgramado = useMemo(() => {
    if (resumen) {
      return resumen.totalADevolver;
    }

    return cuotasActuales.reduce(
      (acumulado, cuota) => acumulado + cuota.montoProgramado,
      0,
    );
  }, [resumen, cuotasActuales]);

  const totalPagado = useMemo(
    () =>
      cuotasActuales.reduce(
        (acumulado, cuota) => acumulado + cuota.montoPagado,
        0,
      ),
    [cuotasActuales],
  );

  const saldoPendiente = Math.max(totalProgramado - totalPagado, 0);
  const referencia = usePrestamoReferenciaForm(detalle);
  const cuotasOperacion = usePrestamoCuotasOperacion({
    prestamoId,
    detalle,
    cuotas: cuotasActuales,
    resumen,
    puedeRegistrarPago,
  });
  const pagosOperacion = usePrestamoPagosOperacion({ prestamoId });
  const personaDetalle = detalle ? personasPorId.get(detalle.personaId) : null;
  const confirmarEliminacion = () => {
    if (!detalle) {
      return;
    }

    const confirmado = window.confirm(
      "Esto ocultará el préstamo de la operación diaria, dashboard y reportes principales. No se borrarán cuotas, pagos ni historial. ¿Querés continuar?",
    );

    if (confirmado) {
      onEliminarPrestamo(detalle.id);
    }
  };

  return (
    <div className="panel space-y-4 p-4 sm:p-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-app">
            Workspace del préstamo
          </h2>

          <p className="mt-0.5 text-xs text-muted">
            Resumen económico, cuotas y pagos del préstamo seleccionado.
          </p>
        </div>

        {detalle && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge-ui">
              #{detalle.id} · {personaDetalle?.nombre ?? `Persona ${detalle.personaId}`}
            </span>

            {!detalle.eliminado && (
              <button
                type="button"
                onClick={confirmarEliminacion}
                disabled={eliminandoPrestamo}
                className="boton-danger px-3 py-2 text-xs"
              >
                {eliminandoPrestamo ? "Eliminando..." : "Eliminar préstamo"}
              </button>
            )}
          </div>
        )}
      </header>

      {mensajeOperacion && <p className="mensaje-exito">{mensajeOperacion}</p>}
      {errorOperacion && <p className="mensaje-error">{errorOperacion}</p>}

      {prestamoId === null ? (
        <p className="text-sm text-muted">
          Seleccioná un préstamo para ver el detalle.
        </p>
      ) : detallePrestamo.isLoading ? (
        <p className="text-sm text-muted">Cargando detalle...</p>
      ) : detallePrestamo.isError || !detalle ? (
        <p className="mensaje-error">
          No se pudo cargar el detalle del préstamo.
        </p>
      ) : (
        <div className="space-y-4">
          {detalle.eliminado && (
            <p className="mensaje-warning">
              Este préstamo está eliminado de la operación diaria. Se conserva el detalle para auditoría interna.
            </p>
          )}

          <WorkspaceTabs tabActiva={tabActiva} onCambiarTab={onCambiarTab} />

          {tabActiva === "resumen" && (
            <ResumenPrestamoTab
              detalle={detalle}
              personasPorId={personasPorId}
              formularioReferencia={referencia.formularioReferencia}
              onCambiarReferencia={referencia.cambiarReferencia}
              onGuardarReferencia={referencia.guardarReferenciaPrestamo}
              guardandoReferencia={referencia.guardandoReferencia}
              errorReferencia={referencia.errorReferencia}
              mensajeReferencia={referencia.mensajeReferencia}
              resumen={resumen}
              resumenLoading={resumenPrestamo.isLoading}
              resumenError={resumenPrestamo.isError}
            />
          )}

          {tabActiva === "cuotas" && (
            <CuotasPrestamoTab
              detalle={detalle}
              cuotas={cuotasActuales}
              cuotasLoading={cuotasPrestamo.isLoading}
              cuotasError={cuotasPrestamo.isError}
              totalProgramado={totalProgramado}
              totalPagado={totalPagado}
              saldoPendiente={saldoPendiente}
              filasCuotasManuales={cuotasOperacion.filasCuotasManuales}
              onCambiarFilaManual={cuotasOperacion.actualizarFilaCuotaManual}
              onGenerarCuotas={cuotasOperacion.generarCuotas}
              generandoCuotas={cuotasOperacion.generandoCuotas}
              cuotasAjuste={cuotasOperacion.cuotasAjuste}
              onCambiarCuotaAjuste={cuotasOperacion.actualizarCuotaAjuste}
              onGuardarAjuste={cuotasOperacion.guardarAjusteCuotas}
              guardandoAjuste={cuotasOperacion.guardandoAjuste}
              errorCuotas={cuotasOperacion.errorCuotas}
              mensajeCuotas={cuotasOperacion.mensajeCuotas}
              errorAjusteCuotas={cuotasOperacion.errorAjusteCuotas}
              mensajeAjusteCuotas={cuotasOperacion.mensajeAjusteCuotas}
              onPagarCuota={cuotasOperacion.pagarCuotaDirecta}
              pagandoCuotaId={cuotasOperacion.pagandoCuotaId}
              puedeRegistrarPago={puedeRegistrarPago}
              errorPagoCuota={cuotasOperacion.errorPagoCuota}
              mensajePagoCuota={cuotasOperacion.mensajePagoCuota}
            />
          )}

          {tabActiva === "pagos" && (
            <PagosPrestamoTab
              formularioPago={pagosOperacion.formularioPago}
              onCambiarCampoPago={pagosOperacion.cambiarCampoPago}
              cuotasConSaldo={cuotasConSaldo}
              onAlternarCuotaPago={pagosOperacion.alternarCuotaPago}
              onGuardarPago={pagosOperacion.guardarPago}
              guardandoPago={pagosOperacion.guardandoPago}
              puedeRegistrarPago={puedeRegistrarPago}
              errorPago={pagosOperacion.errorPago}
              mensajePago={pagosOperacion.mensajePago}
              pagosLoading={pagosPrestamo.isLoading}
              pagosError={pagosPrestamo.isError}
              pagos={pagosPrestamo.data ?? []}
            />
          )}
        </div>
      )}
    </div>
  );
}
