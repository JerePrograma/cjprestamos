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
    <section className={suave ? 'panel-soft p-4 sm:p-5' : 'panel p-4 sm:p-5'}>
      <header className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 sm:text-base">{titulo}</h2>
          {descripcion && <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">{descripcion}</p>}
        </div>
        {acciones}
      </header>
      {children}
    </section>
  );
}
