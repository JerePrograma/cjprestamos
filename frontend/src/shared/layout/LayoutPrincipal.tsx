import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/auth';
import { Button } from '../ui/Button';

type ItemNavegacion = {
  to: string;
  etiqueta: string;
  descripcion: string;
};

type Tema = 'claro' | 'oscuro';

const itemsNavegacion: ItemNavegacion[] = [
  { to: '/', etiqueta: 'Dashboard', descripcion: 'Control general y accesos rápidos' },
  { to: '/control-caja', etiqueta: 'Control de caja', descripcion: 'Caja, inversión, ganancias y proyecciones' },
  { to: '/personas', etiqueta: 'Personas', descripcion: 'Registro y libreta operativa' },
  { to: '/prestamos', etiqueta: 'Préstamos', descripcion: 'Alta, cuotas, pagos y seguimiento' },
  { to: '/simulador', etiqueta: 'Simulador', descripcion: 'Estimación de cuotas y descarga PDF' },
  { to: '/legajos', etiqueta: 'Legajos', descripcion: 'Información contextual y adjuntos' },
];

const accesosRapidos = [
  { etiqueta: 'Control de caja', to: '/control-caja' },
  { etiqueta: 'Nueva persona', to: '/personas' },
  { etiqueta: 'Nuevo préstamo', to: '/prestamos?alta=1&vista=workspace' },
  { etiqueta: 'Simular préstamo', to: '/simulador' },
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
      <header className="sticky top-0 z-30 border-b border-subtle bg-surface-raised/95 backdrop-blur">
        <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-4 lg:grid-cols-[1fr_auto_auto] lg:items-center">
          <div>
            <Link to="/" className="text-lg font-semibold text-app no-underline">
              cjprestamos · Sistema interno
            </Link>
            <p className="text-xs text-muted">Operación manual-first con foco en claridad y control.</p>
          </div>

          <form onSubmit={ejecutarBusquedaGlobal} className="w-full lg:w-auto">
            <label className="sr-only" htmlFor="busqueda-global">
              Búsqueda global por persona
            </label>
            <div className="flex items-center gap-2">
              <input
                id="busqueda-global"
                value={busquedaGlobal}
                onChange={(event) => setBusquedaGlobal(event.target.value)}
                placeholder="Buscar por nombre, alias o teléfono"
                className="w-full lg:w-80"
              />
              <Button type="submit" className="px-3 py-2 text-xs sm:text-sm">
                Buscar
              </Button>
            </div>
          </form>

          <div className="flex items-center justify-end gap-2 sm:gap-3">
            <Button type="button" onClick={alternarTema} className="px-3 py-2 text-xs sm:text-sm" aria-label="Cambiar modo de color">
              {tema === 'oscuro' ? 'Modo claro' : 'Modo oscuro'}
            </Button>
            <Button
              type="button"
              onClick={() => setMenuAbierto((actual) => !actual)}
              className="p-2 lg:hidden"
              aria-label="Abrir menú de navegación"
              aria-expanded={menuAbierto}
            >
              Menú
            </Button>
            <Button type="button" onClick={cerrarSesion} className="px-3 py-2 text-xs sm:text-sm">
              Cerrar sesión
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-5 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-6 lg:py-7">
        <aside className={`panel p-4 ${menuAbierto ? 'block' : 'hidden'} lg:sticky lg:top-[92px] lg:block lg:h-fit`}>
          <div className="surface-inset mb-4 px-3 py-2 text-xs">
            Operadora activa: <span className="font-semibold text-app">{sesion?.usuario}</span>
          </div>

          <nav className="grid gap-2" aria-label="Navegación principal" onClick={() => setMenuAbierto(false)}>
            {itemsNavegacion.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  isActive ? 'nav-item nav-item-active' : 'nav-item'
                }
              >
                <p className="font-semibold">{item.etiqueta}</p>
                <p className="mt-1 text-xs opacity-80">{item.descripcion}</p>
              </NavLink>
            ))}
          </nav>

          <div className="surface-inset mt-5 p-3.5">
            <p className="label-ui">Atajos operativos</p>
            <div className="mt-2 grid gap-1.5">
              {accesosRapidos.map((acceso) => (
                <Link key={acceso.etiqueta} to={acceso.to} className="card-interactiva px-2.5 py-2 text-xs font-medium">
                  {acceso.etiqueta}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        <main className="space-y-4 lg:space-y-5">
          {moduloActual && (
            <section className="panel-soft rounded-lg px-4 py-3 text-xs text-soft">
              Módulo activo: <span className="font-semibold text-app">{moduloActual.etiqueta}</span> · {moduloActual.descripcion}
            </section>
          )}
          <section className="panel min-h-[70vh] p-5 sm:p-6">
            <Outlet />
          </section>
        </main>
      </div>
    </div>
  );
}
