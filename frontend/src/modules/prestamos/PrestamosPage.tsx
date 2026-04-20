import { useEffect, useMemo, useState } from "react";
import { PrestamoAltaPanel } from "./components/PrestamoAltaPanel";
import { usePagosPrestamo, useRegistrarPago } from "../pagos/hooks/usePagos";
import {
  crearPayloadPago,
  formularioInicialPago,
  type PagoFormulario,
} from "../pagos/types/pago";
import { useListadoPersonas } from "../personas/hooks/usePersonas";
import {
  useActualizarReferenciaPrestamo,
  useAjustarCuotasFuturasPrestamo,
  useCuotasPrestamo,
  useDetallePrestamo,
  useGenerarCuotasPrestamo,
  useListadoPrestamos,
  useResumenPrestamo,
} from "./hooks/usePrestamos";
import {
  type AjustarCuotasFuturasPayload,
  type CuotaManualPayload,
  type FrecuenciaTipo,
  type GenerarCuotasPayload,
  type PrestamoResponse,
  type ReferenciaPrestamoPayload,
} from "./types/prestamo";

type CuotaManualFila = {
  numeroCuota: string;
  fechaVencimiento: string;
  montoProgramado: string;
};

type CuotaAjusteFila = {
  cuotaId: number;
  numeroCuota: number;
  fechaVencimiento: string;
  montoProgramado: string;
  montoPagado: number;
  estado: string;
};

function formatearMoneda(valor?: number) {
  if (valor === undefined) {
    return "$ -";
  }

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(valor);
}

function formatearFecha(valor: string | null) {
  if (!valor) {
    return "Sin fecha";
  }

  return new Date(`${valor}T00:00:00`).toLocaleDateString("es-AR");
}

function etiquetaFrecuencia(
  frecuenciaTipo: FrecuenciaTipo,
  frecuenciaCadaDias: number | null,
) {
  if (frecuenciaTipo === "CADA_X_DIAS") {
    return `Cada ${frecuenciaCadaDias ?? "-"} días`;
  }

  if (frecuenciaTipo === "FECHAS_MANUALES") {
    return "Fechas manuales";
  }

  return "Mensual";
}

function etiquetaEstado(estado: PrestamoResponse["estado"]) {
  if (estado === "ACTIVO") {
    return "bg-emerald-100 text-emerald-800";
  }

  if (estado === "FINALIZADO") {
    return "bg-slate-200 text-slate-700";
  }

  if (estado === "RENEGOCIADO") {
    return "bg-amber-100 text-amber-800";
  }

  return "bg-red-100 text-red-700";
}

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

