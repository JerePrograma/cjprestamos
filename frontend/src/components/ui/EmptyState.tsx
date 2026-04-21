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
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 px-5 py-8 text-center dark:border-slate-700 dark:bg-slate-900/70">
      <div className="mx-auto mb-3 h-10 w-10 rounded-full border border-slate-300 bg-white/80 dark:border-slate-700 dark:bg-slate-800" />
      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{titulo}</p>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{descripcion}</p>
      {accion && (
        <button type="button" className="boton-secundario mt-4" onClick={accion.onClick}>
          {accion.etiqueta}
        </button>
      )}
    </div>
  );
}
