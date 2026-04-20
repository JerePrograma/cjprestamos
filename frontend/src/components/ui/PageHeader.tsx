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
    <header className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      {breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-xs text-slate-500">
          {breadcrumbs.map((item, index) => (
            <span key={`${item.etiqueta}-${index}`} className="inline-flex items-center gap-1">
              {item.to ? (
                <Link to={item.to} className="hover:text-slate-700">
                  {item.etiqueta}
                </Link>
              ) : (
                <span className="text-slate-700">{item.etiqueta}</span>
              )}
              {index < breadcrumbs.length - 1 && <span>/</span>}
            </span>
          ))}
        </nav>
      )}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="titulo-seccion">{titulo}</h1>
          <p className="subtitulo-seccion max-w-3xl">{descripcion}</p>
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
        <div className="flex flex-wrap items-center gap-2">
          {estados.map((estado) => (
            <span
              key={estado.etiqueta}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700"
            >
              <strong className="font-semibold text-slate-900">{estado.valor}</strong>
              <span>{estado.etiqueta}</span>
            </span>
          ))}
        </div>
      )}
    </header>
  );
}
