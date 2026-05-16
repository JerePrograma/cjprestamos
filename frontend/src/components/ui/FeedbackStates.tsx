type ErrorStateProps = {
  mensaje: string;
  onRetry?: () => void;
  retryLabel?: string;
};

export function ErrorState({
  mensaje,
  onRetry,
  retryLabel = 'Reintentar',
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="mensaje-error flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
    >
      <span>{mensaje}</span>

      {onRetry && (
        <button type="button" onClick={onRetry} className="link-action mt-0">
          {retryLabel}
        </button>
      )}
    </div>
  );
}

export function LoadingState({ mensaje }: { mensaje: string }) {
  return (
    <p aria-live="polite" className="text-sm text-muted">
      {mensaje}
    </p>
  );
}
