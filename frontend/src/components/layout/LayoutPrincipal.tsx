import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../app/auth';

const itemsNavegacion = [
  { to: '/', etiqueta: 'Dashboard' },
  { to: '/personas', etiqueta: 'Personas' },
  { to: '/prestamos', etiqueta: 'Préstamos' },
];

export function LayoutPrincipal() {
  const { sesion, cerrarSesion } = useAuth();

  return (
    <div className="min-h-screen bg-transparent">
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link to="/" className="text-base font-semibold text-slate-900 sm:text-lg">
              Sistema interno de préstamos
            </Link>
            <p className="text-xs text-slate-500">Operación manual y control económico claro.</p>
          </div>

          <div className="flex items-center justify-between gap-3 text-sm text-slate-500 sm:justify-end">
            <span className="truncate">Operadora: {sesion?.usuario}</span>
            <button type="button" onClick={cerrarSesion} className="boton-secundario px-3 py-1.5 text-xs sm:text-sm">
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-4 lg:grid-cols-[240px_1fr] lg:py-6">
        <aside className="panel p-2 lg:p-3">
          <nav className="flex gap-2 overflow-x-auto px-1 py-1 lg:block lg:space-y-1 lg:overflow-visible lg:px-0">
            {itemsNavegacion.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-lg px-3 py-2 text-sm transition ${
                    isActive ? 'bg-slate-800 text-white' : 'text-slate-700 hover:bg-slate-100'
                  }`
                }
              >
                {item.etiqueta}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="panel p-4 sm:p-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
