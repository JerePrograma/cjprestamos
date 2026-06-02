export function LoadingState({ mensaje }: { mensaje: string }) {
  return (
    <p aria-live="polite" className="text-sm text-muted">
      {mensaje}
    </p>
  );
}
