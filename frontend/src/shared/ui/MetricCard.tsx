import type { ReactNode } from 'react';

type MetricTone = 'info' | 'success' | 'warning' | 'danger' | 'neutral';

type MetricCardProps = {
  titulo: string;
  descripcion: string;
  tone?: MetricTone;
  children: ReactNode;
  cargando?: boolean;
};

export function MetricCard({
  titulo,
  descripcion,
  tone = 'neutral',
  children,
  cargando = false,
}: MetricCardProps) {
  return (
    <article data-tone={tone} className="metric-card" aria-busy={cargando}>
      <div className="relative">
        <div className="flex items-center gap-2">
          <span aria-hidden="true" data-tone={tone} className="metric-dot" />
          <h2 className="metric-title">{titulo}</h2>
        </div>

        <p className="metric-value">
          {cargando ? (
            <span className="inline-block h-8 w-28 animate-pulse rounded-md bg-slate-200 dark:bg-slate-700" />
          ) : (
            children
          )}
        </p>

        <p className="metric-description">{descripcion}</p>
      </div>
    </article>
  );
}
