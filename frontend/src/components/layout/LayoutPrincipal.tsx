import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../app/auth";

const itemsNavegacion = [
  { to: "/", etiqueta: "Dashboard" },
  { to: "/personas", etiqueta: "Personas" },
  { to: "/prestamos", etiqueta: "Préstamos" },
  { to: "/legajos", etiqueta: "Legajos" },
];

export function LayoutPrincipal() {
  const { sesion, cerrarSesion } = useAuth();
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <div className="min-h-screen bg-transparent">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <div>
            <Link to="/" className="text-base font-semibold text-slate-900 sm:text-lg">
              Sistema interno de préstamos
            </Link>
            <p className="hidden text-xs text-slate-500 sm:block">
              Operación manual y control económico claro.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden max-w-[240px] truncate text-sm text-slate-500 sm:block">
              Operadora: {sesion?.usuario}
            </span>
            <button
              type="button"
              onClick={() => setMenuAbierto((actual) => !actual)}
              className="boton-secundario p-2 lg:hidden"
              aria-label="Abrir menú de navegación"
              aria-expanded={menuAbierto}
            >
              ☰
            </button>
            <button
              type="button"
              onClick={cerrarSesion}
              className="boton-secundario px-3 py-1.5 text-xs sm:text-sm"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-4 lg:grid-cols-[250px_minmax(0,1fr)] lg:py-6">
        <aside className={`panel p-2 lg:p-3 ${menuAbierto ? "block" : "hidden"} lg:block`}>
          <p className="mb-2 px-2 text-xs text-slate-500 sm:hidden">Operadora: {sesion?.usuario}</p>
          <nav
            className="grid gap-1"
            aria-label="Navegación principal"
            onClick={() => setMenuAbierto(false)}
          >
            {itemsNavegacion.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm transition ${
                    isActive ? "bg-slate-800 text-white" : "text-slate-700 hover:bg-slate-100"
                  }`
                }
              >
                {item.etiqueta}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="panel min-h-[70vh] p-4 sm:p-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
