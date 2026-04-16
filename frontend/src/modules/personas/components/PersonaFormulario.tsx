import type { ChangeEvent, FormEvent } from 'react';
import type { PersonaPayload } from '../types/persona';

type Props = {
  titulo: string;
  textoBoton: string;
  valor: PersonaPayload;
  error: string | null;
  loading: boolean;
  onChange: (valor: PersonaPayload) => void;
  onSubmit: () => void;
  onCancel?: () => void;
};

function actualizarCampo(
  valor: PersonaPayload,
  event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
): PersonaPayload {
  const { name, value, type } = event.target;

  if (type === 'checkbox') {
    const checked = (event.target as HTMLInputElement).checked;
    return { ...valor, [name]: checked };
  }

  return { ...valor, [name]: value };
}

export function PersonaFormulario({
  titulo,
  textoBoton,
  valor,
  error,
  loading,
  onChange,
  onSubmit,
  onCancel,
}: Props) {
  const manejarSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={manejarSubmit} className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">{titulo}</h2>
        {onCancel && (
          <button type="button" onClick={onCancel} className="text-xs text-slate-600 hover:text-slate-900">
            Cancelar
          </button>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm text-slate-700">
          Nombre *
          <input
            required
            name="nombre"
            value={valor.nombre}
            onChange={(e) => onChange(actualizarCampo(valor, e))}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="text-sm text-slate-700">
          Alias
          <input
            name="alias"
            value={valor.alias}
            onChange={(e) => onChange(actualizarCampo(valor, e))}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="text-sm text-slate-700">
          Teléfono
          <input
            name="telefono"
            value={valor.telefono}
            onChange={(e) => onChange(actualizarCampo(valor, e))}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="text-sm text-slate-700">
          Color de referencia
          <input
            name="colorReferencia"
            value={valor.colorReferencia}
            onChange={(e) => onChange(actualizarCampo(valor, e))}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>
      </div>

      <label className="block text-sm text-slate-700">
        Observación rápida
        <textarea
          name="observacionRapida"
          value={valor.observacionRapida}
          onChange={(e) => onChange(actualizarCampo(valor, e))}
          rows={3}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
        />
      </label>

      <div className="grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
        <label className="flex items-center gap-2 rounded border border-slate-300 bg-white px-3 py-2">
          <input
            type="checkbox"
            name="cobraEnFecha"
            checked={valor.cobraEnFecha}
            onChange={(e) => onChange(actualizarCampo(valor, e))}
          />
          Cobra en fecha
        </label>

        <label className="flex items-center gap-2 rounded border border-slate-300 bg-white px-3 py-2">
          <input
            type="checkbox"
            name="tieneIngresoExtra"
            checked={valor.tieneIngresoExtra}
            onChange={(e) => onChange(actualizarCampo(valor, e))}
          />
          Tiene ingreso extra
        </label>

        <label className="flex items-center gap-2 rounded border border-slate-300 bg-white px-3 py-2">
          <input
            type="checkbox"
            name="activo"
            checked={valor.activo}
            onChange={(e) => onChange(actualizarCampo(valor, e))}
          />
          Activo
        </label>
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded bg-slate-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {loading ? 'Guardando...' : textoBoton}
      </button>
    </form>
  );
}
