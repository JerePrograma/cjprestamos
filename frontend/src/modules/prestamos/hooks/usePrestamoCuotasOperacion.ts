import { useEffect, useMemo, useRef, useState } from "react";
import { obtenerFechaHoyLocal } from "../../../shared/lib/dates";
import { redondearMontoHaciaArriba } from "../../../shared/lib/money";
import {
  useAjustarCuotasFuturasPrestamo,
  useGenerarCuotasPrestamo,
} from "../../cuotas/hooks/useCuotasPrestamo";
import type {
  AjustarCuotasFuturasPayload,
  CuotaAjusteFila,
  CuotaManualFila,
  CuotaPrestamo,
  GenerarCuotasPayload,
} from "../../cuotas/types/cuota";
import {
  construirFilasCuotasManuales,
  validarCuotasManuales,
} from "../../cuotas/utils/cuotasPrestamo";
import { useRegistrarPago } from "../../pagos/hooks/usePagos";
import type { RegistroPagoPayload } from "../../pagos/types/pago";
import type {
  CalculoPrestamoResultado,
  PrestamoResponse,
} from "../types/prestamo";
import { obtenerMensajeError } from "../utils/prestamoUi";

type UsePrestamoCuotasOperacionArgs = {
  prestamoId: number | null;
  detalle: PrestamoResponse | null;
  cuotas: CuotaPrestamo[];
  resumen: CalculoPrestamoResultado | null;
  puedeRegistrarPago: boolean;
};

