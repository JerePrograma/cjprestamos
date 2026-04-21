type StatusTone = 'success' | 'neutral' | 'warning' | 'danger';

type StatusPillProps = {
  texto: string;
  tone?: StatusTone;
};

const estilosPorTone: Record<StatusTone, string> = {
  success:
    'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200',
  neutral: 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200',
  warning: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200',
  danger: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200',
};

export function StatusPill({ texto, tone = 'neutral' }: StatusPillProps) {
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${estilosPorTone[tone]}`}>{texto}</span>;
}
