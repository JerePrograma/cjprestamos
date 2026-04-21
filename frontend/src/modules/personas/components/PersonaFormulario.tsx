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

function normalizarColorHex(colorReferencia: string) {
  const color = colorReferencia.trim();
  const esHex = /^#[0-9a-fA-F]{6}$/.test(color);
  return esHex ? color : '#94a3b8';
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
    <form onSubmit={manejarSubmit} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{titulo}</h2>
        {onCancel && (
          <button type="button" onClick={onCancel} className="text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100">
            Cancelar
          </button>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm">
          <span className="label-ui">Nombre *</span>
          <input required name="nombre" value={valor.nombre} onChange={(e) => onChange(actualizarCampo(valor, e))} className="mt-1 w-full" />
        </label>

        <label className="text-sm">
          <span className="label-ui">Alias</span>
          <input name="alias" value={valor.alias} onChange={(e) => onChange(actualizarCampo(valor, e))} className="mt-1 w-full" />
        </label>

        <label className="text-sm">
          <span className="label-ui">Teléfono</span>
          <input name="telefono" value={valor.telefono} onChange={(e) => onChange(actualizarCampo(valor, e))} className="mt-1 w-full" />
        </label>

        <label className="text-sm">
          <span className="label-ui">Color de referencia</span>
          <div className="mt-1 flex items-center gap-2">
            <input
              type="color"
              value={normalizarColorHex(valor.colorReferencia)}
              onChange={(event) => onChange({ ...valor, colorReferencia: event.target.value })}
              className="h-11 w-14 cursor-pointer rounded-xl border border-slate-300 bg-white p-1 dark:border-slate-700 dark:bg-slate-900"
              aria-label="Selector de color de referencia"
            />
            <input name="colorReferencia" value={valor.colorReferencia} onChange={(e) => onChange(actualizarCampo(valor, e))} placeholder="Ej: #22c55e" className="w-full" />
          </div>
        </label>
      </div>

      <label className="block text-sm">
        <span className="label-ui">Observación rápida</span>
        <textarea name="observacionRapida" value={valor.observacionRapida} onChange={(e) => onChange(actualizarCampo(valor, e))} rows={3} className="mt-1 w-full" />
      </label>

      <div className="grid gap-2 text-sm sm:grid-cols-3">
        <label className="card-interactiva flex items-center gap-2 py-2">
          <input type="checkbox" name="cobraEnFecha" checked={valor.cobraEnFecha} onChange={(e) => onChange(actualizarCampo(valor, e))} />
          Cobra en fecha
        </label>

        <label className="card-interactiva flex items-center gap-2 py-2">
          <input type="checkbox" name="tieneIngresoExtra" checked={valor.tieneIngresoExtra} onChange={(e) => onChange(actualizarCampo(valor, e))} />
          Tiene ingreso extra
        </label>

        <label className="card-interactiva flex items-center gap-2 py-2">
          <input type="checkbox" name="activo" checked={valor.activo} onChange={(e) => onChange(actualizarCampo(valor, e))} />
          Activo
        </label>
      </div>

      {error && <p className="mensaje-error">{error}</p>}

      <button type="submit" disabled={loading} className="boton-principal">
        {loading ? 'Guardando...' : textoBoton}
      </button>
    </form>
  );
}
