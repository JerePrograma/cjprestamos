import { Link } from 'react-router-dom';

type Action = {
  etiqueta: string;
  onClick?: () => void;
  to?: string;
  variante?: 'principal' | 'secundario';
};

type Estado = {
  etiqueta: string;
  valor: string;
};

type Breadcrumb = {
  etiqueta: string;
  to?: string;
};

type PageHeaderProps = {
  titulo: string;
  descripcion: string;
  breadcrumbs?: Breadcrumb[];
  acciones?: Action[];
  estados?: Estado[];
};

function BotonAccion({ accion }: { accion: Action }) {
  const className = accion.variante === 'principal' ? 'boton-principal' : 'boton-secundario';

  if (accion.to) {
    return (
      <Link to={accion.to} className={className}>
        {accion.etiqueta}
      </Link>
    );
  }

  return (
    <button type="button" onClick={accion.onClick} className={className}>
      {accion.etiqueta}
    </button>
  );
}

export function PageHeader({ titulo, descripcion, breadcrumbs = [], acciones = [], estados = [] }: PageHeaderProps) {
  return (
    <header className="panel space-y-5 p-5 sm:p-6">
      {breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          {breadcrumbs.map((item, index) => (
            <span key={`${item.etiqueta}-${index}`} className="inline-flex items-center gap-1.5">
              {item.to ? (
                <Link to={item.to} className="font-medium transition hover:text-slate-800 dark:hover:text-slate-200">
                  {item.etiqueta}
                </Link>
              ) : (
                <span className="text-slate-800 dark:text-slate-200">{item.etiqueta}</span>
              )}
              {index < breadcrumbs.length - 1 && <span>/</span>}
            </span>
          ))}
        </nav>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl space-y-2">
          <h1 className="titulo-seccion">{titulo}</h1>
          <p className="subtitulo-seccion">{descripcion}</p>
        </div>
        {acciones.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {acciones.map((accion) => (
              <BotonAccion key={accion.etiqueta} accion={accion} />
            ))}
          </div>
        )}
      </div>

      {estados.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {estados.map((estado) => (
            <div key={estado.etiqueta} className="panel-soft rounded-xl px-3 py-2.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{estado.etiqueta}</p>
              <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{estado.valor}</p>
            </div>
          ))}
        </div>
      )}
    </header>
  );
}
