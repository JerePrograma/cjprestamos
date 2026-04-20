type StatusTone = 'success' | 'neutral' | 'warning' | 'danger';

type StatusPillProps = {
  texto: string;
  tone?: StatusTone;
};

const estilosPorTone: Record<StatusTone, string> = {
  success:
    'border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200',
  neutral: 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200',
  warning: 'border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
  danger: 'border-red-200 bg-red-100 text-red-700 dark:border-red-700 dark:bg-red-900/40 dark:text-red-200',
};

export function StatusPill({ texto, tone = 'neutral' }: StatusPillProps) {
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${estilosPorTone[tone]}`}>{texto}</span>;
}
