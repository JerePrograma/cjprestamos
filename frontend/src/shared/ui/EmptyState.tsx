import { Button } from './Button';

type EmptyStateProps = {
  titulo: string;
  descripcion: string;
  accion?: {
    etiqueta: string;
    onClick: () => void;
  };
};

export function EmptyState({ titulo, descripcion, accion }: EmptyStateProps) {
  return (
    <div className="panel-muted border-dashed px-5 py-8 text-center">
      <div
        aria-hidden="true"
        className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-app bg-surface-raised shadow-app-xs"
      >
        <span className="h-2.5 w-2.5 rounded-full bg-sky-400 shadow-lg shadow-sky-400/30" />
      </div>

      <p className="text-sm font-semibold text-app">
        {titulo}
      </p>

      <p className="mx-auto mt-1 max-w-md text-sm text-soft">
        {descripcion}
      </p>

      {accion && (
        <Button type="button" className="mt-4" onClick={accion.onClick}>
          {accion.etiqueta}
        </Button>
      )}
    </div>
  );
}
