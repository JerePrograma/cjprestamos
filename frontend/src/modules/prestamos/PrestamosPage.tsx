import { useEffect, useMemo, useState } from 'react';
import { usePagosPrestamo, useRegistrarPago } from '../pagos/hooks/usePagos';
import {
  crearPayloadPago,
  formularioInicialPago,
  type PagoFormulario,
} from '../pagos/types/pago';
import { useListadoPersonas } from '../personas/hooks/usePersonas';
import {
  useCalcularPrestamo,
  useCrearPrestamo,
  useCuotasPrestamo,
  useDetallePrestamo,
  useListadoPrestamos,
  useResumenPrestamo,
} from './hooks/usePrestamos';
import {
  crearPayloadCalculo,
  crearPayloadPrestamo,
  formularioInicialPrestamo,
  type CalculoPrestamoResultado,
  type FrecuenciaTipo,
  type PrestamoFormulario,
  type PrestamoResponse,
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

function formatearFecha(valor: string | null) {
  if (!valor) {
    return 'Sin fecha';
  }

  return new Date(`${valor}T00:00:00`).toLocaleDateString('es-AR');
}

function etiquetaFrecuencia(frecuenciaTipo: FrecuenciaTipo, frecuenciaCadaDias: number | null) {
  if (frecuenciaTipo === 'CADA_X_DIAS') {
    return `Cada ${frecuenciaCadaDias ?? '-'} días`;
  }

  if (frecuenciaTipo === 'FECHAS_MANUALES') {
    return 'Fechas manuales';
  }

  return 'Mensual';
}

function etiquetaEstado(estado: PrestamoResponse['estado']) {
  if (estado === 'ACTIVO') {
    return 'bg-emerald-100 text-emerald-800';
  }

  if (estado === 'FINALIZADO') {
    return 'bg-slate-200 text-slate-700';
  }

  if (estado === 'RENEGOCIADO') {
    return 'bg-amber-100 text-amber-800';
  }

  return 'bg-red-100 text-red-700';
}

export function PrestamosPage() {
  const [formulario, setFormulario] = useState<PrestamoFormulario>(formularioInicialPrestamo);
  const [errorFormulario, setErrorFormulario] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [seleccionId, setSeleccionId] = useState<number | null>(null);
  const [formularioPago, setFormularioPago] = useState<PagoFormulario>(formularioInicialPago);
  const [errorPago, setErrorPago] = useState<string | null>(null);
  const [mensajePago, setMensajePago] = useState<string | null>(null);

  const personas = useListadoPersonas();
  const prestamos = useListadoPrestamos();
  const detallePrestamo = useDetallePrestamo(seleccionId);
  const cuotasPrestamo = useCuotasPrestamo(seleccionId);
  const resumenPrestamo = useResumenPrestamo(detallePrestamo.data ?? null);
  const pagosPrestamo = usePagosPrestamo(seleccionId);

  const crearPrestamo = useCrearPrestamo();
  const calcularPrestamo = useCalcularPrestamo();
  const registrarPago = useRegistrarPago();

  const puedeCalcularAlta = useMemo(() => esFormularioMinimoValido(formulario), [formulario]);

  useEffect(() => {
    if (!puedeCalcularAlta) {
      return;
    }

    const timeout = setTimeout(() => {
      calcularPrestamo.mutate(crearPayloadCalculo(formulario));
    }, 250);

    return () => clearTimeout(timeout);
  }, [formulario, puedeCalcularAlta]);

  useEffect(() => {
    if (seleccionId === null && prestamos.data && prestamos.data.length > 0) {
      setSeleccionId(prestamos.data[0].id);
    }
  }, [prestamos.data, seleccionId]);

  useEffect(() => {
    setErrorPago(null);
    setMensajePago(null);
  }, [seleccionId]);

  const personasPorId = useMemo(() => {
    const mapa = new Map<number, string>();
    (personas.data ?? []).forEach((persona) => {
      mapa.set(persona.id, persona.nombre);
    });
    return mapa;
  }, [personas.data]);

  const actualizarCampo = <K extends keyof PrestamoFormulario>(campo: K, valor: PrestamoFormulario[K]) => {
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
    setMensajeExito(null);
    setErrorFormulario(null);
  };

  const actualizarCampoPago = <K extends keyof PagoFormulario>(campo: K, valor: PagoFormulario[K]) => {
    setFormularioPago((actual) => ({ ...actual, [campo]: valor }));
    setErrorPago(null);
    setMensajePago(null);
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
      setSeleccionId(prestamo.id);
      setFormulario(formularioInicialPrestamo);
      setMensajeExito('Préstamo creado correctamente.');
    } catch {
      setErrorFormulario('No se pudo crear el préstamo. Revisá los datos e intentá nuevamente.');
    }
  };

  const resultadoAlta: CalculoPrestamoResultado | undefined = calcularPrestamo.data;

  const guardarPago = async () => {
    if (!seleccionId) {
      setErrorPago('Seleccioná un préstamo antes de registrar un pago.');
      return;
    }

    if (!formularioPago.fechaPago) {
      setErrorPago('La fecha de pago es obligatoria.');
      return;
    }

    if (Number(formularioPago.monto) <= 0) {
      setErrorPago('El monto debe ser mayor que 0.');
      return;
    }

    try {
      await registrarPago.mutateAsync(crearPayloadPago(seleccionId, formularioPago));
      setMensajePago('Pago registrado correctamente.');
      setFormularioPago((actual) => ({
        ...actual,
        monto: '',
        referencia: '',
        observacion: '',
      }));
    } catch {
      setErrorPago('No se pudo registrar el pago. Revisá los datos e intentá nuevamente.');
    }
  };

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-slate-900">Préstamos</h1>
        <p className="text-sm text-slate-600">
          Listado, detalle operativo y alta de préstamo en una sola vista manual-first.
        </p>
      </header>

      <div className="grid gap-4 xl:grid-cols-[320px_1fr_420px]">
        <aside className="rounded-lg border border-slate-200 p-3">
          <h2 className="mb-2 text-sm font-semibold text-slate-900">Listado</h2>

          {prestamos.isLoading ? (
            <p className="text-sm text-slate-500">Cargando préstamos...</p>
          ) : prestamos.isError ? (
            <p className="text-sm text-red-700">No se pudo cargar el listado de préstamos.</p>
          ) : (prestamos.data ?? []).length === 0 ? (
            <p className="text-sm text-slate-500">Todavía no hay préstamos cargados.</p>
          ) : (
            <ul className="max-h-[680px] space-y-2 overflow-auto">
              {(prestamos.data ?? []).map((prestamo) => (
                <li key={prestamo.id}>
                  <button
                    type="button"
                    onClick={() => setSeleccionId(prestamo.id)}
                    className={`w-full rounded border px-3 py-2 text-left text-sm transition hover:border-slate-400 ${
                      seleccionId === prestamo.id ? 'border-slate-700 bg-slate-50' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-900">#{prestamo.id}</span>
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-medium ${etiquetaEstado(prestamo.estado)}`}
                      >
                        {prestamo.estado}
                      </span>
                    </div>
                    <p className="mt-1 text-slate-700">{personasPorId.get(prestamo.personaId) ?? `Persona ${prestamo.personaId}`}</p>
                    <p className="text-xs text-slate-500">{formatearMoneda(prestamo.montoInicial)} · {prestamo.cantidadCuotas} cuotas</p>
                    <p className="text-xs text-slate-500">{etiquetaFrecuencia(prestamo.frecuenciaTipo, prestamo.frecuenciaCadaDias)}</p>
                    {prestamo.referenciaCodigo && (
                      <p className="text-xs text-slate-500">Ref: {prestamo.referenciaCodigo}</p>
                    )}
                    {prestamo.fechaBase && <p className="text-xs text-slate-500">Base: {formatearFecha(prestamo.fechaBase)}</p>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <div className="space-y-3 rounded-lg border border-slate-200 p-4">
          <h2 className="text-sm font-semibold text-slate-900">Detalle del préstamo</h2>

          {seleccionId === null ? (
            <p className="text-sm text-slate-500">Seleccioná un préstamo para ver el detalle.</p>
          ) : detallePrestamo.isLoading ? (
            <p className="text-sm text-slate-500">Cargando detalle...</p>
          ) : detallePrestamo.isError || !detallePrestamo.data ? (
            <p className="text-sm text-red-700">No se pudo cargar el detalle del préstamo.</p>
          ) : (
            <>
              <dl className="grid gap-2 md:grid-cols-2">
                <div><dt className="text-xs text-slate-500">Préstamo</dt><dd className="font-medium">#{detallePrestamo.data.id}</dd></div>
                <div><dt className="text-xs text-slate-500">Persona</dt><dd>{personasPorId.get(detallePrestamo.data.personaId) ?? `Persona ${detallePrestamo.data.personaId}`}</dd></div>
                <div><dt className="text-xs text-slate-500">Monto inicial</dt><dd>{formatearMoneda(detallePrestamo.data.montoInicial)}</dd></div>
                <div><dt className="text-xs text-slate-500">Estado</dt><dd>{detallePrestamo.data.estado}</dd></div>
                <div><dt className="text-xs text-slate-500">% fijo sugerido</dt><dd>{detallePrestamo.data.porcentajeFijoSugerido ?? '-'}</dd></div>
                <div><dt className="text-xs text-slate-500">Interés manual</dt><dd>{detallePrestamo.data.interesManualOpcional ?? '-'}</dd></div>
                <div><dt className="text-xs text-slate-500">Cantidad de cuotas</dt><dd>{detallePrestamo.data.cantidadCuotas}</dd></div>
                <div><dt className="text-xs text-slate-500">Frecuencia</dt><dd>{etiquetaFrecuencia(detallePrestamo.data.frecuenciaTipo, detallePrestamo.data.frecuenciaCadaDias)}</dd></div>
                <div><dt className="text-xs text-slate-500">Frecuencia cada X días</dt><dd>{detallePrestamo.data.frecuenciaCadaDias ?? '-'}</dd></div>
                <div><dt className="text-xs text-slate-500">Fecha base</dt><dd>{formatearFecha(detallePrestamo.data.fechaBase)}</dd></div>
                <div><dt className="text-xs text-slate-500">Usa fechas manuales</dt><dd>{detallePrestamo.data.usarFechasManuales ? 'Sí' : 'No'}</dd></div>
                <div><dt className="text-xs text-slate-500">Referencia</dt><dd>{detallePrestamo.data.referenciaCodigo ?? '-'}</dd></div>
                <div className="md:col-span-2"><dt className="text-xs text-slate-500">Observaciones</dt><dd>{detallePrestamo.data.observaciones ?? '-'}</dd></div>
              </dl>

              <div className="rounded border border-slate-200 bg-slate-50 p-3">
                <h3 className="mb-2 text-sm font-semibold">Resumen económico</h3>
                {resumenPrestamo.isLoading ? (
                  <p className="text-sm text-slate-500">Calculando resumen...</p>
                ) : resumenPrestamo.isError || !resumenPrestamo.data ? (
                  <p className="text-sm text-red-700">No se pudo calcular el resumen económico.</p>
                ) : (
                  <dl className="grid gap-2 text-sm md:grid-cols-2">
                    <div><dt className="text-xs text-slate-500">Total a devolver</dt><dd>{formatearMoneda(resumenPrestamo.data.totalADevolver)}</dd></div>
                    <div><dt className="text-xs text-slate-500">Cuota sugerida</dt><dd>{formatearMoneda(resumenPrestamo.data.cuotaSugerida)}</dd></div>
                    <div><dt className="text-xs text-slate-500">Monto invertido</dt><dd>{formatearMoneda(resumenPrestamo.data.montoInvertido)}</dd></div>
                    <div><dt className="text-xs text-slate-500">Monto ganado estimado</dt><dd>{formatearMoneda(resumenPrestamo.data.montoGanadoEstimado)}</dd></div>
                    <div><dt className="text-xs text-slate-500">Monto por ganar</dt><dd>{formatearMoneda(resumenPrestamo.data.montoPorGanar)}</dd></div>
                  </dl>
                )}
              </div>

              <div className="rounded border border-slate-200 p-3">
                <h3 className="mb-2 text-sm font-semibold">Cuotas asociadas</h3>
                {cuotasPrestamo.isLoading ? (
                  <p className="text-sm text-slate-500">Cargando cuotas...</p>
                ) : cuotasPrestamo.isError ? (
                  <p className="text-sm text-red-700">No se pudo cargar las cuotas del préstamo.</p>
                ) : (cuotasPrestamo.data ?? []).length === 0 ? (
                  <p className="text-sm text-slate-500">Este préstamo todavía no tiene cuotas generadas.</p>
                ) : (
                  <ul className="space-y-2">
                    {(cuotasPrestamo.data ?? []).map((cuota) => (
                      <li key={cuota.id} className="rounded border border-slate-200 px-3 py-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Cuota #{cuota.numeroCuota}</span>
                          <span className="text-xs text-slate-500">{cuota.estado}</span>
                        </div>
                        <p className="text-xs text-slate-500">Vence: {formatearFecha(cuota.fechaVencimiento)}</p>
                        <p className="text-xs text-slate-500">
                          Programado: {formatearMoneda(cuota.montoProgramado)} · Pagado: {formatearMoneda(cuota.montoPagado)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded border border-slate-200 p-3">
                <h3 className="mb-2 text-sm font-semibold">Registrar pago</h3>
                <p className="mb-3 text-xs text-slate-500">
                  El pago se imputa automáticamente en backend y actualiza cuotas según saldo pendiente.
                </p>

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="text-sm text-slate-700">Fecha de pago
                    <input
                      type="date"
                      className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                      value={formularioPago.fechaPago}
                      onChange={(event) => actualizarCampoPago('fechaPago', event.target.value)}
                    />
                  </label>
                  <label className="text-sm text-slate-700">Monto
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                      value={formularioPago.monto}
                      onChange={(event) => actualizarCampoPago('monto', event.target.value)}
                    />
                  </label>
                  <label className="text-sm text-slate-700">Referencia
                    <input
                      className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                      maxLength={120}
                      value={formularioPago.referencia}
                      onChange={(event) => actualizarCampoPago('referencia', event.target.value)}
                    />
                  </label>
                  <label className="text-sm text-slate-700">Observación
                    <input
                      className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                      maxLength={600}
                      value={formularioPago.observacion}
                      onChange={(event) => actualizarCampoPago('observacion', event.target.value)}
                    />
                  </label>
                </div>

                {errorPago && <p className="mt-3 text-sm text-red-700">{errorPago}</p>}
                {mensajePago && <p className="mt-3 text-sm text-emerald-700">{mensajePago}</p>}

                <button
                  type="button"
                  onClick={guardarPago}
                  disabled={registrarPago.isPending}
                  className="mt-3 rounded bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
                >
                  {registrarPago.isPending ? 'Registrando pago...' : 'Registrar pago'}
                </button>
              </div>

              <div className="rounded border border-slate-200 p-3">
                <h3 className="mb-2 text-sm font-semibold">Historial de pagos</h3>
                {pagosPrestamo.isLoading ? (
                  <p className="text-sm text-slate-500">Cargando pagos...</p>
                ) : pagosPrestamo.isError ? (
                  <p className="text-sm text-red-700">No se pudo cargar el historial de pagos.</p>
                ) : (pagosPrestamo.data ?? []).length === 0 ? (
                  <p className="text-sm text-slate-500">Todavía no hay pagos registrados para este préstamo.</p>
                ) : (
                  <ul className="space-y-2">
                    {(pagosPrestamo.data ?? []).map((pago) => (
                      <li key={pago.id} className="rounded border border-slate-200 px-3 py-2 text-sm">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium">{formatearFecha(pago.fechaPago)}</span>
                          <span className="text-xs text-slate-500">{pago.estado}</span>
                        </div>
                        <p className="text-xs text-slate-500">Monto: {formatearMoneda(pago.monto)}</p>
                        <p className="text-xs text-slate-500">Referencia: {pago.referencia || '-'}</p>
                        <p className="text-xs text-slate-500">Observación: {pago.observacion || '-'}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>

        <aside className="space-y-3 rounded-lg border border-slate-200 p-4">
          <h2 className="text-sm font-semibold text-slate-900">Alta de préstamo</h2>

          <label className="block text-sm text-slate-700">
            Persona
            <select
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
              value={formulario.personaId}
              onChange={(event) => actualizarCampo('personaId', event.target.value)}
            >
              <option value="">Seleccionar persona</option>
              {(personas.data ?? []).map((persona) => (
                <option key={persona.id} value={persona.id}>{persona.nombre}</option>
              ))}
            </select>
          </label>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm text-slate-700">Monto inicial
              <input type="number" min="0" step="0.01" className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                value={formulario.montoInicial} onChange={(event) => actualizarCampo('montoInicial', event.target.value)} />
            </label>
            <label className="text-sm text-slate-700">Cantidad de cuotas
              <input type="number" min="1" className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                value={formulario.cantidadCuotas} onChange={(event) => actualizarCampo('cantidadCuotas', event.target.value)} />
            </label>
            <label className="text-sm text-slate-700">Porcentaje fijo sugerido
              <input type="number" min="0" step="0.01" className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                value={formulario.porcentajeFijoSugerido}
                onChange={(event) => actualizarCampo('porcentajeFijoSugerido', event.target.value)} />
            </label>
            <label className="text-sm text-slate-700">Interés manual opcional
              <input type="number" min="0" step="0.01" className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                value={formulario.interesManualOpcional}
                onChange={(event) => actualizarCampo('interesManualOpcional', event.target.value)} />
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm text-slate-700">Frecuencia
              <select className="mt-1 w-full rounded border border-slate-300 px-3 py-2" value={formulario.frecuenciaTipo}
                onChange={(event) => {
                  const frecuencia = event.target.value as PrestamoFormulario['frecuenciaTipo'];
                  actualizarCampo('frecuenciaTipo', frecuencia);
                  if (frecuencia === 'FECHAS_MANUALES') actualizarCampo('usarFechasManuales', true);
                  if (frecuencia !== 'CADA_X_DIAS') actualizarCampo('frecuenciaCadaDias', '');
                }}>
                <option value="MENSUAL">Mensual</option>
                <option value="CADA_X_DIAS">Cada X días</option>
                <option value="FECHAS_MANUALES">Fechas manuales</option>
              </select>
            </label>

            {formulario.frecuenciaTipo === 'CADA_X_DIAS' ? (
              <label className="text-sm text-slate-700">Frecuencia cada X días
                <input type="number" min="1" className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                  value={formulario.frecuenciaCadaDias}
                  onChange={(event) => actualizarCampo('frecuenciaCadaDias', event.target.value)} />
              </label>
            ) : (
              <label className="text-sm text-slate-700">Fecha base
                <input type="date" className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                  value={formulario.fechaBase}
                  onChange={(event) => actualizarCampo('fechaBase', event.target.value)}
                  disabled={formulario.usarFechasManuales && formulario.frecuenciaTipo === 'FECHAS_MANUALES'} />
              </label>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={formulario.usarFechasManuales}
              onChange={(event) => actualizarCampo('usarFechasManuales', event.target.checked)} />
            Usar fechas manuales
          </label>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm text-slate-700">Referencia
              <input className="mt-1 w-full rounded border border-slate-300 px-3 py-2" value={formulario.referenciaCodigo}
                onChange={(event) => actualizarCampo('referenciaCodigo', event.target.value)} maxLength={80} />
            </label>
            <label className="text-sm text-slate-700">Estado
              <select className="mt-1 w-full rounded border border-slate-300 px-3 py-2" value={formulario.estado}
                onChange={(event) => actualizarCampo('estado', event.target.value as PrestamoFormulario['estado'])}>
                <option value="ACTIVO">Activo</option>
                <option value="FINALIZADO">Finalizado</option>
                <option value="RENEGOCIADO">Renegociado</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
            </label>
          </div>

          <label className="block text-sm text-slate-700">Observaciones
            <textarea className="mt-1 h-20 w-full rounded border border-slate-300 px-3 py-2" value={formulario.observaciones}
              onChange={(event) => actualizarCampo('observaciones', event.target.value)} maxLength={600} />
          </label>

          {errorFormulario && <p className="text-sm text-red-700">{errorFormulario}</p>}
          {mensajeExito && <p className="text-sm text-emerald-700">{mensajeExito}</p>}

          <button type="button" onClick={guardarPrestamo}
            disabled={crearPrestamo.isPending || personas.isLoading}
            className="rounded bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60">
            {crearPrestamo.isPending ? 'Guardando...' : 'Guardar préstamo'}
          </button>

          <div className="rounded border border-slate-200 bg-slate-50 p-3">
            <h3 className="mb-2 text-sm font-semibold">Cálculo sugerido del alta</h3>
            {!puedeCalcularAlta ? (
              <p className="text-sm text-slate-500">Completá persona, monto inicial y cantidad de cuotas.</p>
            ) : calcularPrestamo.isPending ? (
              <p className="text-sm text-slate-500">Calculando...</p>
            ) : calcularPrestamo.isError ? (
              <p className="text-sm text-red-700">No se pudo obtener cálculo sugerido.</p>
            ) : (
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between"><dt>Total</dt><dd>{formatearMoneda(resultadoAlta?.totalADevolver)}</dd></div>
                <div className="flex justify-between"><dt>Cuota sugerida</dt><dd>{formatearMoneda(resultadoAlta?.cuotaSugerida)}</dd></div>
                <div className="flex justify-between"><dt>Invertido</dt><dd>{formatearMoneda(resultadoAlta?.montoInvertido)}</dd></div>
                <div className="flex justify-between"><dt>Ganado estimado</dt><dd>{formatearMoneda(resultadoAlta?.montoGanadoEstimado)}</dd></div>
                <div className="flex justify-between"><dt>Por ganar</dt><dd>{formatearMoneda(resultadoAlta?.montoPorGanar)}</dd></div>
              </dl>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
