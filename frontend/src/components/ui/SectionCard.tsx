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
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 sm:text-base dark:text-slate-100">{titulo}</h2>
          {descripcion && <p className="mt-0.5 text-xs text-slate-500 sm:text-sm dark:text-slate-400">{descripcion}</p>}
        </div>
        {acciones}
      </header>
      {children}
    </section>
  );
}
