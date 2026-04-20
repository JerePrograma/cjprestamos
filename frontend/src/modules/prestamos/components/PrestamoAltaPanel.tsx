import { useEffect, useMemo, useState } from "react";
import type { Persona } from "../../personas/types/persona";
import {
  useCalcularPrestamo,
  useCrearPrestamo,
} from "../hooks/usePrestamos";
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
      formulario.frecuenciaTipo === "FECHAS_MANUALES" &&
      !formulario.fechaBase
    ) {
      setErrorFormulario(
        "Para FECHAS_MANUALES, indicá la fecha de la primera cuota.",
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
    <aside className="panel space-y-3 p-4">
      <h2 className="text-sm font-semibold text-slate-900">Alta de préstamo</h2>

      <label className="block text-sm text-slate-700">
        Persona
        <select
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
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

      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm text-slate-700">
          Monto inicial
          <input
            type="number"
            min="0"
            step="0.01"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            value={formulario.montoInicial}
            onChange={(event) => actualizarCampo("montoInicial", event.target.value)}
          />
        </label>
        <label className="text-sm text-slate-700">
          Cantidad de cuotas
          <input
            type="number"
            min="1"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            value={formulario.cantidadCuotas}
            onChange={(event) =>
              actualizarCampo("cantidadCuotas", event.target.value)
            }
          />
        </label>
        <label className="text-sm text-slate-700">
          Porcentaje fijo sugerido
          <input
            type="number"
            min="0"
            step="0.01"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            value={formulario.porcentajeFijoSugerido}
            onChange={(event) =>
              actualizarCampo("porcentajeFijoSugerido", event.target.value)
            }
          />
        </label>
        <label className="text-sm text-slate-700">
          Interés manual opcional
          <input
            type="number"
            min="0"
            step="0.01"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            value={formulario.interesManualOpcional}
            onChange={(event) =>
              actualizarCampo("interesManualOpcional", event.target.value)
            }
          />
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm text-slate-700">
          Frecuencia
          <select
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            value={formulario.frecuenciaTipo}
            onChange={(event) => {
              const frecuencia = event.target
                .value as PrestamoFormulario["frecuenciaTipo"];
              actualizarCampo("frecuenciaTipo", frecuencia);
              if (frecuencia === "FECHAS_MANUALES") {
                actualizarCampo("usarFechasManuales", true);
              }
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

        {formulario.frecuenciaTipo === "FECHAS_MANUALES" ? (
          <label className="text-sm text-slate-700">
            Fecha primera cuota
            <input
              type="date"
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
              value={formulario.fechaBase}
              onChange={(event) => actualizarCampo("fechaBase", event.target.value)}
            />
          </label>
        ) : formulario.frecuenciaTipo === "CADA_X_DIAS" ? (
          <label className="text-sm text-slate-700">
            Frecuencia cada X días
            <input
              type="number"
              min="1"
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
              value={formulario.frecuenciaCadaDias}
              onChange={(event) =>
                actualizarCampo("frecuenciaCadaDias", event.target.value)
              }
            />
          </label>
        ) : (
          <label className="text-sm text-slate-700">
            Fecha base
            <input
              type="date"
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
              value={formulario.fechaBase}
              onChange={(event) => actualizarCampo("fechaBase", event.target.value)}
            />
          </label>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={formulario.usarFechasManuales}
          onChange={(event) =>
            actualizarCampo("usarFechasManuales", event.target.checked)
          }
          disabled={formulario.frecuenciaTipo === "FECHAS_MANUALES"}
        />
        Usar fechas manuales
      </label>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm text-slate-700">
          Referencia
          <input
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            value={formulario.referenciaCodigo}
            onChange={(event) =>
              actualizarCampo("referenciaCodigo", event.target.value)
            }
            maxLength={80}
          />
        </label>
        <label className="text-sm text-slate-700">
          Estado
          <select
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
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

      <label className="block text-sm text-slate-700">
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

      {errorFormulario && <p className="text-sm text-red-700">{errorFormulario}</p>}
      {mensajeExito && <p className="text-sm text-emerald-700">{mensajeExito}</p>}

      <button
        type="button"
        onClick={guardarPrestamo}
        disabled={crearPrestamo.isPending || personasLoading}
        className="boton-principal"
      >
        {crearPrestamo.isPending ? "Guardando..." : "Guardar préstamo"}
      </button>

      <div className="panel-soft p-3">
        <h3 className="mb-2 text-sm font-semibold">Cálculo sugerido del alta</h3>
        {!puedeCalcularAlta ? (
          <p className="text-sm text-slate-500">
            Completá persona, monto inicial y cantidad de cuotas.
          </p>
        ) : calcularPrestamo.isPending ? (
          <p className="text-sm text-slate-500">Calculando...</p>
        ) : calcularPrestamo.isError ? (
          <p className="text-sm text-red-700">No se pudo obtener cálculo sugerido.</p>
        ) : (
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt>Total</dt>
              <dd>{formatearMoneda(resultadoAlta?.totalADevolver)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Cuota sugerida</dt>
              <dd>{formatearMoneda(resultadoAlta?.cuotaSugerida)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Invertido</dt>
              <dd>{formatearMoneda(resultadoAlta?.montoInvertido)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Ganado estimado</dt>
              <dd>{formatearMoneda(resultadoAlta?.montoGanadoEstimado)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Por ganar</dt>
              <dd>{formatearMoneda(resultadoAlta?.montoPorGanar)}</dd>
            </div>
          </dl>
        )}
      </div>
    </aside>
  );
}
