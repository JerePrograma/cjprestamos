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
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-7 text-center dark:border-slate-600 dark:bg-slate-800/70">
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{titulo}</p>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{descripcion}</p>
      {accion && (
        <button type="button" className="boton-secundario mt-4" onClick={accion.onClick}>
          {accion.etiqueta}
        </button>
      )}
    </div>
  );
}
