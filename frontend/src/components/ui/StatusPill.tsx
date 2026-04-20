type StatusTone = 'success' | 'neutral' | 'warning' | 'danger';

type StatusPillProps = {
  texto: string;
  tone?: StatusTone;
};

const estilosPorTone: Record<StatusTone, string> = {
  success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  warning: 'bg-amber-100 text-amber-800 border-amber-200',
  danger: 'bg-red-100 text-red-700 border-red-200',
};

export function StatusPill({ texto, tone = 'neutral' }: StatusPillProps) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${estilosPorTone[tone]}`}>
      {texto}
    </span>
  );
}
