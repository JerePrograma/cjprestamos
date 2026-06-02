import { useEffect, useMemo, useState } from 'react';
import { formatearMonedaSinCentavos } from '../../../shared/lib/money';
import type { Persona } from '../../personas/types/persona';
import { useCalcularPrestamo, useCrearPrestamo } from '../hooks/usePrestamos';
import {
  crearPayloadCalculo,
  crearPayloadPrestamo,
  formularioInicialPrestamo,
  type CalculoPrestamoResultado,
  type PrestamoFormulario,
} from '../types/prestamo';

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

function moneda(valor: number | null | undefined) {
  return valor === null || valor === undefined ? '—' : formatearMonedaSinCentavos(valor);
}

function FilaCalculo({ etiqueta, valor }: { etiqueta: string; valor: number | null | undefined }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted">{etiqueta}</dt>
      <dd className="font-semibold text-app">{moneda(valor)}</dd>
    </div>
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
      setErrorFormulario('Completá persona, monto inicial y cantidad de cuotas.');
      return;
    }

    if (
      formulario.frecuenciaTipo === 'CADA_X_DIAS' &&
      Number(formulario.frecuenciaCadaDias) <= 0
    ) {
      setErrorFormulario('Para CADA_X_DIAS, la frecuencia debe ser mayor que 0.');
      return;
    }

    if (Number(formulario.porcentajeFijoSugerido || '0') < 0) {
      setErrorFormulario('El porcentaje fijo sugerido no puede ser negativo.');
      return;
    }

    if (Number(formulario.interesManualOpcional || '0') < 0) {
      setErrorFormulario('El interés manual no puede ser negativo.');
      return;
    }

    if (
      formulario.frecuenciaTipo !== 'FECHAS_MANUALES' &&
      formulario.usarFechasManuales
    ) {
      setErrorFormulario('Usar fechas manuales solo aplica cuando la frecuencia es FECHAS_MANUALES.');
      return;
    }

    if (
      formulario.frecuenciaTipo === 'FECHAS_MANUALES' &&
      !formulario.usarFechasManuales
    ) {
      setErrorFormulario('Para FECHAS_MANUALES, activá "Usar fechas manuales".');
      return;
    }

    if (
      formulario.frecuenciaTipo !== 'FECHAS_MANUALES' &&
      !formulario.fechaBase
    ) {
      setErrorFormulario('La fecha base es obligatoria para frecuencia automática.');
      return;
    }

    try {
      const prestamo = await crearPrestamo.mutateAsync(
        crearPayloadPrestamo(formulario),
      );

      onCreado(prestamo.id);
      setFormulario(formularioInicialPrestamo);
      setMensajeExito('Préstamo creado correctamente.');
    } catch {
      setErrorFormulario('No se pudo crear el préstamo. Revisá los datos e intentá nuevamente.');
    }
  };

  const resultadoAlta: CalculoPrestamoResultado | undefined = calcularPrestamo.data;

  return (
    <aside className="panel space-y-5 p-4 sm:p-5">
      <div className="space-y-1">
        <h2 className="text-base font-semibold text-app">
          Alta de préstamo
        </h2>

        <p className="text-xs text-muted">
          Cargá condiciones base sin centavos. Si ingresás decimales, el sistema redondea hacia arriba.
        </p>
      </div>

      <label className="block text-sm">
        <span className="label-ui mb-1 block">Persona</span>

        <select
          value={formulario.personaId}
          onChange={(event) => actualizarCampo('personaId', event.target.value)}
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
        <p className="text-xs text-muted">Cargando personas disponibles...</p>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm">
          <span className="label-ui mb-1 block">Monto inicial</span>
          <input
            type="number"
            min="0"
            step="1"
            value={formulario.montoInicial}
            onChange={(event) => actualizarCampo('montoInicial', event.target.value)}
          />
        </label>

        <label className="text-sm">
          <span className="label-ui mb-1 block">Cantidad de cuotas</span>
          <input
            type="number"
            min="1"
            value={formulario.cantidadCuotas}
            onChange={(event) => actualizarCampo('cantidadCuotas', event.target.value)}
          />
        </label>

        <label className="text-sm">
          <span className="label-ui mb-1 block">Porcentaje fijo sugerido</span>
          <input
            type="number"
            min="0"
            step="1"
            value={formulario.porcentajeFijoSugerido}
            onChange={(event) => actualizarCampo('porcentajeFijoSugerido', event.target.value)}
          />
        </label>

        <label className="text-sm">
          <span className="label-ui mb-1 block">Interés manual opcional</span>
          <input
            type="number"
            min="0"
            step="1"
            value={formulario.interesManualOpcional}
            onChange={(event) => actualizarCampo('interesManualOpcional', event.target.value)}
          />
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <label className="text-sm">
          <span className="label-ui mb-1 block">Frecuencia</span>
          <select
            value={formulario.frecuenciaTipo}
            onChange={(event) => {
              const frecuencia = event.target.value as PrestamoFormulario['frecuenciaTipo'];

              actualizarCampo('frecuenciaTipo', frecuencia);
              actualizarCampo('usarFechasManuales', frecuencia === 'FECHAS_MANUALES');

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

        <label className="text-sm">
          <span className="label-ui mb-1 block">
            {formulario.frecuenciaTipo === 'FECHAS_MANUALES'
              ? 'Fecha inicial sugerida'
              : 'Fecha base'}
          </span>

          <input
            type="date"
            value={formulario.fechaBase}
            onChange={(event) => actualizarCampo('fechaBase', event.target.value)}
          />
        </label>

        {formulario.frecuenciaTipo === 'CADA_X_DIAS' && (
          <label className="text-sm">
            <span className="label-ui mb-1 block">Frecuencia cada X días</span>
            <input
              type="number"
              min="1"
              value={formulario.frecuenciaCadaDias}
              onChange={(event) => actualizarCampo('frecuenciaCadaDias', event.target.value)}
            />
          </label>
        )}
      </div>

      {formulario.frecuenciaTipo === 'FECHAS_MANUALES' && (
        <label className="card-interactiva flex cursor-pointer items-center gap-2 py-2 text-sm">
          <input
            type="checkbox"
            checked={formulario.usarFechasManuales}
            onChange={(event) => actualizarCampo('usarFechasManuales', event.target.checked)}
            disabled
          />

          <span className="font-medium text-app">
            Usar fechas manuales
          </span>
        </label>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm">
          <span className="label-ui mb-1 block">Referencia</span>
          <input
            value={formulario.referenciaCodigo}
            onChange={(event) => actualizarCampo('referenciaCodigo', event.target.value)}
            maxLength={80}
          />
        </label>

        <label className="text-sm">
          <span className="label-ui mb-1 block">Estado</span>
          <select
            value={formulario.estado}
            onChange={(event) =>
              actualizarCampo('estado', event.target.value as PrestamoFormulario['estado'])
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
        <span className="label-ui mb-1 block">Observaciones</span>
        <textarea
          value={formulario.observaciones}
          onChange={(event) => actualizarCampo('observaciones', event.target.value)}
          maxLength={600}
          rows={3}
        />
      </label>

      {errorFormulario && <p className="mensaje-error">{errorFormulario}</p>}
      {mensajeExito && <p className="mensaje-exito">{mensajeExito}</p>}

      <button
        type="button"
        onClick={guardarPrestamo}
        disabled={crearPrestamo.isPending || personasLoading}
        className="boton-principal"
      >
        {crearPrestamo.isPending ? 'Guardando...' : 'Guardar préstamo'}
      </button>

      <div className="panel-accent">
        <h3 className="mb-2 text-sm font-semibold text-app">
          Cálculo sugerido del alta
        </h3>

        {!puedeCalcularAlta ? (
          <p className="text-sm text-muted">
            Completá persona, monto inicial y cantidad de cuotas.
          </p>
        ) : calcularPrestamo.isPending ? (
          <p className="text-sm text-muted">Calculando...</p>
        ) : calcularPrestamo.isError ? (
          <p className="mensaje-error">No se pudo obtener cálculo sugerido.</p>
        ) : (
          <dl className="space-y-2 text-sm">
            <FilaCalculo etiqueta="Total" valor={resultadoAlta?.totalADevolver} />
            <FilaCalculo etiqueta="Cuota sugerida" valor={resultadoAlta?.cuotaSugerida} />
            <FilaCalculo etiqueta="Invertido" valor={resultadoAlta?.montoInvertido} />
            <FilaCalculo etiqueta="Ganado estimado" valor={resultadoAlta?.montoGanadoEstimado} />
            <FilaCalculo etiqueta="Por ganar" valor={resultadoAlta?.montoPorGanar} />
          </dl>
        )}
      </div>
    </aside>
  );
}
