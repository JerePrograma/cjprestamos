import { Link } from 'react-router-dom';
import { Button, ButtonLink } from './Button';

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
  const variante = accion.variante ?? 'secundario';

  if (accion.to) {
    return (
      <ButtonLink to={accion.to} variante={variante}>
        {accion.etiqueta}
      </ButtonLink>
    );
  }

  return (
    <Button type="button" onClick={accion.onClick} variante={variante}>
      {accion.etiqueta}
    </Button>
  );
}

export function PageHeader({
  titulo,
  descripcion,
  breadcrumbs = [],
  acciones = [],
  estados = [],
}: PageHeaderProps) {
  return (
    <header className="panel-elevado space-y-5 p-5 sm:p-6">
      {breadcrumbs.length > 0 && (
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-1.5 text-xs text-muted"
        >
          {breadcrumbs.map((item, index) => {
            const esUltimo = index === breadcrumbs.length - 1;

            return (
              <span
                key={`${item.etiqueta}-${index}`}
                className="inline-flex items-center gap-1.5"
              >
                {item.to && !esUltimo ? (
                  <Link
                    to={item.to}
                    className="font-medium no-underline transition hover:text-app"
                  >
                    {item.etiqueta}
                  </Link>
                ) : (
                  <span className="font-medium text-app">
                    {item.etiqueta}
                  </span>
                )}

                {!esUltimo && (
                  <span aria-hidden="true" className="text-faint">
                    /
                  </span>
                )}
              </span>
            );
          })}
        </nav>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl space-y-2">
          <h1 className="titulo-seccion">
            {titulo}
          </h1>

          <p className="subtitulo-seccion">
            {descripcion}
          </p>
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
            <div key={estado.etiqueta} className="surface-inset">
              <p className="label-ui">
                {estado.etiqueta}
              </p>

              <p className="mt-1 text-sm font-semibold text-app">
                {estado.valor}
              </p>
            </div>
          ))}
        </div>
      )}
    </header>
  );
}
