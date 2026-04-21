import { PersonaLegajoPanel } from './PersonaLegajoPanel';
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

export function PersonaDetalle({ persona, loading, error, onEditar, onDarDeBaja, deshabilitarBaja }: Props) {
  if (loading) {
    return <p className="text-sm text-slate-600 dark:text-slate-300">Cargando detalle...</p>;
  }

  if (error) {
    return <p className="mensaje-error">{error}</p>;
  }

  if (!persona) {
    return <p className="text-sm text-slate-600 dark:text-slate-300">Seleccioná una persona para ver el detalle.</p>;
  }

  return (
    <div className="space-y-3">
      <section className="panel space-y-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{persona.nombre}</h2>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              persona.activo ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
            }`}
          >
            {persona.activo ? 'Activa' : 'Inactiva'}
          </span>
        </div>

        <p className="label-ui">Datos básicos de persona</p>

        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div className="card-interactiva">
            <dt className="label-ui">Alias</dt>
            <dd className="mt-1 font-medium text-slate-900 dark:text-slate-100">{valorTexto(persona.alias)}</dd>
          </div>
          <div className="card-interactiva">
            <dt className="label-ui">Teléfono</dt>
            <dd className="mt-1 font-medium text-slate-900 dark:text-slate-100">{valorTexto(persona.telefono)}</dd>
          </div>
          <div className="card-interactiva">
            <dt className="label-ui">Color de referencia</dt>
            <dd className="mt-1 flex items-center gap-2 font-medium text-slate-900 dark:text-slate-100">
              <span className="inline-block h-3 w-3 rounded-full border border-slate-300" style={estiloColor(persona.colorReferencia)} />
              {valorTexto(persona.colorReferencia)}
            </dd>
          </div>
          <div className="card-interactiva">
            <dt className="label-ui">Cobra en fecha</dt>
            <dd className="mt-1 font-medium text-slate-900 dark:text-slate-100">{persona.cobraEnFecha ? 'Sí' : 'No'}</dd>
          </div>
          <div className="card-interactiva sm:col-span-2">
            <dt className="label-ui">Tiene ingreso extra</dt>
            <dd className="mt-1 font-medium text-slate-900 dark:text-slate-100">{persona.tieneIngresoExtra ? 'Sí' : 'No'}</dd>
          </div>
        </dl>

        <div>
          <h3 className="label-ui">Observación rápida</h3>
          <p className="mt-1 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            {valorTexto(persona.observacionRapida)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={onEditar} className="boton-principal px-3 py-2">
            Editar
          </button>
          <button onClick={onDarDeBaja} disabled={!persona.activo || deshabilitarBaja} className="boton-secundario px-3 py-2">
            {deshabilitarBaja ? 'Procesando...' : 'Dar de baja'}
          </button>
        </div>
      </section>

      <PersonaLegajoPanel personaId={persona.id} />
    </div>
  );
}
