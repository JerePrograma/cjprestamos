import { useEffect, useMemo, useState } from 'react';
import { useListadoPersonas } from '../personas/hooks/usePersonas';
import { useCalcularPrestamo, useCrearPrestamo } from './hooks/usePrestamos';
import {
  crearPayloadCalculo,
  crearPayloadPrestamo,
  formularioInicialPrestamo,
  type CalculoPrestamoResultado,
  type PrestamoFormulario,
} from './types/prestamo';

function esFormularioMinimoValido(formulario: PrestamoFormulario) {
  return (
    formulario.personaId.trim() &&
    Number(formulario.montoInicial) > 0 &&
    Number(formulario.cantidadCuotas) > 0
  );
}

function formatearMoneda(valor?: number) {
  if (valor === undefined) {
    return '$ -';
  }

  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 2,
  }).format(valor);
}

export function PrestamosPage() {
  const [formulario, setFormulario] = useState<PrestamoFormulario>(formularioInicialPrestamo);
  const [errorFormulario, setErrorFormulario] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [ultimoCreadoId, setUltimoCreadoId] = useState<number | null>(null);

  const personas = useListadoPersonas();
  const crearPrestamo = useCrearPrestamo();
  const calcularPrestamo = useCalcularPrestamo();

  const puedeCalcular = useMemo(() => esFormularioMinimoValido(formulario), [formulario]);

  useEffect(() => {
    if (!puedeCalcular) {
      return;
    }

    const timeout = setTimeout(() => {
      calcularPrestamo.mutate(crearPayloadCalculo(formulario));
    }, 250);

    return () => clearTimeout(timeout);
  }, [formulario, puedeCalcular]);

  const actualizarCampo = <K extends keyof PrestamoFormulario>(campo: K, valor: PrestamoFormulario[K]) => {
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
    setMensajeExito(null);
    setErrorFormulario(null);
  };

  const guardarPrestamo = async () => {
    if (!esFormularioMinimoValido(formulario)) {
      setErrorFormulario('Completá persona, monto inicial y cantidad de cuotas.');
      return;
    }

    if (formulario.frecuenciaTipo === 'CADA_X_DIAS' && Number(formulario.frecuenciaCadaDias) <= 0) {
      setErrorFormulario('Para CADA_X_DIAS, la frecuencia debe ser mayor que 0.');
      return;
    }

    if (!formulario.usarFechasManuales && formulario.frecuenciaTipo !== 'FECHAS_MANUALES' && !formulario.fechaBase) {
      setErrorFormulario('La fecha base es obligatoria para frecuencia automática.');
      return;
    }

    try {
      const prestamo = await crearPrestamo.mutateAsync(crearPayloadPrestamo(formulario));
      setUltimoCreadoId(prestamo.id);
      setFormulario(formularioInicialPrestamo);
      setMensajeExito('Préstamo creado correctamente. La generación de cuotas se realiza en un paso separado.');
    } catch {
      setErrorFormulario('No se pudo crear el préstamo. Revisá los datos e intentá nuevamente.');
    }
  };

  const resultadoCalculo: CalculoPrestamoResultado | undefined = calcularPrestamo.data;

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-slate-900">Alta de préstamo</h1>
        <p className="text-sm text-slate-600">
          Carga operativa manual-first con cálculo sugerido visible y creación contra API real.
        </p>
      </header>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-3 rounded-lg border border-slate-200 p-4">
          <h2 className="text-sm font-semibold text-slate-900">Condiciones del préstamo</h2>

          <label className="block text-sm text-slate-700">
            Persona
            <select
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
              value={formulario.personaId}
              onChange={(event) => actualizarCampo('personaId', event.target.value)}
            >
              <option value="">Seleccionar persona</option>
              {(personas.data ?? []).map((persona) => (
                <option key={persona.id} value={persona.id}>
                  {persona.nombre}
                </option>
              ))}
            </select>
            {personas.isError && <span className="mt-1 block text-xs text-red-700">No se pudo cargar personas.</span>}
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
                onChange={(event) => actualizarCampo('montoInicial', event.target.value)}
              />
            </label>

            <label className="text-sm text-slate-700">
              Cantidad de cuotas
              <input
                type="number"
                min="1"
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                value={formulario.cantidadCuotas}
                onChange={(event) => actualizarCampo('cantidadCuotas', event.target.value)}
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
                onChange={(event) => actualizarCampo('porcentajeFijoSugerido', event.target.value)}
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
                onChange={(event) => actualizarCampo('interesManualOpcional', event.target.value)}
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
                  const frecuencia = event.target.value as PrestamoFormulario['frecuenciaTipo'];
                  actualizarCampo('frecuenciaTipo', frecuencia);

                  if (frecuencia === 'FECHAS_MANUALES') {
                    actualizarCampo('usarFechasManuales', true);
                  }

                  if (frecuencia !== 'CADA_X_DIAS') {
                    actualizarCampo('frecuenciaCadaDias', '');
                  }
                }}
              >
                <option value="MENSUAL">Mensual</option>
                <option value="CADA_X_DIAS">Cada X días</option>
                <option value="FECHAS_MANUALES">Fechas manuales</option>
              </select>
            </label>

            {formulario.frecuenciaTipo === 'CADA_X_DIAS' ? (
              <label className="text-sm text-slate-700">
                Frecuencia cada X días
                <input
                  type="number"
                  min="1"
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                  value={formulario.frecuenciaCadaDias}
                  onChange={(event) => actualizarCampo('frecuenciaCadaDias', event.target.value)}
                />
              </label>
            ) : (
              <label className="text-sm text-slate-700">
                Fecha base
                <input
                  type="date"
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                  value={formulario.fechaBase}
                  onChange={(event) => actualizarCampo('fechaBase', event.target.value)}
                  disabled={formulario.usarFechasManuales && formulario.frecuenciaTipo === 'FECHAS_MANUALES'}
                />
              </label>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={formulario.usarFechasManuales}
              onChange={(event) => actualizarCampo('usarFechasManuales', event.target.checked)}
            />
            Usar fechas manuales
          </label>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm text-slate-700">
              Referencia
              <input
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                value={formulario.referenciaCodigo}
                onChange={(event) => actualizarCampo('referenciaCodigo', event.target.value)}
                maxLength={80}
              />
            </label>

            <label className="text-sm text-slate-700">
              Estado
              <select
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                value={formulario.estado}
                onChange={(event) => actualizarCampo('estado', event.target.value as PrestamoFormulario['estado'])}
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
              className="mt-1 h-24 w-full rounded border border-slate-300 px-3 py-2"
              value={formulario.observaciones}
              onChange={(event) => actualizarCampo('observaciones', event.target.value)}
              maxLength={600}
            />
          </label>

          {errorFormulario && <p className="text-sm text-red-700">{errorFormulario}</p>}
          {mensajeExito && <p className="text-sm text-emerald-700">{mensajeExito}</p>}
          {ultimoCreadoId && (
            <p className="text-xs text-slate-500">Último préstamo creado: #{ultimoCreadoId}. Cuotas: paso separado y explícito.</p>
          )}

          <button
            type="button"
            onClick={guardarPrestamo}
            disabled={crearPrestamo.isPending || personas.isLoading}
            className="rounded bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
          >
            {crearPrestamo.isPending ? 'Guardando...' : 'Guardar préstamo'}
          </button>
        </div>

        <aside className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h2 className="text-sm font-semibold text-slate-900">Cálculo sugerido</h2>
          <p className="text-xs text-slate-600">Se actualiza automáticamente con los datos cargados.</p>

          {!puedeCalcular ? (
            <p className="text-sm text-slate-500">Completá persona, monto inicial y cantidad de cuotas para ver el cálculo.</p>
          ) : calcularPrestamo.isPending ? (
            <p className="text-sm text-slate-500">Calculando...</p>
          ) : calcularPrestamo.isError ? (
            <p className="text-sm text-red-700">No se pudo obtener cálculo sugerido con los datos actuales.</p>
          ) : (
            <dl className="space-y-2 text-sm">
              <div className="flex items-center justify-between rounded border border-slate-200 bg-white px-3 py-2">
                <dt>Total a devolver</dt>
                <dd className="font-semibold">{formatearMoneda(resultadoCalculo?.totalADevolver)}</dd>
              </div>
              <div className="flex items-center justify-between rounded border border-slate-200 bg-white px-3 py-2">
                <dt>Cuota sugerida</dt>
                <dd className="font-semibold">{formatearMoneda(resultadoCalculo?.cuotaSugerida)}</dd>
              </div>
              <div className="flex items-center justify-between rounded border border-slate-200 bg-white px-3 py-2">
                <dt>Monto invertido</dt>
                <dd>{formatearMoneda(resultadoCalculo?.montoInvertido)}</dd>
              </div>
              <div className="flex items-center justify-between rounded border border-slate-200 bg-white px-3 py-2">
                <dt>Monto ganado estimado</dt>
                <dd>{formatearMoneda(resultadoCalculo?.montoGanadoEstimado)}</dd>
              </div>
              <div className="flex items-center justify-between rounded border border-slate-200 bg-white px-3 py-2">
                <dt>Monto por ganar</dt>
                <dd>{formatearMoneda(resultadoCalculo?.montoPorGanar)}</dd>
              </div>
            </dl>
          )}

          <p className="text-xs text-slate-500">
            Nota: la cuota mostrada es orientativa. La generación de cuotas reales se hace en una acción separada.
          </p>
        </aside>
      </div>
    </section>
  );
}
