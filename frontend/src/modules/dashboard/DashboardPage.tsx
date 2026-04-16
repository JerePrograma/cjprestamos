const indicadores = [
  { titulo: 'Monto invertido', valor: '-' },
  { titulo: 'Monto ganado', valor: '-' },
  { titulo: 'Monto por ganar', valor: '-' },
  { titulo: 'Deuda total', valor: '-' },
  { titulo: 'Préstamos activos', valor: '-' },
];

export function DashboardPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
      <p className="text-sm text-slate-600">
        Vista inicial del MVP. Aquí se mostrarán los indicadores económicos principales.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {indicadores.map((indicador) => (
          <article key={indicador.titulo} className="rounded-md border border-slate-200 p-3">
            <h2 className="text-sm text-slate-600">{indicador.titulo}</h2>
            <p className="mt-1 text-xl font-semibold text-slate-900">{indicador.valor}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
