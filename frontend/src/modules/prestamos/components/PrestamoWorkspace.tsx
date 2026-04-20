import { useEffect, useMemo, useState } from "react";
import { redondearMontoHaciaArriba } from "../../../utils/moneda";
import { usePagosPrestamo, useRegistrarPago } from "../../pagos/hooks/usePagos";
import {
  crearPayloadPago,
  formularioInicialPago,
  type PagoFormulario,
} from "../../pagos/types/pago";
import {
  useActualizarReferenciaPrestamo,
  useAjustarCuotasFuturasPrestamo,
  useCuotasPrestamo,
  useDetallePrestamo,
  useGenerarCuotasPrestamo,
  useResumenPrestamo,
} from "../hooks/usePrestamos";
import type {
  AjustarCuotasFuturasPayload,
  CuotaManualPayload,
  GenerarCuotasPayload,
  ReferenciaPrestamoPayload,
} from "../types/prestamo";
import { obtenerMensajeError } from "../utils/prestamoUi";
import {
  CuotasPrestamoPanel,
  type CuotaAjusteFila,
  type CuotaManualFila,
} from "./CuotasPrestamoPanel";
import { PagosPrestamoPanel } from "./PagosPrestamoPanel";
import { PrestamoDetallePanel } from "./PrestamoDetallePanel";

function construirFilasCuotasManuales(
  cantidadCuotas: number,
  fechaPrimeraCuota?: string | null,
): CuotaManualFila[] {
  return Array.from({ length: cantidadCuotas }, (_, index) => ({
    numeroCuota: String(index + 1),
    fechaVencimiento: index === 0 ? (fechaPrimeraCuota ?? "") : "",
    montoProgramado: "",
  }));
}

type PrestamoWorkspaceProps = {
  prestamoId: number | null;
  personasPorId: Map<number, string>;
};
type SeccionWorkspace = "resumen" | "cuotas" | "pagos";

