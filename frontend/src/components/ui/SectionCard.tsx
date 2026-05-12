import type { ReactNode } from 'react';

type SectionCardProps = {
  titulo: string;
  descripcion?: string;
  acciones?: ReactNode;
  children: ReactNode;
  suave?: boolean;
};

export function SectionCard({
  titulo,
  descripcion,
  acciones,
  children,
  suave = false,
}: SectionCardProps) {
  return (
    <section className={suave ? 'panel-soft p-5 sm:p-6' : 'panel p-5 sm:p-6'}>
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-subtle pb-3">
        <div className="min-w-0 space-y-1">
          <h2 className="text-base font-semibold text-app">
            {titulo}
          </h2>

          {descripcion && (
            <p className="max-w-2xl text-sm text-soft">
              {descripcion}
            </p>
          )}
        </div>

        {acciones && (
          <div className="shrink-0">
            {acciones}
          </div>
        )}
      </header>

      {children}
    </section>
  );
}