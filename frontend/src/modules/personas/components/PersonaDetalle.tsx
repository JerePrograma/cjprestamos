import type { Persona } from '../types/persona';

type Props = {
  persona: Persona | null;
  loading: boolean;
  error: string | null;
  onEditar: () => void;
  onDarDeBaja: () => void;
  deshabilitarBaja: boolean;
};

function valorTexto(valor: string | null | undefined) {
  return valor && valor.trim() ? valor : '—';
}

function estiloColor(colorReferencia: string | null) {
  if (!colorReferencia || !colorReferencia.trim()) {
    return { backgroundColor: '#cbd5e1' };
  }

  return { backgroundColor: colorReferencia };
}

export function PersonaDetalle({
  persona,
  loading,
  error,
  onEditar,
  onDarDeBaja,
  deshabilitarBaja,
}: Props) {
  if (loading) {
    return <p className="text-sm text-slate-600">Cargando detalle...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-700">{error}</p>;
  }

  if (!persona) {
    return <p className="text-sm text-slate-600">Seleccioná una persona para ver el detalle.</p>;
  }

  return (
    <section className="space-y-4 rounded-lg border border-slate-200 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">{persona.nombre}</h2>
        <span
          className={`rounded px-2 py-1 text-xs font-medium ${
            persona.activo ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
          }`}
        >
          {persona.activo ? 'Activa' : 'Inactiva'}
        </span>
      </div>

      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-slate-500">Alias</dt>
          <dd className="font-medium">{valorTexto(persona.alias)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Teléfono</dt>
          <dd className="font-medium">{valorTexto(persona.telefono)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Color de referencia</dt>
          <dd className="mt-1 flex items-center gap-2 font-medium">
            <span className="inline-block h-3 w-3 rounded-full border border-slate-300" style={estiloColor(persona.colorReferencia)} />
            {valorTexto(persona.colorReferencia)}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">Cobra en fecha</dt>
          <dd className="font-medium">{persona.cobraEnFecha ? 'Sí' : 'No'}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Tiene ingreso extra</dt>
          <dd className="font-medium">{persona.tieneIngresoExtra ? 'Sí' : 'No'}</dd>
        </div>
      </dl>

      <div>
        <h3 className="text-sm text-slate-500">Observación rápida</h3>
        <p className="mt-1 rounded bg-slate-50 p-3 text-sm text-slate-700">{valorTexto(persona.observacionRapida)}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={onEditar} className="rounded bg-slate-800 px-3 py-2 text-sm text-white">
          Editar
        </button>
        <button
          onClick={onDarDeBaja}
          disabled={!persona.activo || deshabilitarBaja}
          className="rounded border border-slate-300 px-3 py-2 text-sm text-slate-700 disabled:opacity-60"
        >
          {deshabilitarBaja ? 'Procesando...' : 'Dar de baja'}
        </button>
      </div>
    </section>
  );
}
