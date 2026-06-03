import { useEffect, useState } from "react";
import type {
  PrestamoResponse,
  ReferenciaPrestamoPayload,
} from "../types/prestamo";
import { useActualizarReferenciaPrestamo } from "./usePrestamos";

export type FormularioReferenciaPrestamo = {
  referenciaCodigo: string;
  observaciones: string;
};

const formularioInicialReferencia: FormularioReferenciaPrestamo = {
  referenciaCodigo: "",
  observaciones: "",
};

export function usePrestamoReferenciaForm(detalle: PrestamoResponse | null) {
  const [formularioReferencia, setFormularioReferencia] =
    useState<FormularioReferenciaPrestamo>(formularioInicialReferencia);
  const [errorReferencia, setErrorReferencia] = useState<string | null>(null);
  const [mensajeReferencia, setMensajeReferencia] = useState<string | null>(
    null,
  );

  const actualizarReferenciaPrestamo = useActualizarReferenciaPrestamo();

  useEffect(() => {
    if (!detalle) {
      setFormularioReferencia(formularioInicialReferencia);
      setErrorReferencia(null);
      setMensajeReferencia(null);
      return;
    }

    setFormularioReferencia({
      referenciaCodigo: detalle.referenciaCodigo ?? "",
      observaciones: detalle.observaciones ?? "",
    });
    setErrorReferencia(null);
    setMensajeReferencia(null);
  }, [detalle?.id]);

  const cambiarReferencia = (
    campo: keyof FormularioReferenciaPrestamo,
    valor: string,
  ) => {
    setFormularioReferencia((actual) => ({
      ...actual,
      [campo]: valor,
    }));
    setErrorReferencia(null);
    setMensajeReferencia(null);
  };

  const guardarReferenciaPrestamo = async () => {
    if (!detalle) {
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
        id: detalle.id,
        payload,
      });
      setMensajeReferencia("Referencia del préstamo actualizada.");
    } catch {
      setErrorReferencia("No se pudo actualizar la referencia del préstamo.");
    }
  };

  return {
    formularioReferencia,
    cambiarReferencia,
    guardarReferenciaPrestamo,
    guardandoReferencia: actualizarReferenciaPrestamo.isPending,
    errorReferencia,
    mensajeReferencia,
  };
}