export function PrestamosPage() {
  const [seleccionId, setSeleccionId] = useState<number | null>(null);

  const personas = useListadoPersonas();
  const prestamos = useListadoPrestamos();
  const detallePrestamo = useDetallePrestamo(seleccionId);
  const cuotasPrestamo = useCuotasPrestamo(seleccionId);
  const resumenPrestamo = useResumenPrestamo(detallePrestamo.data ?? null);
  const pagosPrestamo = usePagosPrestamo(seleccionId);

  const generarCuotasPrestamo = useGenerarCuotasPrestamo();
  const ajustarCuotasFuturas = useAjustarCuotasFuturasPrestamo();
  const registrarPago = useRegistrarPago();
  const actualizarReferenciaPrestamo = useActualizarReferenciaPrestamo();
  const puedeRegistrarPago =
    detallePrestamo.data?.estado === "ACTIVO" ||
    detallePrestamo.data?.estado === "RENEGOCIADO";

  useEffect(() => {
    if (seleccionId === null && prestamos.data && prestamos.data.length > 0) {
      setSeleccionId(prestamos.data[0].id);
    }
  }, [prestamos.data, seleccionId]);

  useEffect(() => {
    setErrorPago(null);
    setMensajePago(null);
    setFormularioPago((actual) => ({ ...actual, cuotasSeleccionadas: [] }));
    setErrorCuotas(null);
    setMensajeCuotas(null);
    setErrorAjusteCuotas(null);
    setMensajeAjusteCuotas(null);
  }, [seleccionId]);

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

      return construirFilasCuotasManuales(
        detalle.cantidadCuotas,
        detalle.fechaBase,
      );
    });
  }, [
    detallePrestamo.data?.id,
    detallePrestamo.data?.frecuenciaTipo,
    detallePrestamo.data?.cantidadCuotas,
    detallePrestamo.data?.fechaBase,
  ]);

  const personasPorId = useMemo(() => {
    const mapa = new Map<number, string>();
    (personas.data ?? []).forEach((persona) => {
      mapa.set(persona.id, persona.nombre);
    });
    return mapa;
  }, [personas.data]);

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
      await actualizarReferenciaPrestamo.mutateAsync({
        id: detallePrestamo.data.id,
        payload,
      });
      setMensajeReferencia("Referencia del préstamo actualizada.");
    } catch {
      setErrorReferencia("No se pudo actualizar la referencia del préstamo.");
    }
  };

  const guardarPago = async () => {
    if (!seleccionId) {
      setErrorPago("Seleccioná un préstamo antes de registrar un pago.");
      return;
    }

    if (!formularioPago.fechaPago) {
      setErrorPago("La fecha de pago es obligatoria.");
      return;
    }

    let payload;

    try {
      payload = crearPayloadPago(seleccionId, formularioPago);
    } catch (error) {
      setErrorPago(
        obtenerMensajeError(
          error,
          "No se pudo construir el pago. Revisá el monto ingresado.",
        ),
      );
      return;
    }

    try {
      console.log("Payload registrar pago", payload);

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
      console.error("Error al registrar pago", {
        message: (error as any)?.message,
        status: (error as any)?.response?.status,
        data: (error as any)?.response?.data,
      });

      setErrorPago(
        obtenerMensajeError(
          error,
          "No se pudo registrar el pago. Revisá los datos e intentá nuevamente.",
        ),
      );
    }
  };

  const detalleActual = detallePrestamo.data;
  const cuotasActuales = cuotasPrestamo.data ?? [];
  const cuotasConSaldo = useMemo(
    () => cuotasActuales.filter((cuota) => cuota.montoProgramado > cuota.montoPagado),
    [cuotasActuales],
  );
  const tieneCuotasGeneradas = cuotasActuales.length > 0;
  const totalProgramado = useMemo(() => {
    if (resumenPrestamo.data) {
      return resumenPrestamo.data.totalADevolver;
    }

    return cuotasActuales.reduce(
      (acumulado, cuota) => acumulado + cuota.montoProgramado,
      0,
    );
  }, [resumenPrestamo.data, cuotasActuales]);
  const totalPagado = useMemo(
    () =>
      cuotasActuales.reduce((acumulado, cuota) => acumulado + cuota.montoPagado, 0),
    [cuotasActuales],
  );
  const saldoPendiente = Math.max(totalProgramado - totalPagado, 0);

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

  const alternarCuotaPago = (cuotaId: number, seleccionada: boolean) => {
    setFormularioPago((actual) => {
      const ids = new Set(actual.cuotasSeleccionadas);
      if (seleccionada) {
        ids.add(cuotaId);
      } else {
        ids.delete(cuotaId);
      }
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
      const monto = Number(fila.montoProgramado);

      if (!Number.isInteger(numero)) {
        return {
          valido: false,
          mensaje: `La cuota ${index + 1} debe tener número obligatorio.`,
        };
      }

      if (numero < 1 || numero > cantidadCuotas) {
        return {
          valido: false,
          mensaje: `La cuota ${index + 1} debe tener un número entre 1 y ${cantidadCuotas}.`,
        };
      }

      if (numeros.has(numero)) {
        return {
          valido: false,
          mensaje: "No puede haber números de cuota repetidos.",
        };
      }
      numeros.add(numero);

      if (!fila.fechaVencimiento) {
        return {
          valido: false,
          mensaje: `La cuota ${numero} debe tener fecha de vencimiento.`,
        };
      }

      if (!(monto > 0)) {
        return {
          valido: false,
          mensaje: `La cuota ${numero} debe tener un monto mayor a 0.`,
        };
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

    return {
      valido: true,
      payload: { cuotasManuales },
    };
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
      await generarCuotasPrestamo.mutateAsync({
        id: detallePrestamo.data.id,
        payload,
      });
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
    if (!detalleActual) {
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
      const monto = Number(cuota.montoProgramado);
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
      await ajustarCuotasFuturas.mutateAsync({ id: detalleActual.id, payload });
      setMensajeAjusteCuotas("Renegociación de cuotas guardada correctamente.");
    } catch (error) {
      setErrorAjusteCuotas(
        obtenerMensajeError(error, "No se pudo guardar la renegociación de cuotas."),
      );
    }
  };

  return (
    <section className="space-y-5">
      <header className="space-y-1">
        <h1 className="titulo-seccion">Préstamos</h1>
        <p className="subtitulo-seccion">
          Listado, detalle operativo y alta de préstamo en una sola vista manual-first.
        </p>
      </header>

      <div className="grid gap-4 2xl:grid-cols-[300px_1fr_380px]">
        <aside className="panel p-3 sm:p-4">
          <h2 className="mb-2 text-sm font-semibold text-slate-900">Listado</h2>

          {prestamos.isLoading ? (
            <p className="text-sm text-slate-500">Cargando préstamos...</p>
          ) : prestamos.isError ? (
            <p className="text-sm text-red-700">
              No se pudo cargar el listado de préstamos.
            </p>
          ) : (prestamos.data ?? []).length === 0 ? (
            <p className="text-sm text-slate-500">
              Todavía no hay préstamos cargados.
            </p>
          ) : (
            <ul className="max-h-[62vh] space-y-2 overflow-auto pr-1">
              {(prestamos.data ?? []).map((prestamo) => (
                <li key={prestamo.id}>
                  <button
                    type="button"
                    onClick={() => setSeleccionId(prestamo.id)}
                    className={`w-full rounded border px-3 py-2 text-left text-sm transition hover:border-slate-400 ${
                      seleccionId === prestamo.id
                        ? "border-slate-700 bg-slate-50"
                        : "border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-900">
                        #{prestamo.id}
                      </span>
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-medium ${etiquetaEstado(prestamo.estado)}`}
                      >
                        {prestamo.estado}
                      </span>
                    </div>
                    <p className="mt-1 text-slate-700">
                      {personasPorId.get(prestamo.personaId) ??
                        `Persona ${prestamo.personaId}`}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatearMoneda(prestamo.montoInicial)} ·{" "}
                      {prestamo.cantidadCuotas} cuotas
                    </p>
                    <p className="text-xs text-slate-500">
                      {etiquetaFrecuencia(
                        prestamo.frecuenciaTipo,
                        prestamo.frecuenciaCadaDias,
                      )}
                    </p>
                    {prestamo.referenciaCodigo && (
                      <p className="text-xs text-slate-500">
                        Ref: {prestamo.referenciaCodigo}
                      </p>
                    )}
                    {prestamo.fechaBase && (
                      <p className="text-xs text-slate-500">
                        Base: {formatearFecha(prestamo.fechaBase)}
                      </p>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <div className="panel space-y-3 p-4">
          <h2 className="text-sm font-semibold text-slate-900">
            Detalle del préstamo
          </h2>

          {seleccionId === null ? (
            <p className="text-sm text-slate-500">
              Seleccioná un préstamo para ver el detalle.
            </p>
          ) : detallePrestamo.isLoading ? (
            <p className="text-sm text-slate-500">Cargando detalle...</p>
          ) : detallePrestamo.isError || !detallePrestamo.data ? (
            <p className="text-sm text-red-700">
              No se pudo cargar el detalle del préstamo.
            </p>
          ) : (
            <>
              <dl className="grid gap-2 md:grid-cols-2">
                <div>
                  <dt className="text-xs text-slate-500">Préstamo</dt>
                  <dd className="font-medium">#{detallePrestamo.data.id}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Persona</dt>
                  <dd>
                    {personasPorId.get(detallePrestamo.data.personaId) ??
                      `Persona ${detallePrestamo.data.personaId}`}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Monto inicial</dt>
                  <dd>{formatearMoneda(detallePrestamo.data.montoInicial)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Estado</dt>
                  <dd>{detallePrestamo.data.estado}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">% fijo sugerido</dt>
                  <dd>{detallePrestamo.data.porcentajeFijoSugerido ?? "-"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Interés manual</dt>
                  <dd>{detallePrestamo.data.interesManualOpcional ?? "-"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Cantidad de cuotas</dt>
                  <dd>{detallePrestamo.data.cantidadCuotas}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Frecuencia</dt>
                  <dd>
                    {etiquetaFrecuencia(
                      detallePrestamo.data.frecuenciaTipo,
                      detallePrestamo.data.frecuenciaCadaDias,
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">
                    Frecuencia cada X días
                  </dt>
                  <dd>{detallePrestamo.data.frecuenciaCadaDias ?? "-"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Fecha base</dt>
                  <dd>{formatearFecha(detallePrestamo.data.fechaBase)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">
                    Usa fechas manuales
                  </dt>
                  <dd>
                    {detallePrestamo.data.usarFechasManuales ? "Sí" : "No"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Referencia</dt>
                  <dd>{detallePrestamo.data.referenciaCodigo ?? "-"}</dd>
                </div>
                <div className="md:col-span-2">
                  <dt className="text-xs text-slate-500">Observaciones</dt>
                  <dd>{detallePrestamo.data.observaciones ?? "-"}</dd>
                </div>
              </dl>

              <div className="rounded border border-slate-200 p-3">
                <h3 className="mb-2 text-sm font-semibold">
                  Referencia y notas
                </h3>
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="text-sm text-slate-700">
                    Referencia
                    <input
                      className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                      maxLength={80}
                      value={formularioReferencia.referenciaCodigo}
                      onChange={(event) => {
                        setFormularioReferencia((actual) => ({
                          ...actual,
                          referenciaCodigo: event.target.value,
                        }));
                        setErrorReferencia(null);
                        setMensajeReferencia(null);
                      }}
                    />
                  </label>
                  <label className="text-sm text-slate-700">
                    Observaciones
                    <textarea
                      className="mt-1 h-20 w-full rounded border border-slate-300 px-3 py-2"
                      maxLength={600}
                      value={formularioReferencia.observaciones}
                      onChange={(event) => {
                        setFormularioReferencia((actual) => ({
                          ...actual,
                          observaciones: event.target.value,
                        }));
                        setErrorReferencia(null);
                        setMensajeReferencia(null);
                      }}
                    />
                  </label>
                </div>

                {errorReferencia && (
                  <p className="mt-2 text-sm text-red-700">{errorReferencia}</p>
                )}
                {mensajeReferencia && (
                  <p className="mt-2 text-sm text-emerald-700">
                    {mensajeReferencia}
                  </p>
                )}

                <button
                  type="button"
                  onClick={guardarReferenciaPrestamo}
                  disabled={actualizarReferenciaPrestamo.isPending}
                  className="boton-principal mt-3"
                >
                  {actualizarReferenciaPrestamo.isPending
                    ? "Guardando referencia..."
                    : "Guardar referencia"}
                </button>
              </div>

              <div className="panel-soft p-3">
                <h3 className="mb-2 text-sm font-semibold">
                  Resumen económico
                </h3>
                {resumenPrestamo.isLoading ? (
                  <p className="text-sm text-slate-500">
                    Calculando resumen...
                  </p>
                ) : resumenPrestamo.isError || !resumenPrestamo.data ? (
                  <p className="text-sm text-red-700">
                    No se pudo calcular el resumen económico.
                  </p>
                ) : (
                  <dl className="grid gap-2 text-sm md:grid-cols-2">
                    <div>
                      <dt className="text-xs text-slate-500">
                        Total a devolver
                      </dt>
                      <dd>
                        {formatearMoneda(resumenPrestamo.data.totalADevolver)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">Cuota sugerida</dt>
                      <dd>
                        {formatearMoneda(resumenPrestamo.data.cuotaSugerida)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">
                        Monto invertido
                      </dt>
                      <dd>
                        {formatearMoneda(resumenPrestamo.data.montoInvertido)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">
                        Monto ganado estimado
                      </dt>
                      <dd>
                        {formatearMoneda(
                          resumenPrestamo.data.montoGanadoEstimado,
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">
                        Monto por ganar
                      </dt>
                      <dd>
                        {formatearMoneda(resumenPrestamo.data.montoPorGanar)}
                      </dd>
                    </div>
                  </dl>
                )}
              </div>

              <div className="rounded border border-slate-200 p-3">
                <h3 className="mb-2 text-sm font-semibold">Cuotas asociadas</h3>
                <div className="mb-3 rounded border border-slate-200 bg-slate-50 p-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Cierre operativo
                  </h4>
                  <dl className="mt-2 grid gap-2 text-sm md:grid-cols-2">
                    <div className="md:col-span-2">
                      <dt className="text-xs text-slate-500">Estado de cuotas</dt>
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
                {detalleActual && (
                  <div className="mb-3 rounded border border-slate-200 bg-slate-50 p-3">
                    {tieneCuotasGeneradas ? (
                      <p className="subtitulo-seccion">
                        Este préstamo ya tiene cuotas generadas. No se permite
                        regeneración desde esta vista.
                      </p>
                    ) : detalleActual.frecuenciaTipo === "FECHAS_MANUALES" ? (
                      <div className="space-y-3">
                        <p className="subtitulo-seccion">
                          Cargá las cuotas manuales para este préstamo.
                        </p>
                        <div className="space-y-2">
                          {filasCuotasManuales.map((fila, index) => (
                            <div
                              key={`cuota-manual-${index}`}
                              className="grid gap-2 md:grid-cols-3"
                            >
                              <label className="text-xs text-slate-600">
                                Número de cuota
                                <input
                                  type="number"
                                  min="1"
                                  max={detalleActual.cantidadCuotas}
                                  value={fila.numeroCuota}
                                  onChange={(event) =>
                                    actualizarFilaCuotaManual(
                                      index,
                                      "numeroCuota",
                                      event.target.value,
                                    )
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
                                    actualizarFilaCuotaManual(
                                      index,
                                      "fechaVencimiento",
                                      event.target.value,
                                    )
                                  }
                                  className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                                />
                              </label>
                              <label className="text-xs text-slate-600">
                                Monto programado
                                <input
                                  type="number"
                                  min="0.01"
                                  step="0.01"
                                  value={fila.montoProgramado}
                                  onChange={(event) =>
                                    actualizarFilaCuotaManual(
                                      index,
                                      "montoProgramado",
                                      event.target.value,
                                    )
                                  }
                                  className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                                />
                              </label>
                            </div>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={generarCuotas}
                          disabled={generarCuotasPrestamo.isPending}
                          className="boton-principal"
                        >
                          {generarCuotasPrestamo.isPending
                            ? "Guardando cuotas..."
                            : "Guardar cuotas manuales"}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="subtitulo-seccion">
                          Este préstamo todavía no tiene cuotas. Generalas para
                          comenzar a operar pagos e imputaciones.
                        </p>
                        <button
                          type="button"
                          onClick={generarCuotas}
                          disabled={generarCuotasPrestamo.isPending}
                          className="boton-principal"
                        >
                          {generarCuotasPrestamo.isPending
                            ? "Generando cuotas..."
                            : "Generar cuotas"}
                        </button>
                      </div>
                    )}
                    {errorCuotas && (
                      <p className="mt-2 text-sm text-red-700">{errorCuotas}</p>
                    )}
                    {mensajeCuotas && (
                      <p className="mt-2 text-sm text-emerald-700">
                        {mensajeCuotas}
                      </p>
                    )}
                  </div>
                )}
                {cuotasPrestamo.isLoading ? (
                  <p className="text-sm text-slate-500">Cargando cuotas...</p>
                ) : cuotasPrestamo.isError ? (
                  <p className="text-sm text-red-700">
                    No se pudo cargar las cuotas del préstamo.
                  </p>
                ) : cuotasActuales.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    Este préstamo todavía no tiene cuotas generadas.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {cuotasActuales.map((cuota) => (
                      <li
                        key={cuota.id}
                        className="rounded border border-slate-200 px-3 py-2 text-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            Cuota #{cuota.numeroCuota}
                          </span>
                          <span className="text-xs text-slate-500">
                            {cuota.estado}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Vence: {formatearFecha(cuota.fechaVencimiento)}
                        </p>
                        <p className="text-xs text-slate-500">
                          Programado: {formatearMoneda(cuota.montoProgramado)} ·
                          Pagado: {formatearMoneda(cuota.montoPagado)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded border border-slate-200 p-3">
                <h3 className="mb-2 text-sm font-semibold">Registrar pago</h3>
                <p className="mb-3 text-xs text-slate-500">
                  Si no seleccionás cuotas, el backend mantiene la imputación
                  automática actual por orden. Si seleccionás cuotas, imputa
                  solo sobre esas cuotas.
                </p>

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="text-sm text-slate-700">
                    Fecha de pago
                    <input
                      type="date"
                      className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                      value={formularioPago.fechaPago}
                      onChange={(event) =>
                        actualizarCampoPago("fechaPago", event.target.value)
                      }
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
                      onChange={(event) =>
                        actualizarCampoPago("monto", event.target.value)
                      }
                    />
                  </label>
                  <label className="text-sm text-slate-700">
                    Referencia
                    <input
                      className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                      maxLength={120}
                      value={formularioPago.referencia}
                      onChange={(event) =>
                        actualizarCampoPago("referencia", event.target.value)
                      }
                    />
                  </label>
                  <label className="text-sm text-slate-700">
                    Observación
                    <input
                      className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                      maxLength={600}
                      value={formularioPago.observacion}
                      onChange={(event) =>
                        actualizarCampoPago("observacion", event.target.value)
                      }
                    />
                  </label>
                </div>

                {cuotasConSaldo.length > 0 && (
                  <div className="mt-3 rounded border border-slate-200 bg-slate-50 p-3">
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
                            {formatearMoneda(
                              cuota.montoProgramado - cuota.montoPagado,
                            )}
                          </span>
                          <input
                            type="checkbox"
                            checked={formularioPago.cuotasSeleccionadas.includes(
                              cuota.id,
                            )}
                            onChange={(event) =>
                              alternarCuotaPago(cuota.id, event.target.checked)
                            }
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {errorPago && (
                  <p className="mt-3 text-sm text-red-700">{errorPago}</p>
                )}
                {mensajePago && (
                  <p className="mt-3 text-sm text-emerald-700">{mensajePago}</p>
                )}

                <button
                  type="button"
                  onClick={guardarPago}
                  disabled={registrarPago.isPending || !puedeRegistrarPago}
                  className="boton-principal mt-3"
                >
                  {registrarPago.isPending
                    ? "Registrando pago..."
                    : "Registrar pago"}
                </button>
              </div>

              <div className="rounded border border-slate-200 p-3">
                <h3 className="mb-2 text-sm font-semibold">
                  Renegociación manual de cuotas futuras
                </h3>
                <p className="mb-3 text-xs text-slate-500">
                  Permite ajustar cuotas no saldadas sin tocar pagos ya
                  registrados.
                </p>
                {cuotasAjuste.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No hay cuotas futuras pendientes para ajustar.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {cuotasAjuste.map((cuota) => (
                      <div
                        key={`ajuste-cuota-${cuota.cuotaId}`}
                        className="grid gap-2 rounded border border-slate-200 p-2 md:grid-cols-3"
                      >
                        <p className="text-xs text-slate-600 md:col-span-3">
                          Cuota #{cuota.numeroCuota} · Estado {cuota.estado}
                        </p>
                        <label className="text-xs text-slate-600">
                          Fecha
                          <input
                            type="date"
                            value={cuota.fechaVencimiento}
                            onChange={(event) =>
                              actualizarCuotaAjuste(
                                cuota.cuotaId,
                                "fechaVencimiento",
                                event.target.value,
                              )
                            }
                            className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                          />
                        </label>
                        <label className="text-xs text-slate-600">
                          Monto programado
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={cuota.montoProgramado}
                            onChange={(event) =>
                              actualizarCuotaAjuste(
                                cuota.cuotaId,
                                "montoProgramado",
                                event.target.value,
                              )
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
                      onClick={guardarAjusteCuotas}
                      disabled={ajustarCuotasFuturas.isPending}
                      className="boton-principal"
                    >
                      {ajustarCuotasFuturas.isPending
                        ? "Guardando ajuste..."
                        : "Guardar ajuste de cuotas"}
                    </button>
                  </div>
                )}
                {errorAjusteCuotas && (
                  <p className="mt-2 text-sm text-red-700">
                    {errorAjusteCuotas}
                  </p>
                )}
                {mensajeAjusteCuotas && (
                  <p className="mt-2 text-sm text-emerald-700">
                    {mensajeAjusteCuotas}
                  </p>
                )}
              </div>

              <div className="rounded border border-slate-200 p-3">
                <h3 className="mb-2 text-sm font-semibold">
                  Historial de pagos
                </h3>
                {pagosPrestamo.isLoading ? (
                  <p className="text-sm text-slate-500">Cargando pagos...</p>
                ) : pagosPrestamo.isError ? (
                  <p className="text-sm text-red-700">
                    No se pudo cargar el historial de pagos.
                  </p>
                ) : (pagosPrestamo.data ?? []).length === 0 ? (
                  <p className="text-sm text-slate-500">
                    Todavía no hay pagos registrados para este préstamo.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {(pagosPrestamo.data ?? []).map((pago) => (
                      <li
                        key={pago.id}
                        className="rounded border border-slate-200 px-3 py-2 text-sm"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium">
                            {formatearFecha(pago.fechaPago)}
                          </span>
                          <span className="text-xs text-slate-500">
                            {pago.estado}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Monto: {formatearMoneda(pago.monto)}
                        </p>
                        <p className="text-xs text-slate-500">
                          Referencia: {pago.referencia || "-"}
                        </p>
                        <p className="text-xs text-slate-500">
                          Observación: {pago.observacion || "-"}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>

        <PrestamoAltaPanel
          personas={personas.data ?? []}
          personasLoading={personas.isLoading}
          onCreado={(prestamoId) => setSeleccionId(prestamoId)}
        />
      </div>
    </section>
  );
}
