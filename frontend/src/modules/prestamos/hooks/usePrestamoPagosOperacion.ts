import { useEffect, useState } from "react";
import { useRegistrarPago } from "../../pagos/hooks/usePagos";
import {
  crearPayloadPago,
  formularioInicialPago,
  type PagoFormulario,
  type RegistroPagoPayload,
} from "../../pagos/types/pago";
import { obtenerMensajeError } from "../utils/prestamoUi";

type UsePrestamoPagosOperacionArgs = {
  prestamoId: number | null;
};

export function usePrestamoPagosOperacion({
  prestamoId,
}: UsePrestamoPagosOperacionArgs) {
  const [formularioPago, setFormularioPago] = useState<PagoFormulario>(
    formularioInicialPago,
  );
  const [errorPago, setErrorPago] = useState<string | null>(null);
  const [mensajePago, setMensajePago] = useState<string | null>(null);

  const registrarPago = useRegistrarPago();

  useEffect(() => {
    setErrorPago(null);
    setMensajePago(null);
    setFormularioPago((actual) => ({ ...actual, cuotasSeleccionadas: [] }));
  }, [prestamoId]);

  const cambiarCampoPago = <K extends keyof PagoFormulario>(
    campo: K,
    valor: PagoFormulario[K],
  ) => {
    setFormularioPago((actual) => ({ ...actual, [campo]: valor }));
    setErrorPago(null);
    setMensajePago(null);
  };

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

  const guardarPago = async () => {
    if (!prestamoId) {
      setErrorPago("Seleccioná un préstamo antes de registrar un pago.");
      return;
    }

    if (!formularioPago.fechaPago) {
      setErrorPago("La fecha de pago es obligatoria.");
      return;
    }

    let payload: RegistroPagoPayload;

    try {
      payload = crearPayloadPago(prestamoId, formularioPago);
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

  return {
    formularioPago,
    cambiarCampoPago,
    alternarCuotaPago,
    guardarPago,
    guardandoPago: registrarPago.isPending,
    errorPago,
    mensajePago,
  };
}