export function PrestamoWorkspace({
  prestamoId,
  personasPorId,
}: PrestamoWorkspaceProps) {
  const [seccionActiva, setSeccionActiva] = useState<SeccionWorkspace>("resumen");
  const [formularioPago, setFormularioPago] = useState<PagoFormulario>(
    formularioInicialPago,
  );
  const [errorPago, setErrorPago] = useState<string | null>(null);
  const [mensajePago, setMensajePago] = useState<string | null>(null);
  const [formularioReferencia, setFormularioReferencia] = useState({
    referenciaCodigo: "",
    observaciones: "",
  });
  const [errorReferencia, setErrorReferencia] = useState<string | null>(null);
  const [mensajeReferencia, setMensajeReferencia] = useState<string | null>(null);
  const [filasCuotasManuales, setFilasCuotasManuales] = useState<CuotaManualFila[]>(
    [],
  );
  const [errorCuotas, setErrorCuotas] = useState<string | null>(null);
  const [mensajeCuotas, setMensajeCuotas] = useState<string | null>(null);
  const [cuotasAjuste, setCuotasAjuste] = useState<CuotaAjusteFila[]>([]);
  const [errorAjusteCuotas, setErrorAjusteCuotas] = useState<string | null>(null);
  const [mensajeAjusteCuotas, setMensajeAjusteCuotas] = useState<string | null>(null);

  const detallePrestamo = useDetallePrestamo(prestamoId);
  const cuotasPrestamo = useCuotasPrestamo(prestamoId);
  const resumenPrestamo = useResumenPrestamo(detallePrestamo.data ?? null);
  const pagosPrestamo = usePagosPrestamo(prestamoId);

  const generarCuotasPrestamo = useGenerarCuotasPrestamo();
  const ajustarCuotasFuturas = useAjustarCuotasFuturasPrestamo();
  const registrarPago = useRegistrarPago();
  const actualizarReferenciaPrestamo = useActualizarReferenciaPrestamo();

  const puedeRegistrarPago =
    detallePrestamo.data?.estado === "ACTIVO" ||
    detallePrestamo.data?.estado === "RENEGOCIADO";

  useEffect(() => {
    setErrorPago(null);
    setMensajePago(null);
    setFormularioPago((actual) => ({ ...actual, cuotasSeleccionadas: [] }));
    setErrorCuotas(null);
    setMensajeCuotas(null);
    setErrorAjusteCuotas(null);
    setMensajeAjusteCuotas(null);
  }, [prestamoId]);

  useEffect(() => {
    setSeccionActiva("resumen");
  }, [prestamoId]);

  useEffect(() => {
    if (!detallePrestamo.data) {
      return;
    }

    setFormularioReferencia({
      referenciaCodigo: detallePrestamo.data.referenciaCodigo ?? "",
      observaciones: detallePrestamo.data.observaciones ?? "",
    });
    setErrorReferencia(null);
    setMensajeReferencia(null);
  }, [detallePrestamo.data?.id]);

  useEffect(() => {
    const detalle = detallePrestamo.data;
    if (!detalle || detalle.frecuenciaTipo !== "FECHAS_MANUALES") {
      setFilasCuotasManuales([]);
      return;
    }

    setFilasCuotasManuales((actual) => {
      if (actual.length === detalle.cantidadCuotas) {
        if (!actual[0]?.fechaVencimiento && detalle.fechaBase) {
          const copia = [...actual];
          copia[0] = {
            ...copia[0],
            fechaVencimiento: detalle.fechaBase,
          };
          return copia;
        }
        return actual;
      }

      return construirFilasCuotasManuales(detalle.cantidadCuotas, detalle.fechaBase);
    });
  }, [
    detallePrestamo.data?.id,
    detallePrestamo.data?.frecuenciaTipo,
    detallePrestamo.data?.cantidadCuotas,
    detallePrestamo.data?.fechaBase,
  ]);

  const cuotasActuales = cuotasPrestamo.data ?? [];
  const cuotasConSaldo = useMemo(
    () => cuotasActuales.filter((cuota) => cuota.montoProgramado > cuota.montoPagado),
    [cuotasActuales],
  );

  const totalProgramado = useMemo(() => {
    if (resumenPrestamo.data) {
      return resumenPrestamo.data.totalADevolver;
    }
    return cuotasActuales.reduce((acumulado, cuota) => acumulado + cuota.montoProgramado, 0);
  }, [resumenPrestamo.data, cuotasActuales]);

  const totalPagado = useMemo(
    () => cuotasActuales.reduce((acumulado, cuota) => acumulado + cuota.montoPagado, 0),
    [cuotasActuales],
  );

  const saldoPendiente = Math.max(totalProgramado - totalPagado, 0);

  useEffect(() => {
    setCuotasAjuste(
      cuotasActuales
        .filter((cuota) => cuota.montoPagado <= 0)
        .map((cuota) => ({
          cuotaId: cuota.id,
          numeroCuota: cuota.numeroCuota,
          fechaVencimiento: cuota.fechaVencimiento ?? "",
          montoProgramado: String(cuota.montoProgramado),
          montoPagado: cuota.montoPagado,
          estado: cuota.estado,
        })),
    );
  }, [cuotasActuales]);

  const actualizarCampoPago = <K extends keyof PagoFormulario>(
    campo: K,
    valor: PagoFormulario[K],
  ) => {
    setFormularioPago((actual) => ({ ...actual, [campo]: valor }));
    setErrorPago(null);
    setMensajePago(null);
  };

  const guardarReferenciaPrestamo = async () => {
    if (!detallePrestamo.data) {
      return;
    }

    if (formularioReferencia.referenciaCodigo.length > 80) {
      setErrorReferencia("La referencia no puede superar 80 caracteres.");
      return;
    }

    if (formularioReferencia.observaciones.length > 600) {
      setErrorReferencia("Las observaciones no pueden superar 600 caracteres.");
      return;
    }

    const payload: ReferenciaPrestamoPayload = {
      referenciaCodigo: formularioReferencia.referenciaCodigo.trim() || null,
      observaciones: formularioReferencia.observaciones.trim() || null,
    };

    setErrorReferencia(null);

    try {
      await actualizarReferenciaPrestamo.mutateAsync({ id: detallePrestamo.data.id, payload });
      setMensajeReferencia("Referencia del préstamo actualizada.");
    } catch {
      setErrorReferencia("No se pudo actualizar la referencia del préstamo.");
    }
  };

  const guardarPago = async () => {
    if (!prestamoId) {
      setErrorPago("Seleccioná un préstamo antes de registrar un pago.");
      return;
    }

    if (!formularioPago.fechaPago) {
      setErrorPago("La fecha de pago es obligatoria.");
      return;
    }

    let payload;

    try {
      payload = crearPayloadPago(prestamoId, formularioPago);
    } catch (error) {
      setErrorPago(
        obtenerMensajeError(error, "No se pudo construir el pago. Revisá el monto ingresado."),
      );
      return;
    }

    try {
      await registrarPago.mutateAsync(payload);
      setMensajePago("Pago registrado correctamente.");
      setFormularioPago((actual) => ({
        ...actual,
        monto: "",
        referencia: "",
        observacion: "",
        cuotasSeleccionadas: [],
      }));
    } catch (error) {
      setErrorPago(
        obtenerMensajeError(
          error,
          "No se pudo registrar el pago. Revisá los datos e intentá nuevamente.",
        ),
      );
    }
  };

  const actualizarFilaCuotaManual = (
    index: number,
    campo: keyof CuotaManualFila,
    valor: string,
  ) => {
    setFilasCuotasManuales((actual) =>
      actual.map((fila, filaIndex) =>
        filaIndex === index ? { ...fila, [campo]: valor } : fila,
      ),
    );
    setErrorCuotas(null);
    setMensajeCuotas(null);
  };

  const alternarCuotaPago = (cuotaId: number, seleccionada: boolean) => {
    setFormularioPago((actual) => {
      const ids = new Set(actual.cuotasSeleccionadas);
      if (seleccionada) ids.add(cuotaId);
      else ids.delete(cuotaId);
      return { ...actual, cuotasSeleccionadas: Array.from(ids) };
    });
    setErrorPago(null);
    setMensajePago(null);
  };

  const actualizarCuotaAjuste = (
    cuotaId: number,
    campo: "fechaVencimiento" | "montoProgramado",
    valor: string,
  ) => {
    setCuotasAjuste((actual) =>
      actual.map((cuota) =>
        cuota.cuotaId === cuotaId ? { ...cuota, [campo]: valor } : cuota,
      ),
    );
    setErrorAjusteCuotas(null);
    setMensajeAjusteCuotas(null);
  };

  const validarCuotasManuales = (
    filas: CuotaManualFila[],
    cantidadCuotas: number,
    totalADevolver: number,
  ): { valido: true; payload: GenerarCuotasPayload } | { valido: false; mensaje: string } => {
    if (filas.length !== cantidadCuotas) {
      return {
        valido: false,
        mensaje: "La cantidad de cuotas cargadas no coincide con la cantidad esperada.",
      };
    }

    const numeros = new Set<number>();
    const cuotasManuales: CuotaManualPayload[] = [];

    for (let index = 0; index < filas.length; index += 1) {
      const fila = filas[index];
      const numero = Number(fila.numeroCuota);
      const monto = redondearMontoHaciaArriba(Number(fila.montoProgramado));

      if (!Number.isInteger(numero)) {
        return { valido: false, mensaje: `La cuota ${index + 1} debe tener número obligatorio.` };
      }
      if (numero < 1 || numero > cantidadCuotas) {
        return {
          valido: false,
          mensaje: `La cuota ${index + 1} debe tener un número entre 1 y ${cantidadCuotas}.`,
        };
      }
      if (numeros.has(numero)) {
        return { valido: false, mensaje: "No puede haber números de cuota repetidos." };
      }
      numeros.add(numero);

      if (!fila.fechaVencimiento) {
        return { valido: false, mensaje: `La cuota ${numero} debe tener fecha de vencimiento.` };
      }
      if (!(monto > 0)) {
        return { valido: false, mensaje: `La cuota ${numero} debe tener un monto mayor a 0.` };
      }

      cuotasManuales.push({
        numeroCuota: numero,
        fechaVencimiento: fila.fechaVencimiento,
        montoProgramado: monto,
      });
    }

    const totalCargado = cuotasManuales.reduce(
      (acumulado, cuota) => acumulado + cuota.montoProgramado,
      0,
    );

    if (Math.round(totalCargado * 100) !== Math.round(totalADevolver * 100)) {
      return {
        valido: false,
        mensaje: "La suma de las cuotas debe coincidir con el total a devolver.",
      };
    }

    return { valido: true, payload: { cuotasManuales } };
  };

  const generarCuotas = async () => {
    if (!detallePrestamo.data) {
      return;
    }

    if ((cuotasPrestamo.data ?? []).length > 0) {
      setErrorCuotas("Este préstamo ya tiene cuotas generadas. No se puede regenerar.");
      return;
    }

    let payload: GenerarCuotasPayload | undefined;

    if (detallePrestamo.data.frecuenciaTipo === "FECHAS_MANUALES") {
      if (!resumenPrestamo.data) {
        setErrorCuotas("No se pudo obtener el total a devolver para validar cuotas manuales.");
        return;
      }

      const validacion = validarCuotasManuales(
        filasCuotasManuales,
        detallePrestamo.data.cantidadCuotas,
        resumenPrestamo.data.totalADevolver,
      );

      if (!validacion.valido) {
        setErrorCuotas(validacion.mensaje);
        return;
      }

      payload = validacion.payload;
    }

    try {
      await generarCuotasPrestamo.mutateAsync({ id: detallePrestamo.data.id, payload });
      setMensajeCuotas(
        detallePrestamo.data.frecuenciaTipo === "FECHAS_MANUALES"
          ? "Cuotas manuales guardadas correctamente."
          : "Cuotas generadas correctamente.",
      );
    } catch (error) {
      setErrorCuotas(
        obtenerMensajeError(
          error,
          "No se pudo generar las cuotas del préstamo. Revisá los datos e intentá nuevamente.",
        ),
      );
    }
  };

  const guardarAjusteCuotas = async () => {
    if (!detallePrestamo.data) {
      return;
    }

    if (cuotasAjuste.length === 0) {
      setErrorAjusteCuotas("No hay cuotas futuras disponibles para ajustar.");
      return;
    }

    const cuotas = [];
    for (const cuota of cuotasAjuste) {
      if (!cuota.fechaVencimiento) {
        setErrorAjusteCuotas(`La cuota #${cuota.numeroCuota} requiere fecha de vencimiento.`);
        return;
      }
      const monto = redondearMontoHaciaArriba(Number(cuota.montoProgramado));
      if (!(monto > 0)) {
        setErrorAjusteCuotas(`La cuota #${cuota.numeroCuota} requiere monto mayor a 0.`);
        return;
      }
      cuotas.push({
        cuotaId: cuota.cuotaId,
        fechaVencimiento: cuota.fechaVencimiento,
        montoProgramado: monto,
      });
    }

    if (
      !window.confirm(
        "¿Confirmás la renegociación manual de cuotas futuras? Esta acción no modifica pagos ya registrados.",
      )
    ) {
      return;
    }

    const payload: AjustarCuotasFuturasPayload = {
      fechaRenegociacion: new Date().toISOString().slice(0, 10),
      cuotas,
    };

    try {
      await ajustarCuotasFuturas.mutateAsync({ id: detallePrestamo.data.id, payload });
      setMensajeAjusteCuotas("Renegociación de cuotas guardada correctamente.");
    } catch (error) {
      setErrorAjusteCuotas(
        obtenerMensajeError(error, "No se pudo guardar la renegociación de cuotas."),
      );
    }
  };

  return (
    <div className="panel space-y-3 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Workspace del préstamo</h2>
          <p className="text-xs text-slate-500">
            Resumen económico, cuotas y pagos del préstamo seleccionado.
          </p>
        </div>
        {detallePrestamo.data && (
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
            #{detallePrestamo.data.id} ·{" "}
            {personasPorId.get(detallePrestamo.data.personaId) ??
              `Persona ${detallePrestamo.data.personaId}`}
          </span>
        )}
      </div>

      {prestamoId === null ? (
        <p className="text-sm text-slate-500">Seleccioná un préstamo para ver el detalle.</p>
      ) : detallePrestamo.isLoading ? (
        <p className="text-sm text-slate-500">Cargando detalle...</p>
      ) : detallePrestamo.isError || !detallePrestamo.data ? (
        <p className="text-sm text-red-700">No se pudo cargar el detalle del préstamo.</p>
      ) : (
        <div className="space-y-3">
          <nav className="grid grid-cols-3 gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
            {[
              { id: "resumen", etiqueta: "Resumen" },
              { id: "cuotas", etiqueta: "Cuotas" },
              { id: "pagos", etiqueta: "Pagos" },
            ].map((seccion) => (
              <button
                key={seccion.id}
                type="button"
                onClick={() => setSeccionActiva(seccion.id as SeccionWorkspace)}
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

          {seccionActiva === "resumen" && (
            <PrestamoDetallePanel
              detalle={detallePrestamo.data}
              personasPorId={personasPorId}
              formularioReferencia={formularioReferencia}
              onCambiarReferencia={(campo, valor) => {
                setFormularioReferencia((actual) => ({ ...actual, [campo]: valor }));
                setErrorReferencia(null);
                setMensajeReferencia(null);
              }}
              onGuardarReferencia={guardarReferenciaPrestamo}
              guardandoReferencia={actualizarReferenciaPrestamo.isPending}
              errorReferencia={errorReferencia}
              mensajeReferencia={mensajeReferencia}
              resumen={resumenPrestamo.data ?? null}
              resumenLoading={resumenPrestamo.isLoading}
              resumenError={resumenPrestamo.isError}
            />
          )}

          {seccionActiva === "cuotas" && (
            <CuotasPrestamoPanel
              detalle={detallePrestamo.data}
              cuotas={cuotasActuales}
              cuotasLoading={cuotasPrestamo.isLoading}
              cuotasError={cuotasPrestamo.isError}
              totalProgramado={totalProgramado}
              totalPagado={totalPagado}
              saldoPendiente={saldoPendiente}
              filasCuotasManuales={filasCuotasManuales}
              onCambiarFilaManual={actualizarFilaCuotaManual}
              onGenerarCuotas={generarCuotas}
              generandoCuotas={generarCuotasPrestamo.isPending}
              cuotasAjuste={cuotasAjuste}
              onCambiarCuotaAjuste={actualizarCuotaAjuste}
              onGuardarAjuste={guardarAjusteCuotas}
              guardandoAjuste={ajustarCuotasFuturas.isPending}
              errorCuotas={errorCuotas}
              mensajeCuotas={mensajeCuotas}
              errorAjusteCuotas={errorAjusteCuotas}
              mensajeAjusteCuotas={mensajeAjusteCuotas}
            />
          )}

          {seccionActiva === "pagos" && (
            <PagosPrestamoPanel
              formularioPago={formularioPago}
              onCambiarCampoPago={actualizarCampoPago}
              cuotasConSaldo={cuotasConSaldo}
              onAlternarCuotaPago={alternarCuotaPago}
              onGuardarPago={guardarPago}
              guardandoPago={registrarPago.isPending}
              puedeRegistrarPago={puedeRegistrarPago}
              errorPago={errorPago}
              mensajePago={mensajePago}
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
