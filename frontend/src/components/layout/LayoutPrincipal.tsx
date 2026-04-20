import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/auth';

type ItemNavegacion = {
  to: string;
  etiqueta: string;
  descripcion: string;
};

type Tema = 'claro' | 'oscuro';

const itemsNavegacion: ItemNavegacion[] = [
  { to: '/', etiqueta: 'Dashboard', descripcion: 'Control general y accesos rápidos' },
  { to: '/personas', etiqueta: 'Personas', descripcion: 'Registro y libreta operativa' },
  { to: '/prestamos', etiqueta: 'Préstamos', descripcion: 'Alta, cuotas, pagos y seguimiento' },
  { to: '/legajos', etiqueta: 'Legajos', descripcion: 'Información contextual y adjuntos' },
];

const accesosRapidos = [
  { etiqueta: 'Nueva persona', to: '/personas' },
  { etiqueta: 'Nuevo préstamo', to: '/prestamos?alta=1&vista=workspace' },
  { etiqueta: 'Ir a legajos', to: '/legajos' },
];

function leerTemaInicial(): Tema {
  if (typeof window === 'undefined') {
    return 'claro';
  }

  const temaGuardado = window.localStorage.getItem('tema-ui');
  if (temaGuardado === 'claro' || temaGuardado === 'oscuro') {
    return temaGuardado;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro';
}

export function LayoutPrincipal() {
  const { sesion, cerrarSesion } = useAuth();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [busquedaGlobal, setBusquedaGlobal] = useState('');
  const [tema, setTema] = useState<Tema>(leerTemaInicial);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const raiz = document.documentElement;
    raiz.classList.toggle('dark', tema === 'oscuro');
    window.localStorage.setItem('tema-ui', tema);
  }, [tema]);

  const moduloActual = useMemo(
    () => itemsNavegacion.find((item) => (item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to))),
    [location.pathname],
  );

  const ejecutarBusquedaGlobal = (event: FormEvent) => {
    event.preventDefault();
    const termino = busquedaGlobal.trim();

    if (!termino) {
      return;
    }

    navigate(`/personas?q=${encodeURIComponent(termino)}`);
    setMenuAbierto(false);
  };

  const alternarTema = () => setTema((actual) => (actual === 'claro' ? 'oscuro' : 'claro'));

  return (
    <div className="min-h-screen bg-transparent">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur transition-colors duration-300 dark:border-slate-700/80 dark:bg-slate-950/95">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div>
            <Link to="/" className="text-base font-semibold text-slate-900 sm:text-lg dark:text-slate-100">
              Sistema interno de préstamos
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400">Operación manual-first con foco en claridad y control.</p>
          </div>

          <form onSubmit={ejecutarBusquedaGlobal} className="order-3 w-full sm:order-none sm:w-auto">
            <label className="sr-only" htmlFor="busqueda-global">
              Búsqueda global por persona
            </label>
            <div className="flex items-center gap-2">
              <input
                id="busqueda-global"
                value={busquedaGlobal}
                onChange={(event) => setBusquedaGlobal(event.target.value)}
                placeholder="Buscar persona por nombre, alias o teléfono"
                className="w-full px-3 py-2 text-sm sm:w-80"
              />
              <button type="submit" className="boton-secundario px-3 py-2 text-xs sm:text-sm">
                Buscar
              </button>
            </div>
          </form>

          <div className="flex items-center gap-2 sm:gap-3">
            <button type="button" onClick={alternarTema} className="boton-secundario px-3 py-1.5 text-xs sm:text-sm" aria-label="Cambiar modo de color">
              {tema === 'oscuro' ? '☀️ Modo claro' : '🌙 Modo oscuro'}
            </button>
            <span className="hidden max-w-[240px] truncate text-sm text-slate-500 dark:text-slate-400 lg:block">Operadora: {sesion?.usuario}</span>
            <button
              type="button"
              onClick={() => setMenuAbierto((actual) => !actual)}
              className="boton-secundario p-2 lg:hidden"
              aria-label="Abrir menú de navegación"
              aria-expanded={menuAbierto}
            >
              ☰
            </button>
            <button type="button" onClick={cerrarSesion} className="boton-secundario px-3 py-1.5 text-xs sm:text-sm">
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-5 lg:grid-cols-[290px_minmax(0,1fr)] lg:gap-6 lg:py-7">
        <aside className={`panel p-4 ${menuAbierto ? 'block' : 'hidden'} lg:sticky lg:top-[98px] lg:block lg:h-fit`}>
          <p className="mb-4 px-1 text-xs text-slate-500 dark:text-slate-400 lg:hidden">Operadora: {sesion?.usuario}</p>
          <nav className="grid gap-1.5" aria-label="Navegación principal" onClick={() => setMenuAbierto(false)}>
            {itemsNavegacion.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `rounded-xl border px-3 py-3 text-sm transition ${
                    isActive
                      ? 'border-slate-900 bg-slate-900 text-white dark:border-sky-400 dark:bg-sky-500 dark:text-slate-950'
                      : 'border-transparent text-slate-700 hover:border-slate-200 hover:bg-slate-50 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800'
                  }`
                }
              >
                <p className="font-semibold">{item.etiqueta}</p>
                <p className="mt-0.5 text-xs opacity-80">{item.descripcion}</p>
              </NavLink>
            ))}
          </nav>

          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-700 dark:bg-slate-800/70">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">Atajos operativos</p>
            <div className="mt-2 grid gap-1">
              {accesosRapidos.map((acceso) => (
                <Link
                  key={acceso.etiqueta}
                  to={acceso.to}
                  className="rounded-md px-2 py-1.5 text-xs text-slate-700 transition hover:bg-white dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  {acceso.etiqueta}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        <main className="space-y-4 lg:space-y-5">
          {moduloActual && (
            <section className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600 shadow-sm transition-colors duration-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
              Módulo activo: <span className="font-semibold text-slate-900 dark:text-slate-100">{moduloActual.etiqueta}</span> · {moduloActual.descripcion}
            </section>
          )}
          <section className="min-h-[70vh] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors duration-300 sm:p-6 dark:border-slate-700 dark:bg-slate-900 dark:shadow-none">
            <Outlet />
          </section>
        </main>
      </div>
    </div>
  );
}
