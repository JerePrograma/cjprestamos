import { useEffect, useMemo, useState } from "react";
import { formatearMonedaSinCentavos } from "../../../utils/moneda";
import type { Persona } from "../../personas/types/persona";
import { useCalcularPrestamo, useCrearPrestamo } from "../hooks/usePrestamos";
import {
  crearPayloadCalculo,
  crearPayloadPrestamo,
  formularioInicialPrestamo,
  type CalculoPrestamoResultado,
  type PrestamoFormulario,
} from "../types/prestamo";

type PrestamoAltaPanelProps = {
  personas: Persona[];
  personasLoading: boolean;
  onCreado: (prestamoId: number) => void;
};

function esFormularioMinimoValido(formulario: PrestamoFormulario) {
  return (
    formulario.personaId.trim() &&
    Number(formulario.montoInicial) > 0 &&
    Number(formulario.cantidadCuotas) > 0
  );
}


export function PrestamoAltaPanel({
  personas,
  personasLoading,
  onCreado,
}: PrestamoAltaPanelProps) {
  const [formulario, setFormulario] = useState<PrestamoFormulario>(
    formularioInicialPrestamo,
  );
  const [errorFormulario, setErrorFormulario] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const crearPrestamo = useCrearPrestamo();
  const calcularPrestamo = useCalcularPrestamo();

  const puedeCalcularAlta = useMemo(
    () => esFormularioMinimoValido(formulario),
    [formulario],
  );

  useEffect(() => {
    if (!puedeCalcularAlta) {
      return;
    }

    const timeout = setTimeout(() => {
      calcularPrestamo.mutate(crearPayloadCalculo(formulario));
    }, 250);

    return () => clearTimeout(timeout);
  }, [formulario, puedeCalcularAlta]);

  const actualizarCampo = <K extends keyof PrestamoFormulario>(
    campo: K,
    valor: PrestamoFormulario[K],
  ) => {
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
    setMensajeExito(null);
    setErrorFormulario(null);
  };

  const guardarPrestamo = async () => {
    if (!esFormularioMinimoValido(formulario)) {
      setErrorFormulario(
        "Completá persona, monto inicial y cantidad de cuotas.",
      );
      return;
    }

    if (
      formulario.frecuenciaTipo === "CADA_X_DIAS" &&
      Number(formulario.frecuenciaCadaDias) <= 0
    ) {
      setErrorFormulario(
        "Para CADA_X_DIAS, la frecuencia debe ser mayor que 0.",
      );
      return;
    }

    if (Number(formulario.porcentajeFijoSugerido || "0") < 0) {
      setErrorFormulario("El porcentaje fijo sugerido no puede ser negativo.");
      return;
    }

    if (Number(formulario.interesManualOpcional || "0") < 0) {
      setErrorFormulario("El interés manual no puede ser negativo.");
      return;
    }

    if (
      formulario.frecuenciaTipo !== "FECHAS_MANUALES" &&
      formulario.usarFechasManuales
    ) {
      setErrorFormulario(
        "Usar fechas manuales solo aplica cuando la frecuencia es FECHAS_MANUALES.",
      );
      return;
    }

    if (
      formulario.frecuenciaTipo === "FECHAS_MANUALES" &&
      !formulario.usarFechasManuales
    ) {
      setErrorFormulario(
        'Para FECHAS_MANUALES, activá "Usar fechas manuales".',
      );
      return;
    }

    if (
      formulario.frecuenciaTipo !== "FECHAS_MANUALES" &&
      !formulario.fechaBase
    ) {
      setErrorFormulario(
        "La fecha base es obligatoria para frecuencia automática.",
      );
      return;
    }

    try {
      const prestamo = await crearPrestamo.mutateAsync(
        crearPayloadPrestamo(formulario),
      );
      onCreado(prestamo.id);
      setFormulario(formularioInicialPrestamo);
      setMensajeExito("Préstamo creado correctamente.");
    } catch {
      setErrorFormulario(
        "No se pudo crear el préstamo. Revisá los datos e intentá nuevamente.",
      );
    }
  };

  const resultadoAlta: CalculoPrestamoResultado | undefined =
    calcularPrestamo.data;

  return (
    <aside className="panel space-y-4 p-4 sm:p-5">
      <div className="space-y-1">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Alta de préstamo</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Cargá condiciones base sin centavos. Si ingresás decimales, el sistema redondea hacia arriba.
        </p>
      </div>

      <label className="block text-sm">
        Persona
        <select
          className="mt-1 w-full"
          value={formulario.personaId}
          onChange={(event) => actualizarCampo("personaId", event.target.value)}
        >
          <option value="">Seleccionar persona</option>
          {personas.map((persona) => (
            <option key={persona.id} value={persona.id}>
              {persona.nombre}
            </option>
          ))}
        </select>
      </label>
      {personasLoading && (
        <p className="text-xs text-slate-500 dark:text-slate-400">Cargando personas disponibles...</p>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm">
          Monto inicial
          <input
            type="number"
            min="0"
            step="1"
            className="mt-1 w-full"
            value={formulario.montoInicial}
            onChange={(event) =>
              actualizarCampo("montoInicial", event.target.value)
            }
          />
        </label>
        <label className="text-sm">
          Cantidad de cuotas
          <input
            type="number"
            min="1"
            className="mt-1 w-full"
            value={formulario.cantidadCuotas}
            onChange={(event) =>
              actualizarCampo("cantidadCuotas", event.target.value)
            }
          />
        </label>
        <label className="text-sm">
          Porcentaje fijo sugerido
          <input
            type="number"
            min="0"
            step="1"
            className="mt-1 w-full"
            value={formulario.porcentajeFijoSugerido}
            onChange={(event) =>
              actualizarCampo("porcentajeFijoSugerido", event.target.value)
            }
          />
        </label>
        <label className="text-sm">
          Interés manual opcional
          <input
            type="number"
            min="0"
            step="1"
            className="mt-1 w-full"
            value={formulario.interesManualOpcional}
            onChange={(event) =>
              actualizarCampo("interesManualOpcional", event.target.value)
            }
          />
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <label className="text-sm">
          Frecuencia
          <select
            className="mt-1 w-full"
            value={formulario.frecuenciaTipo}
            onChange={(event) => {
              const frecuencia = event.target
                .value as PrestamoFormulario["frecuenciaTipo"];

              actualizarCampo("frecuenciaTipo", frecuencia);
              actualizarCampo(
                "usarFechasManuales",
                frecuencia === "FECHAS_MANUALES",
              );

              if (frecuencia !== "CADA_X_DIAS") {
                actualizarCampo("frecuenciaCadaDias", "");
              }
            }}
          >
            <option value="MENSUAL">Mensual</option>
            <option value="CADA_X_DIAS">Cada X días</option>
            <option value="FECHAS_MANUALES">Fechas manuales</option>
          </select>
        </label>

        <label className="text-sm">
          {formulario.frecuenciaTipo === "FECHAS_MANUALES"
            ? "Fecha inicial sugerida (opcional)"
            : "Fecha base"}
          <input
            type="date"
            className="mt-1 w-full"
            value={formulario.fechaBase}
            onChange={(event) =>
              actualizarCampo("fechaBase", event.target.value)
            }
          />
        </label>

        {formulario.frecuenciaTipo === "CADA_X_DIAS" && (
          <label className="text-sm">
            Frecuencia cada X días
            <input
              type="number"
              min="1"
              className="mt-1 w-full"
              value={formulario.frecuenciaCadaDias}
              onChange={(event) =>
                actualizarCampo("frecuenciaCadaDias", event.target.value)
              }
            />
          </label>
        )}
      </div>

      {formulario.frecuenciaTipo === "FECHAS_MANUALES" && (
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
          <input
            type="checkbox"
            checked={formulario.usarFechasManuales}
            onChange={(event) =>
              actualizarCampo("usarFechasManuales", event.target.checked)
            }
            disabled
          />
          Usar fechas manuales
        </label>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm">
          Referencia
          <input
            className="mt-1 w-full"
            value={formulario.referenciaCodigo}
            onChange={(event) =>
              actualizarCampo("referenciaCodigo", event.target.value)
            }
            maxLength={80}
          />
        </label>
        <label className="text-sm">
          Estado
          <select
            className="mt-1 w-full"
            value={formulario.estado}
            onChange={(event) =>
              actualizarCampo(
                "estado",
                event.target.value as PrestamoFormulario["estado"],
              )
            }
          >
            <option value="ACTIVO">Activo</option>
            <option value="FINALIZADO">Finalizado</option>
            <option value="RENEGOCIADO">Renegociado</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
        </label>
      </div>

      <label className="block text-sm">
        Observaciones
        <textarea
          className="mt-1 h-20 w-full rounded border border-slate-300 px-3 py-2"
          value={formulario.observaciones}
          onChange={(event) =>
            actualizarCampo("observaciones", event.target.value)
          }
          maxLength={600}
        />
      </label>

      {errorFormulario && (
        <p className="text-sm text-red-700">{errorFormulario}</p>
      )}
      {mensajeExito && (
        <p className="text-sm text-emerald-700">{mensajeExito}</p>
      )}

      <button
        type="button"
        onClick={guardarPrestamo}
        disabled={crearPrestamo.isPending || personasLoading}
        className="boton-principal"
      >
        {crearPrestamo.isPending ? "Guardando..." : "Guardar préstamo"}
      </button>

      <div className="panel-soft p-3">
        <h3 className="mb-2 text-sm font-semibold">
          Cálculo sugerido del alta
        </h3>
        {!puedeCalcularAlta ? (
          <p className="text-sm text-slate-500">
            Completá persona, monto inicial y cantidad de cuotas.
          </p>
        ) : calcularPrestamo.isPending ? (
          <p className="text-sm text-slate-500">Calculando...</p>
        ) : calcularPrestamo.isError ? (
          <p className="text-sm text-red-700">
            No se pudo obtener cálculo sugerido.
          </p>
        ) : (
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt>Total</dt>
              <dd>{formatearMonedaSinCentavos(resultadoAlta?.totalADevolver)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Cuota sugerida</dt>
              <dd>{formatearMonedaSinCentavos(resultadoAlta?.cuotaSugerida)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Invertido</dt>
              <dd>{formatearMonedaSinCentavos(resultadoAlta?.montoInvertido)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Ganado estimado</dt>
              <dd>{formatearMonedaSinCentavos(resultadoAlta?.montoGanadoEstimado)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Por ganar</dt>
              <dd>{formatearMonedaSinCentavos(resultadoAlta?.montoPorGanar)}</dd>
            </div>
          </dl>
        )}
      </div>
    </aside>
  );
}