export function usePrestamoCuotasOperacion({
  prestamoId,
  detalle,
  cuotas,
  resumen,
  puedeRegistrarPago,
}: UsePrestamoCuotasOperacionArgs) {
  const [pagandoCuotaId, setPagandoCuotaId] = useState<number | null>(null);
  const [errorPagoCuota, setErrorPagoCuota] = useState<string | null>(null);
  const [mensajePagoCuota, setMensajePagoCuota] = useState<string | null>(null);

  const [filasCuotasManuales, setFilasCuotasManuales] = useState<
    CuotaManualFila[]
  >([]);
  const [errorCuotas, setErrorCuotas] = useState<string | null>(null);
  const [mensajeCuotas, setMensajeCuotas] = useState<string | null>(null);

  const [cuotasAjuste, setCuotasAjuste] = useState<CuotaAjusteFila[]>([]);
  const [errorAjusteCuotas, setErrorAjusteCuotas] = useState<string | null>(
    null,
  );
  const [mensajeAjusteCuotas, setMensajeAjusteCuotas] = useState<string | null>(
    null,
  );

  const generarCuotasPrestamo = useGenerarCuotasPrestamo();
  const ajustarCuotasFuturas = useAjustarCuotasFuturasPrestamo();
  const registrarPago = useRegistrarPago();

  useEffect(() => {
    setErrorCuotas(null);
    setMensajeCuotas(null);
    setErrorAjusteCuotas(null);
    setMensajeAjusteCuotas(null);
    setPagandoCuotaId(null);
    setErrorPagoCuota(null);
    setMensajePagoCuota(null);
  }, [prestamoId]);

  useEffect(() => {
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
    detalle?.id,
    detalle?.frecuenciaTipo,
    detalle?.cantidadCuotas,
    detalle?.fechaBase,
  ]);

  const cuotasAjusteIniciales = useMemo(
    () =>
      cuotas
        .filter((cuota) => cuota.montoPagado <= 0)
        .map((cuota) => ({
          cuotaId: cuota.id,
          numeroCuota: cuota.numeroCuota,
          fechaVencimiento: cuota.fechaVencimiento ?? "",
          montoProgramado: String(cuota.montoProgramado),
          montoPagado: cuota.montoPagado,
          estado: cuota.estado,
        })),
    [cuotas],
  );

  const firmaCuotasAjuste = useMemo(
    () =>
      cuotasAjusteIniciales
        .map((cuota) =>
          [
            cuota.cuotaId,
            cuota.numeroCuota,
            cuota.fechaVencimiento,
            cuota.montoProgramado,
            cuota.montoPagado,
            cuota.estado,
          ].join("|"),
        )
        .join(";"),
    [cuotasAjusteIniciales],
  );

  const ultimaFirmaCuotasAjusteRef = useRef<string>("");

  useEffect(() => {
    if (ultimaFirmaCuotasAjusteRef.current === firmaCuotasAjuste) {
      return;
    }

    ultimaFirmaCuotasAjusteRef.current = firmaCuotasAjuste;
    setCuotasAjuste(cuotasAjusteIniciales);
  }, [firmaCuotasAjuste, cuotasAjusteIniciales]);

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

  const generarCuotas = async () => {
    if (!detalle) {
      return;
    }

    if (cuotas.length > 0) {
      setErrorCuotas(
        "Este préstamo ya tiene cuotas generadas. No se puede regenerar.",
      );
      return;
    }

    let payload: GenerarCuotasPayload | undefined;

    if (detalle.frecuenciaTipo === "FECHAS_MANUALES") {
      if (!resumen) {
        setErrorCuotas(
          "No se pudo obtener el total a devolver para validar cuotas manuales.",
        );
        return;
      }

      const validacion = validarCuotasManuales(
        filasCuotasManuales,
        detalle.cantidadCuotas,
        resumen.totalADevolver,
      );

      if (!validacion.valido) {
        setErrorCuotas(validacion.mensaje);
        return;
      }

      payload = validacion.payload;
    }

    try {
      await generarCuotasPrestamo.mutateAsync({
        id: detalle.id,
        payload,
      });

      setMensajeCuotas(
        detalle.frecuenciaTipo === "FECHAS_MANUALES"
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
    if (!detalle) {
      return;
    }

    if (cuotasAjuste.length === 0) {
      setErrorAjusteCuotas("No hay cuotas futuras disponibles para ajustar.");
      return;
    }

    const cuotasActualizadas: AjustarCuotasFuturasPayload["cuotas"] = [];

    for (const cuota of cuotasAjuste) {
      if (!cuota.fechaVencimiento) {
        setErrorAjusteCuotas(
          `La cuota #${cuota.numeroCuota} requiere fecha de vencimiento.`,
        );
        return;
      }

      const monto = redondearMontoHaciaArriba(Number(cuota.montoProgramado));

      if (!(monto > 0)) {
        setErrorAjusteCuotas(
          `La cuota #${cuota.numeroCuota} requiere monto mayor a 0.`,
        );
        return;
      }

      cuotasActualizadas.push({
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
      cuotas: cuotasActualizadas,
    };

    try {
      await ajustarCuotasFuturas.mutateAsync({
        id: detalle.id,
        payload,
      });
      setMensajeAjusteCuotas("Renegociación de cuotas guardada correctamente.");
    } catch (error) {
      setErrorAjusteCuotas(
        obtenerMensajeError(
          error,
          "No se pudo guardar la renegociación de cuotas.",
        ),
      );
    }
  };

  const pagarCuotaDirecta = async (cuota: CuotaPrestamo) => {
    if (!prestamoId) {
      setErrorPagoCuota("Seleccioná un préstamo antes de registrar un pago.");
      return;
    }

    if (!puedeRegistrarPago) {
      setErrorPagoCuota(
        "Solo se pueden registrar pagos sobre préstamos activos o renegociados.",
      );
      return;
    }

    const saldoCuota = Math.max(cuota.montoProgramado - cuota.montoPagado, 0);

    if (saldoCuota <= 0) {
      setErrorPagoCuota(
        `La cuota #${cuota.numeroCuota} no tiene saldo pendiente.`,
      );
      return;
    }

    const fechaPago = obtenerFechaHoyLocal();

    const confirmado = window.confirm(
      `¿Está seguro que desea abonar la cuota #${cuota.numeroCuota} por ${saldoCuota}? Se registrará con fecha ${fechaPago}.`,
    );

    if (!confirmado) {
      return;
    }

    const payload: RegistroPagoPayload = {
      prestamoId,
      fechaPago,
      monto: saldoCuota,
      referencia: null,
      observacion: `Pago directo de cuota #${cuota.numeroCuota}`,
      cuotasSeleccionadas: [cuota.id],
    };

    setPagandoCuotaId(cuota.id);
    setErrorPagoCuota(null);
    setMensajePagoCuota(null);

    try {
      await registrarPago.mutateAsync(payload);
      setMensajePagoCuota(`Cuota #${cuota.numeroCuota} abonada correctamente.`);
    } catch (error) {
      setErrorPagoCuota(
        obtenerMensajeError(
          error,
          `No se pudo abonar la cuota #${cuota.numeroCuota}.`,
        ),
      );
    } finally {
      setPagandoCuotaId(null);
    }
  };

  return {
    filasCuotasManuales,
    actualizarFilaCuotaManual,
    generarCuotas,
    generandoCuotas: generarCuotasPrestamo.isPending,
    cuotasAjuste,
    actualizarCuotaAjuste,
    guardarAjusteCuotas,
    guardandoAjuste: ajustarCuotasFuturas.isPending,
    pagarCuotaDirecta,
    pagandoCuotaId,
    errorCuotas,
    mensajeCuotas,
    errorAjusteCuotas,
    mensajeAjusteCuotas,
    errorPagoCuota,
    mensajePagoCuota,
  };
}
