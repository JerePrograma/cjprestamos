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
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-app">
          {titulo}
        </h2>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="link-action mt-0"
          >
            Cancelar
          </button>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm">
          <span className="label-ui mb-1 block">
            Nombre *
          </span>

          <input
            required
            name="nombre"
            value={valor.nombre}
            onChange={(event) => onChange(actualizarCampo(valor, event))}
          />
        </label>

        <label className="text-sm">
          <span className="label-ui mb-1 block">
            Alias
          </span>

          <input
            name="alias"
            value={valor.alias}
            onChange={(event) => onChange(actualizarCampo(valor, event))}
          />
        </label>

        <label className="text-sm">
          <span className="label-ui mb-1 block">
            Teléfono
          </span>

          <input
            name="telefono"
            value={valor.telefono}
            onChange={(event) => onChange(actualizarCampo(valor, event))}
          />
        </label>

        <label className="text-sm">
          <span className="label-ui mb-1 block">
            Color de referencia
          </span>

          <div className="flex items-center gap-2">
            <input
              type="color"
              value={normalizarColorHex(valor.colorReferencia)}
              onChange={(event) =>
                onChange({ ...valor, colorReferencia: event.target.value })
              }
              className="h-11 w-14 shrink-0 cursor-pointer rounded-xl border border-subtle bg-surface-raised p-1"
              aria-label="Selector de color de referencia"
            />

            <input
              name="colorReferencia"
              value={valor.colorReferencia}
              onChange={(event) => onChange(actualizarCampo(valor, event))}
              placeholder="Ej: #22c55e"
            />
          </div>
        </label>
      </div>

      <label className="block text-sm">
        <span className="label-ui mb-1 block">
          Observación rápida
        </span>

        <textarea
          name="observacionRapida"
          value={valor.observacionRapida}
          onChange={(event) => onChange(actualizarCampo(valor, event))}
          rows={3}
        />
      </label>

      <div className="grid gap-2 text-sm sm:grid-cols-3">
        <label className="card-interactiva flex cursor-pointer items-center gap-2 py-2">
          <input
            type="checkbox"
            name="cobraEnFecha"
            checked={valor.cobraEnFecha}
            onChange={(event) => onChange(actualizarCampo(valor, event))}
          />
          <span className="font-medium text-app">
            Cobra en fecha
          </span>
        </label>

        <label className="card-interactiva flex cursor-pointer items-center gap-2 py-2">
          <input
            type="checkbox"
            name="tieneIngresoExtra"
            checked={valor.tieneIngresoExtra}
            onChange={(event) => onChange(actualizarCampo(valor, event))}
          />
          <span className="font-medium text-app">
            Tiene ingreso extra
          </span>
        </label>

        <label className="card-interactiva flex cursor-pointer items-center gap-2 py-2">
          <input
            type="checkbox"
            name="activo"
            checked={valor.activo}
            onChange={(event) => onChange(actualizarCampo(valor, event))}
          />
          <span className="font-medium text-app">
            Activo
          </span>
        </label>
      </div>

      {error && (
        <p className="mensaje-error">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="boton-principal"
      >
        {loading ? 'Guardando...' : textoBoton}
      </button>
    </form>
  );
}