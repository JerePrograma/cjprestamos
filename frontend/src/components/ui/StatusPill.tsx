type StatusTone = 'success' | 'neutral' | 'warning' | 'danger';

type StatusPillProps = {
  texto: string;
  tone?: StatusTone;
};

const estilosPorTone: Record<StatusTone, string> = {
  success: 'badge-success',
  neutral: 'badge-ui',
  warning: 'badge-warning',
  danger: 'badge-error',
};

export function StatusPill({ texto, tone = 'neutral' }: StatusPillProps) {
  return (
    <span className={estilosPorTone[tone]}>
      {texto}
    </span>
  );
}