import { Button } from './Button';

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
        <Button type="button" onClick={onRetry} variante="fantasma" className="mt-0 px-2.5 py-1.5 text-xs">
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
