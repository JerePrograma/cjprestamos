import { StatusPill } from '../../../components/ui/StatusPill';
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

export function PersonaDetalle({
  persona,
  loading,
  error,
  onEditar,
  onDarDeBaja,
  deshabilitarBaja,
}: Props) {
  if (loading) {
    return <p className="text-sm text-muted">Cargando detalle...</p>;
  }

  if (error) {
    return <p className="mensaje-error">{error}</p>;
  }

  if (!persona) {
    return (
      <p className="text-sm text-muted">
        Seleccioná una persona para ver el detalle.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <section className="panel space-y-5 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <h2 className="truncate text-xl font-semibold text-app">
              {persona.nombre}
            </h2>

            <p className="mt-1 text-sm text-muted">
              Datos operativos y referencia básica de la persona.
            </p>
          </div>

          <StatusPill
            texto={persona.activo ? 'Activa' : 'Inactiva'}
            tone={persona.activo ? 'success' : 'neutral'}
          />
        </div>

        <div>
          <p className="label-ui mb-2">
            Datos básicos de persona
          </p>

          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="card-interactiva">
              <dt className="label-ui">Alias</dt>
              <dd className="mt-1 font-semibold text-app">
                {valorTexto(persona.alias)}
              </dd>
            </div>

            <div className="card-interactiva">
              <dt className="label-ui">Teléfono</dt>
              <dd className="mt-1 font-semibold text-app">
                {valorTexto(persona.telefono)}
              </dd>
            </div>

            <div className="card-interactiva">
              <dt className="label-ui">Color de referencia</dt>
              <dd className="mt-1 flex items-center gap-2 font-semibold text-app">
                <span
                  aria-hidden="true"
                  className="inline-block h-3 w-3 rounded-full border border-subtle"
                  style={estiloColor(persona.colorReferencia)}
                />
                {valorTexto(persona.colorReferencia)}
              </dd>
            </div>

            <div className="card-interactiva">
              <dt className="label-ui">Cobra en fecha</dt>
              <dd className="mt-1 font-semibold text-app">
                {persona.cobraEnFecha ? 'Sí' : 'No'}
              </dd>
            </div>

            <div className="card-interactiva sm:col-span-2">
              <dt className="label-ui">Tiene ingreso extra</dt>
              <dd className="mt-1 font-semibold text-app">
                {persona.tieneIngresoExtra ? 'Sí' : 'No'}
              </dd>
            </div>
          </dl>
        </div>

        <div>
          <h3 className="label-ui">
            Observación rápida
          </h3>

          <p className="surface-inset mt-2 text-sm">
            {valorTexto(persona.observacionRapida)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-subtle pt-4">
          <button
            type="button"
            onClick={onEditar}
            className="boton-principal px-3 py-2"
          >
            Editar
          </button>

          <button
            type="button"
            onClick={onDarDeBaja}
            disabled={!persona.activo || deshabilitarBaja}
            className="boton-secundario px-3 py-2"
          >
            {deshabilitarBaja ? 'Procesando...' : 'Dar de baja'}
          </button>
        </div>
      </section>

      <PersonaLegajoPanel personaId={persona.id} />
    </div>
  );
}