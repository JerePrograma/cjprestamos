import { Link, NavLink, Outlet } from 'react-router-dom';

const itemsNavegacion = [
  { to: '/', etiqueta: 'Dashboard' },
  { to: '/personas', etiqueta: 'Personas' },
  { to: '/prestamos', etiqueta: 'Préstamos' },
];

export function LayoutPrincipal() {
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link to="/" className="text-lg font-semibold text-slate-900">
            Sistema interno de préstamos
          </Link>
          <span className="text-sm text-slate-500">Operación manual-first</span>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-4 md:grid-cols-[220px_1fr]">
        <aside className="rounded-lg border border-slate-200 bg-white p-3">
          <nav className="space-y-1">
            {itemsNavegacion.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `block rounded px-3 py-2 text-sm ${
                    isActive ? 'bg-slate-800 text-white' : 'text-slate-700 hover:bg-slate-100'
                  }`
                }
              >
                {item.etiqueta}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="rounded-lg border border-slate-200 bg-white p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
