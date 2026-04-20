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
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center">
      <p className="text-sm font-semibold text-slate-800">{titulo}</p>
      <p className="mt-1 text-sm text-slate-600">{descripcion}</p>
      {accion && (
        <button type="button" className="boton-secundario mt-3" onClick={accion.onClick}>
          {accion.etiqueta}
        </button>
      )}
    </div>
  );
}
