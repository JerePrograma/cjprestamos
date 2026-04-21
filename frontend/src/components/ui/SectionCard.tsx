import type { ReactNode } from 'react';

type SectionCardProps = {
  titulo: string;
  descripcion?: string;
  acciones?: ReactNode;
  children: ReactNode;
  suave?: boolean;
};

export function SectionCard({ titulo, descripcion, acciones, children, suave = false }: SectionCardProps) {
  return (
    <section className={suave ? 'panel-soft p-5 sm:p-6' : 'panel p-5 sm:p-6'}>
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-slate-200/70 pb-3 dark:border-slate-800/80">
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{titulo}</h2>
          {descripcion && <p className="text-sm text-slate-600 dark:text-slate-300">{descripcion}</p>}
        </div>
        {acciones}
      </header>
      {children}
    </section>
  );
}
