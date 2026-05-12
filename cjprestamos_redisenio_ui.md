
# Rediseño UI completo para `cjprestamos`

## Diagnóstico rápido

La base del proyecto ya es razonable: React + TypeScript + Vite + Tailwind, rutas claras para `dashboard`, `personas`, `prestamos` y `legajos`, y varios componentes compartidos existentes. El problema no es de estructura sino de **lenguaje visual**: hoy se ve correcto, pero todavía no tiene identidad de producto.  
La estrategia correcta no es rehacer todo desde cero, sino **subir mucho la calidad desde el sistema visual compartido** y luego tocar las pantallas más expuestas.

## Qué vas a cambiar

### Reemplazar archivos
- `frontend/src/styles.css`
- `frontend/src/components/layout/LayoutPrincipal.tsx`
- `frontend/src/components/ui/PageHeader.tsx`
- `frontend/src/components/ui/SectionCard.tsx`
- `frontend/src/components/ui/EmptyState.tsx`
- `frontend/src/components/ui/StatusPill.tsx`
- `frontend/src/modules/dashboard/DashboardPage.tsx`
- `frontend/src/modules/auth/LoginPage.tsx`
- `frontend/src/modules/personas/PersonasPage.tsx`
- `frontend/src/modules/prestamos/PrestamosPage.tsx`
- `frontend/src/modules/legajos/LegajosPage.tsx`
- `frontend/src/modules/personas/components/PersonaFormulario.tsx`
- `frontend/src/modules/prestamos/components/PrestamoAltaPanel.tsx`
- `frontend/src/modules/prestamos/components/PrestamosListadoPanel.tsx`

### Crear archivo nuevo
- `frontend/src/components/ui/KpiCard.tsx`

---

## 1) `frontend/src/styles.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    color-scheme: light;
  }

  :root.dark {
    color-scheme: dark;
  }

  * {
    @apply border-slate-200 dark:border-slate-800;
  }

  html {
    @apply scroll-smooth;
  }

  body {
    @apply min-h-screen bg-slate-100 text-slate-800 antialiased transition-colors duration-300;
    background-image:
      radial-gradient(circle at top left, rgba(15, 23, 42, 0.07), transparent 30%),
      radial-gradient(circle at top right, rgba(59, 130, 246, 0.08), transparent 28%),
      linear-gradient(to bottom, rgba(255, 255, 255, 0.92), rgba(248, 250, 252, 0.98));
  }

  :root.dark body {
    @apply bg-slate-950 text-slate-100;
    background-image:
      radial-gradient(circle at top left, rgba(56, 189, 248, 0.09), transparent 26%),
      radial-gradient(circle at top right, rgba(99, 102, 241, 0.12), transparent 30%),
      linear-gradient(to bottom, rgba(2, 6, 23, 0.97), rgba(3, 7, 18, 1));
  }

  ::selection {
    @apply bg-slate-900 text-white dark:bg-sky-300 dark:text-slate-950;
  }

  h1,
  h2,
  h3,
  h4 {
    @apply tracking-tight;
  }

  input:not([type='checkbox']):not([type='radio']):not([type='color']),
  select,
  textarea {
    @apply w-full rounded-2xl border border-slate-200 bg-white/90 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition duration-200 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-200/70 dark:border-slate-700 dark:bg-slate-900/85 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-500 dark:focus:ring-slate-800/80;
  }

  input[type='color'] {
    @apply rounded-2xl border border-slate-200 bg-white shadow-sm transition dark:border-slate-700 dark:bg-slate-900;
  }

  input[type='checkbox'],
  input[type='radio'] {
    @apply h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400 dark:border-slate-600 dark:bg-slate-900 dark:text-sky-300 dark:focus:ring-slate-600;
  }

  button:focus-visible,
  a:focus-visible {
    @apply outline-none ring-2 ring-slate-400 ring-offset-2 ring-offset-slate-100 dark:ring-sky-300 dark:ring-offset-slate-950;
  }
}

@layer components {
  .panel {
    @apply rounded-[28px] border border-white/70 bg-white/88 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-md transition-colors duration-300 dark:border-white/10 dark:bg-slate-900/78 dark:shadow-[0_20px_60px_rgba(2,6,23,0.45)];
  }

  .panel-soft {
    @apply rounded-[24px] border border-slate-200/80 bg-slate-50/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900/60;
  }

  .surface-muted {
    @apply rounded-[22px] border border-slate-200/80 bg-slate-50/90 dark:border-slate-800 dark:bg-slate-900/55;
  }

  .helper-kicker {
    @apply inline-flex items-center rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:border-slate-700 dark:bg-slate-900/75 dark:text-slate-400;
  }

  .titulo-seccion {
    @apply text-2xl font-semibold text-slate-950 sm:text-3xl dark:text-white;
  }

  .subtitulo-seccion {
    @apply max-w-3xl text-sm leading-6 text-slate-600 sm:text-[15px] dark:text-slate-400;
  }

  .boton-principal {
    @apply inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(15,23,42,0.16)] transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-sky-300 dark:text-slate-950 dark:hover:bg-sky-200;
  }

  .boton-secundario {
    @apply inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900/85 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-900;
  }

  .boton-fantasma {
    @apply inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white;
  }

  .label {
    @apply block text-sm font-medium text-slate-700 dark:text-slate-200;
  }

  .hint {
    @apply text-xs leading-5 text-slate-500 dark:text-slate-400;
  }

  .field {
    @apply mt-1;
  }

  .field-sm {
    @apply rounded-xl px-3 py-2 text-sm;
  }

  .alert-danger {
    @apply rounded-2xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300;
  }

  .alert-success {
    @apply rounded-2xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/35 dark:text-emerald-300;
  }

  .alert-info {
    @apply rounded-2xl border border-sky-200 bg-sky-50 px-3.5 py-3 text-sm text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/35 dark:text-sky-300;
  }

  .checkbox-tile {
    @apply flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800;
  }

  .list-row {
    @apply w-full rounded-2xl border border-slate-200 bg-white/90 px-3.5 py-3 text-left text-sm shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white dark:border-slate-700 dark:bg-slate-900/85 dark:hover:border-slate-600 dark:hover:bg-slate-900;
  }

  .segmented-shell {
    @apply grid gap-1 rounded-2xl border border-slate-200 bg-slate-50/90 p-1 dark:border-slate-700 dark:bg-slate-900/80;
  }

  .segmented-item {
    @apply rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white;
  }

  .segmented-item-active {
    @apply bg-slate-900 text-white shadow-sm dark:bg-sky-300 dark:text-slate-950;
  }

  .soft-divider {
    @apply border-t border-slate-200/80 dark:border-slate-800;
  }

  .card-title {
    @apply text-sm font-semibold text-slate-900 dark:text-slate-100;
  }

  .card-description {
    @apply text-sm leading-6 text-slate-500 dark:text-slate-400;
  }
}
```

---

## 2) `frontend/src/components/ui/KpiCard.tsx` (nuevo)

```tsx
type KpiCardProps = {
  titulo: string;
  valor: string;
  descripcion: string;
  destacado?: boolean;
};

export function KpiCard({
  titulo,
  valor,
  descripcion,
  destacado = false,
}: KpiCardProps) {
  return (
    <article
      className={`panel relative overflow-hidden p-4 sm:p-5 ${
        destacado ? "ring-1 ring-slate-200 dark:ring-slate-700" : ""
      }`}
    >
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-slate-900 via-sky-500 to-slate-900 dark:from-sky-300 dark:via-indigo-300 dark:to-sky-300" />
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
        {titulo}
      </p>
      <p className="mt-3 text-2xl font-semibold text-slate-950 sm:text-3xl dark:text-white">
        {valor}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
        {descripcion}
      </p>
    </article>
  );
}
```

---

## 3) `frontend/src/components/ui/StatusPill.tsx`

```tsx
type StatusTone = "success" | "neutral" | "warning" | "danger";

type StatusPillProps = {
  texto: string;
  tone?: StatusTone;
};

const estilosPorTone: Record<StatusTone, string> = {
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/35 dark:text-emerald-300",
  neutral:
    "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
  warning:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/35 dark:text-amber-300",
  danger:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/35 dark:text-red-300",
};

export function StatusPill({
  texto,
  tone = "neutral",
}: StatusPillProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${estilosPorTone[tone]}`}
    >
      {texto}
    </span>
  );
}
```

---

## 4) `frontend/src/components/ui/EmptyState.tsx`

```tsx
type EmptyStateProps = {
  titulo: string;
  descripcion: string;
  accion?: {
    etiqueta: string;
    onClick: () => void;
  };
};

export function EmptyState({
  titulo,
  descripcion,
  accion,
}: EmptyStateProps) {
  return (
    <div className="panel-soft border-dashed px-5 py-8 text-center sm:px-7 sm:py-10">
      <div className="mx-auto mb-4 h-12 w-12 rounded-2xl bg-slate-900/6 dark:bg-white/10" />
      <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
        {titulo}
      </p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
        {descripcion}
      </p>
      {accion && (
        <button
          type="button"
          className="boton-secundario mt-5"
          onClick={accion.onClick}
        >
          {accion.etiqueta}
        </button>
      )}
    </div>
  );
}
```

---

## 5) `frontend/src/components/ui/SectionCard.tsx`

```tsx
import type { ReactNode } from "react";

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
    <section className={suave ? "panel-soft p-5 sm:p-6" : "panel p-5 sm:p-6"}>
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="card-title">{titulo}</h2>
          {descripcion && <p className="card-description">{descripcion}</p>}
        </div>
        {acciones}
      </header>
      {children}
    </section>
  );
}
```

---

## 6) `frontend/src/components/ui/PageHeader.tsx`

```tsx
import { Link } from "react-router-dom";

type Action = {
  etiqueta: string;
  onClick?: () => void;
  to?: string;
  variante?: "principal" | "secundario";
};

type Estado = {
  etiqueta: string;
  valor: string;
};

type Breadcrumb = {
  etiqueta: string;
  to?: string;
};

type PageHeaderProps = {
  titulo: string;
  descripcion: string;
  breadcrumbs?: Breadcrumb[];
  acciones?: Action[];
  estados?: Estado[];
};

function BotonAccion({ accion }: { accion: Action }) {
  const className =
    accion.variante === "principal" ? "boton-principal" : "boton-secundario";

  if (accion.to) {
    return (
      <Link to={accion.to} className={className}>
        {accion.etiqueta}
      </Link>
    );
  }

  return (
    <button type="button" onClick={accion.onClick} className={className}>
      {accion.etiqueta}
    </button>
  );
}

export function PageHeader({
  titulo,
  descripcion,
  breadcrumbs = [],
  acciones = [],
  estados = [],
}: PageHeaderProps) {
  return (
    <header className="panel relative overflow-hidden p-5 sm:p-6">
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-slate-900 via-sky-500 to-slate-900 dark:from-sky-300 dark:via-indigo-300 dark:to-sky-300" />

      <div className="space-y-5">
        {breadcrumbs.length > 0 && (
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1 text-xs text-slate-500 dark:text-slate-400"
          >
            {breadcrumbs.map((item, index) => (
              <span
                key={`${item.etiqueta}-${index}`}
                className="inline-flex items-center gap-1.5"
              >
                {item.to ? (
                  <Link
                    to={item.to}
                    className="transition hover:text-slate-800 dark:hover:text-slate-200"
                  >
                    {item.etiqueta}
                  </Link>
                ) : (
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {item.etiqueta}
                  </span>
                )}
                {index < breadcrumbs.length - 1 && <span>/</span>}
              </span>
            ))}
          </nav>
        )}

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <span className="helper-kicker">OPERACIÓN INTERNA</span>
            <div className="space-y-1.5">
              <h1 className="titulo-seccion">{titulo}</h1>
              <p className="subtitulo-seccion">{descripcion}</p>
            </div>
          </div>

          {acciones.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {acciones.map((accion) => (
                <BotonAccion key={accion.etiqueta} accion={accion} />
              ))}
            </div>
          )}
        </div>

        {estados.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {estados.map((estado) => (
              <span
                key={estado.etiqueta}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                <strong className="font-semibold text-slate-950 dark:text-white">
                  {estado.valor}
                </strong>
                <span>{estado.etiqueta}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
```

---

## 7) `frontend/src/components/layout/LayoutPrincipal.tsx`

```tsx
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "../../app/auth";

type ItemNavegacion = {
  to: string;
  etiqueta: string;
  descripcion: string;
};

type Tema = "claro" | "oscuro";

const itemsNavegacion: ItemNavegacion[] = [
  {
    to: "/",
    etiqueta: "Dashboard",
    descripcion: "Números clave y accesos rápidos",
  },
  {
    to: "/personas",
    etiqueta: "Personas",
    descripcion: "Registro, búsqueda y libreta operativa",
  },
  {
    to: "/prestamos",
    etiqueta: "Préstamos",
    descripcion: "Alta, cuotas, pagos y seguimiento",
  },
  {
    to: "/legajos",
    etiqueta: "Legajos",
    descripcion: "Notas, contexto y adjuntos",
  },
];

const accesosRapidos = [
  { etiqueta: "Nueva persona", to: "/personas" },
  { etiqueta: "Nuevo préstamo", to: "/prestamos?alta=1&vista=workspace" },
  { etiqueta: "Abrir legajos", to: "/legajos" },
];

function leerTemaInicial(): Tema {
  if (typeof window === "undefined") {
    return "claro";
  }

  const temaGuardado = window.localStorage.getItem("tema-ui");
  if (temaGuardado === "claro" || temaGuardado === "oscuro") {
    return temaGuardado;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "oscuro"
    : "claro";
}

export function LayoutPrincipal() {
  const { sesion, cerrarSesion } = useAuth();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [busquedaGlobal, setBusquedaGlobal] = useState("");
  const [tema, setTema] = useState<Tema>(leerTemaInicial);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const raiz = document.documentElement;
    raiz.classList.toggle("dark", tema === "oscuro");
    window.localStorage.setItem("tema-ui", tema);
  }, [tema]);

  const moduloActual = useMemo(
    () =>
      itemsNavegacion.find((item) =>
        item.to === "/"
          ? location.pathname === "/"
          : location.pathname.startsWith(item.to),
      ),
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

  const alternarTema = () =>
    setTema((actual) => (actual === "claro" ? "oscuro" : "claro"));

  return (
    <div className="min-h-screen bg-transparent">
      <header className="sticky top-0 z-30 border-b border-white/60 bg-white/75 backdrop-blur-xl transition-colors duration-300 dark:border-white/10 dark:bg-slate-950/70">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div className="space-y-1">
            <Link
              to="/"
              className="text-base font-semibold tracking-tight text-slate-950 transition hover:text-slate-700 sm:text-lg dark:text-white dark:hover:text-sky-200"
            >
              CJ Préstamos
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manual-first, clara, rápida y sin ruido visual innecesario.
            </p>
          </div>

          <form
            onSubmit={ejecutarBusquedaGlobal}
            className="order-3 w-full sm:order-none sm:w-auto"
          >
            <label className="sr-only" htmlFor="busqueda-global">
              Búsqueda global por persona
            </label>
            <div className="flex items-center gap-2">
              <input
                id="busqueda-global"
                value={busquedaGlobal}
                onChange={(event) => setBusquedaGlobal(event.target.value)}
                placeholder="Buscar persona por nombre, alias o teléfono"
                className="w-full sm:w-80"
              />
              <button type="submit" className="boton-secundario">
                Buscar
              </button>
            </div>
          </form>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={alternarTema}
              className="boton-secundario px-3 py-2 text-xs sm:text-sm"
              aria-label="Cambiar modo de color"
            >
              {tema === "oscuro" ? "Modo claro" : "Modo oscuro"}
            </button>

            <span className="hidden max-w-[220px] truncate rounded-full border border-slate-200 bg-white/80 px-3 py-2 text-xs font-medium text-slate-600 lg:block dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300">
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
              className="boton-principal px-3 py-2 text-xs sm:text-sm"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-5 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-6 lg:py-7">
        <aside
          className={`panel p-4 ${menuAbierto ? "block" : "hidden"} lg:sticky lg:top-[98px] lg:block lg:h-fit`}
        >
          <div className="space-y-4">
            <div className="panel-soft p-4 lg:hidden">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                Operadora activa
              </p>
              <p className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                {sesion?.usuario}
              </p>
            </div>

            <nav
              className="grid gap-2"
              aria-label="Navegación principal"
              onClick={() => setMenuAbierto(false)}
            >
              {itemsNavegacion.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    `rounded-[22px] border px-4 py-3 text-sm transition ${
                      isActive
                        ? "border-slate-900 bg-slate-900 text-white shadow-sm dark:border-sky-300 dark:bg-sky-300 dark:text-slate-950"
                        : "border-slate-200 bg-white/80 text-slate-700 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-900"
                    }`
                  }
                >
                  <p className="font-semibold">{item.etiqueta}</p>
                  <p className="mt-1 text-xs opacity-80">{item.descripcion}</p>
                </NavLink>
              ))}
            </nav>

            <div className="panel-soft p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                Atajos
              </p>
              <div className="mt-3 grid gap-2">
                {accesosRapidos.map((acceso) => (
                  <Link
                    key={acceso.etiqueta}
                    to={acceso.to}
                    className="rounded-2xl border border-slate-200 bg-white/85 px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-slate-600"
                  >
                    {acceso.etiqueta}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <main className="space-y-4 lg:space-y-5">
          {moduloActual && (
            <section className="panel-soft px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
              <span className="font-semibold text-slate-950 dark:text-white">
                Módulo activo:
              </span>{" "}
              {moduloActual.etiqueta} · {moduloActual.descripcion}
            </section>
          )}

          <section className="min-h-[72vh]">
            <Outlet />
          </section>
        </main>
      </div>
    </div>
  );
}
```

---

## 8) `frontend/src/modules/dashboard/DashboardPage.tsx`

```tsx
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "../../components/ui/EmptyState";
import { KpiCard } from "../../components/ui/KpiCard";
import { PageHeader } from "../../components/ui/PageHeader";
import { SectionCard } from "../../components/ui/SectionCard";
import { StatusPill } from "../../components/ui/StatusPill";
import { formatearMonedaSinCentavos } from "../../utils/moneda";
import { useListadoPersonas } from "../personas/hooks/usePersonas";
import { useListadoPrestamosActivos } from "../prestamos/hooks/usePrestamos";
import type { PrestamoResponse } from "../prestamos/types/prestamo";
import { formatearFecha } from "../prestamos/utils/prestamoUi";
import { useResumenDashboard } from "./hooks/useDashboard";

function etiquetaEstado(estado: PrestamoResponse["estado"]) {
  if (estado === "ACTIVO") {
    return <StatusPill texto={estado} tone="success" />;
  }

  if (estado === "FINALIZADO") {
    return <StatusPill texto={estado} tone="neutral" />;
  }

  if (estado === "RENEGOCIADO") {
    return <StatusPill texto={estado} tone="warning" />;
  }

  return <StatusPill texto={estado} tone="danger" />;
}

const tarjetas = [
  {
    clave: "montoInvertido",
    titulo: "Monto inicial",
    descripcion: "Capital actualmente colocado en la operatoria",
    esMoneda: true,
  },
  {
    clave: "montoGanado",
    titulo: "Monto ganado",
    descripcion: "Ganancia ya confirmada por pagos registrados",
    esMoneda: true,
  },
  {
    clave: "montoPorGanar",
    titulo: "Monto por ganar",
    descripcion: "Ganancia pendiente estimada sobre préstamos vigentes",
    esMoneda: true,
  },
  {
    clave: "deudaTotal",
    titulo: "Deuda total",
    descripcion: "Saldo pendiente acumulado del sistema",
    esMoneda: true,
  },
  {
    clave: "prestamosActivos",
    titulo: "Préstamos activos",
    descripcion: "Casos abiertos con movimiento operativo",
    esMoneda: false,
  },
] as const;

export function DashboardPage() {
  const resumen = useResumenDashboard();
  const prestamosActivos = useListadoPrestamosActivos();
  const personas = useListadoPersonas();

  const personasPorId = useMemo(() => {
    const mapa = new Map<number, string>();
    (personas.data ?? []).forEach((persona) => {
      mapa.set(persona.id, persona.nombre);
    });
    return mapa;
  }, [personas.data]);

  const activosRecientes = useMemo(
    () => (prestamosActivos.data ?? []).slice(0, 5),
    [prestamosActivos.data],
  );

  const personasRecientes = useMemo(
    () => (personas.data ?? []).slice(0, 5),
    [personas.data],
  );

  return (
    <section className="space-y-4">
      <PageHeader
        titulo="Dashboard"
        descripcion="Punto de control diario para revisar métricas, continuar flujos y tomar decisiones rápidas sin perder contexto."
        breadcrumbs={[{ etiqueta: "Inicio" }, { etiqueta: "Dashboard" }]}
        acciones={[
          { etiqueta: "Nueva persona", to: "/personas", variante: "secundario" },
          {
            etiqueta: "Nuevo préstamo",
            to: "/prestamos?alta=1&vista=workspace",
            variante: "principal",
          },
        ]}
      />

      {resumen.isError && (
        <div className="alert-danger">
          No se pudo cargar el resumen del dashboard.
          <button
            type="button"
            onClick={() => resumen.refetch()}
            className="ml-2 font-semibold underline underline-offset-2"
          >
            Reintentar
          </button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {tarjetas.map((tarjeta, index) => {
          const valor = resumen.data?.[tarjeta.clave];

          const textoValor =
            resumen.isLoading || resumen.isFetching
              ? "Cargando..."
              : valor === undefined
                ? "Sin datos"
                : tarjeta.esMoneda
                  ? formatearMonedaSinCentavos(valor)
                  : String(valor);

          return (
            <KpiCard
              key={tarjeta.clave}
              titulo={tarjeta.titulo}
              valor={textoValor}
              descripcion={tarjeta.descripcion}
              destacado={index === 0}
            />
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <SectionCard
          titulo="Acciones rápidas"
          descripcion="Atajos para seguir operando sin navegar de más."
        >
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
            <Link to="/personas" className="list-row">
              Abrir libreta de personas
            </Link>
            <Link
              to="/prestamos?alta=1&vista=workspace"
              className="list-row"
            >
              Cargar préstamo nuevo
            </Link>
            <Link to="/prestamos?vista=listado" className="list-row">
              Revisar préstamos activos
            </Link>
            <Link to="/legajos" className="list-row">
              Consultar legajos y adjuntos
            </Link>
          </div>
        </SectionCard>

        <SectionCard
          titulo="Préstamos activos recientes"
          descripcion="Últimos casos abiertos para entrar directo al workspace."
          acciones={<span className="hint">Máximo 5</span>}
        >
          {prestamosActivos.isLoading ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Cargando préstamos activos...
            </p>
          ) : prestamosActivos.isError ? (
            <p className="text-sm text-red-700 dark:text-red-300">
              No se pudo cargar el listado de activos.
            </p>
          ) : activosRecientes.length === 0 ? (
            <EmptyState
              titulo="Sin préstamos activos"
              descripcion="Cuando cargues un préstamo activo aparecerá acá para seguimiento rápido."
            />
          ) : (
            <ul className="space-y-2.5">
              {activosRecientes.map((prestamo) => (
                <li key={prestamo.id} className="list-row">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-slate-950 dark:text-white">
                      {prestamo.referenciaCodigo
                        ? prestamo.referenciaCodigo
                        : `Préstamo #${prestamo.id}`}
                    </p>
                    {etiquetaEstado(prestamo.estado)}
                  </div>

                  <p className="mt-1 text-slate-700 dark:text-slate-200">
                    {personasPorId.get(prestamo.personaId) ??
                      `Persona ${prestamo.personaId}`}
                  </p>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {formatearMonedaSinCentavos(prestamo.montoInicial)} ·{" "}
                    {prestamo.cantidadCuotas} cuotas · base{" "}
                    {formatearFecha(prestamo.fechaBase)}
                  </p>

                  <Link
                    to={`/prestamos?prestamoId=${prestamo.id}&vista=workspace`}
                    className="mt-3 inline-flex text-xs font-semibold text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-slate-950 dark:text-slate-300 dark:decoration-slate-600 dark:hover:text-white"
                  >
                    Abrir workspace
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          titulo="Personas recientes"
          descripcion="Acceso directo para editar datos o revisar legajo."
        >
          {personas.isLoading ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Cargando personas...
            </p>
          ) : personas.isError ? (
            <p className="text-sm text-red-700 dark:text-red-300">
              No se pudo cargar el listado de personas.
            </p>
          ) : personasRecientes.length === 0 ? (
            <EmptyState
              titulo="Sin personas cargadas"
              descripcion="Empezá registrando una persona para poder crear préstamos."
            />
          ) : (
            <ul className="space-y-2.5">
              {personasRecientes.map((persona) => (
                <li key={persona.id} className="list-row">
                  <p className="font-semibold text-slate-950 dark:text-white">
                    {persona.nombre}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {persona.alias || persona.telefono || "Sin alias/teléfono"}
                  </p>
                  <Link
                    to={`/personas?personaId=${persona.id}`}
                    className="mt-3 inline-flex text-xs font-semibold text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-slate-950 dark:text-slate-300 dark:decoration-slate-600 dark:hover:text-white"
                  >
                    Abrir ficha de persona
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </section>
  );
}
```

---

## 9) `frontend/src/modules/auth/LoginPage.tsx`

```tsx
import { useState } from "react";
import { useAuth } from "../../app/auth";
import { leerSesionOperadora } from "../../services/sesionOperadora";

export function LoginPage() {
  const { iniciarSesion } = useAuth();
  const [usuario, setUsuario] = useState(
    () => leerSesionOperadora()?.usuario ?? "",
  );
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setEnviando(true);

    try {
      await iniciarSesion({ usuario: usuario.trim(), password });
      setPassword("");
    } catch {
      setError("No se pudo iniciar sesión. Verificá usuario y contraseña.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent px-4 py-10">
      <div className="grid w-full max-w-5xl gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="panel hidden p-8 lg:block">
          <span className="helper-kicker">CJ PRÉSTAMOS</span>
          <div className="mt-6 max-w-xl space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">
              Interfaz interna sobria, rápida y pensada para operar.
            </h1>
            <p className="text-base leading-7 text-slate-600 dark:text-slate-400">
              La idea no es impresionar con fuegos artificiales. La idea es que
              cada acción tenga jerarquía, cada dato se lea bien y cada flujo se
              sienta limpio.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="panel-soft p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Claro
              </p>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
                Datos importantes arriba, ruido visual abajo.
              </p>
            </div>
            <div className="panel-soft p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Rápido
              </p>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
                Flujos continuos entre personas, préstamos y legajos.
              </p>
            </div>
            <div className="panel-soft p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Interno
              </p>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
                Diseño serio, no juguete de landing de startup.
              </p>
            </div>
          </div>
        </section>

        <form onSubmit={onSubmit} className="panel w-full p-7 sm:p-8">
          <span className="helper-kicker">ACCESO OPERADORA</span>

          <div className="mt-5 space-y-2">
            <h2 className="titulo-seccion text-2xl sm:text-3xl">
              Ingresar al sistema
            </h2>
            <p className="subtitulo-seccion">
              Accedé con tus credenciales para operar préstamos, cuotas y
              legajos.
            </p>
          </div>

          <div className="mt-8 space-y-5">
            <label className="label">
              Usuario
              <input
                value={usuario}
                onChange={(event) => setUsuario(event.target.value)}
                autoComplete="username"
                required
                className="field"
              />
            </label>

            <label className="label">
              Contraseña
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
                className="field"
              />
            </label>
          </div>

          {error && <p className="alert-danger mt-5">{error}</p>}

          <button
            type="submit"
            disabled={enviando}
            className="boton-principal mt-6 w-full"
          >
            {enviando ? "Ingresando..." : "Ingresar"}
          </button>

          <p className="mt-4 text-xs leading-5 text-slate-500 dark:text-slate-400">
            La sesión del frontend vive en memoria. Al recargar, se vuelve a
            pedir autenticación. Es austero, sí. También es correcto.
          </p>
        </form>
      </div>
    </div>
  );
}
```

---

## 10) `frontend/src/modules/personas/PersonasPage.tsx`

```tsx
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageHeader } from "../../components/ui/PageHeader";
import { SectionCard } from "../../components/ui/SectionCard";
import { StatusPill } from "../../components/ui/StatusPill";
import { obtenerMensajeErrorApi } from "../../services/apiError";
import { PersonaDetalle } from "./components/PersonaDetalle";
import { PersonaFormulario } from "./components/PersonaFormulario";
import {
  useActualizarPersona,
  useCrearPersona,
  useDetallePersona,
  useEliminarPersona,
  useListadoPersonas,
} from "./hooks/usePersonas";
import {
  crearPayloadDesdePersona,
  payloadInicialPersona,
  type Persona,
  type PersonaPayload,
} from "./types/persona";

function coincideBusqueda(persona: Persona, termino: string) {
  const t = termino.toLowerCase().trim();

  if (!t) {
    return true;
  }

  return [persona.nombre, persona.alias ?? "", persona.telefono ?? ""]
    .join(" ")
    .toLowerCase()
    .includes(t);
}

function estiloColor(colorReferencia: string | null) {
  if (!colorReferencia || !colorReferencia.trim()) {
    return { backgroundColor: "#cbd5e1" };
  }

  return { backgroundColor: colorReferencia };
}

export function PersonasPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [busqueda, setBusqueda] = useState(searchParams.get("q") ?? "");
  const [seleccionId, setSeleccionId] = useState<number | null>(() => {
    const valor = searchParams.get("personaId");
    return valor ? Number(valor) : null;
  });
  const [modoEdicion, setModoEdicion] = useState(false);
  const [mostrarAlta, setMostrarAlta] = useState(false);
  const [nuevo, setNuevo] = useState<PersonaPayload>(payloadInicialPersona);
  const [errorNuevo, setErrorNuevo] = useState<string | null>(null);
  const [edicion, setEdicion] = useState<PersonaPayload>(payloadInicialPersona);
  const [errorEdicion, setErrorEdicion] = useState<string | null>(null);

  const listado = useListadoPersonas();
  const detalle = useDetallePersona(seleccionId);
  const crear = useCrearPersona();
  const actualizar = useActualizarPersona();
  const eliminar = useEliminarPersona();

  const personasFiltradas = useMemo(
    () => (listado.data ?? []).filter((persona) => coincideBusqueda(persona, busqueda)),
    [listado.data, busqueda],
  );

  const iniciarEdicion = () => {
    if (!detalle.data) {
      return;
    }

    setErrorEdicion(null);
    setEdicion(crearPayloadDesdePersona(detalle.data));
    setModoEdicion(true);
  };

  const guardarNueva = async () => {
    if (!nuevo.nombre.trim()) {
      setErrorNuevo("El nombre es obligatorio.");
      return;
    }

    setErrorNuevo(null);

    try {
      const persona = await crear.mutateAsync(nuevo);
      setNuevo(payloadInicialPersona);
      setSeleccionId(persona.id);
      setSearchParams((actual) => {
        const siguiente = new URLSearchParams(actual);
        siguiente.set("personaId", String(persona.id));
        return siguiente;
      });
    } catch {
      setErrorNuevo(
        obtenerMensajeErrorApi(
          crear.error,
          "No se pudo guardar la persona. Revisá los datos e intentá nuevamente.",
        ),
      );
    }
  };

  const guardarEdicion = async () => {
    if (!seleccionId) {
      return;
    }

    if (!edicion.nombre.trim()) {
      setErrorEdicion("El nombre es obligatorio.");
      return;
    }

    setErrorEdicion(null);

    try {
      await actualizar.mutateAsync({ id: seleccionId, payload: edicion });
      setModoEdicion(false);
    } catch (error) {
      setErrorEdicion(obtenerMensajeErrorApi(error, "No se pudo actualizar la persona."));
    }
  };

  const darDeBaja = async () => {
    if (!seleccionId) {
      return;
    }

    try {
      await eliminar.mutateAsync(seleccionId);
    } catch (error) {
      setErrorEdicion(obtenerMensajeErrorApi(error, "No se pudo dar de baja la persona."));
    }
  };

  return (
    <section className="space-y-4">
      <PageHeader
        titulo="Personas"
        descripcion="Libreta operativa central: buscá rápido, editá datos base y saltá a préstamos o legajos sin fricción."
        breadcrumbs={[{ etiqueta: "Inicio", to: "/" }, { etiqueta: "Personas" }]}
        acciones={[
          {
            etiqueta: mostrarAlta ? "Ocultar alta" : "Alta rápida",
            onClick: () => setMostrarAlta((actual) => !actual),
            variante: "principal",
          },
          { etiqueta: "Ir a legajos", to: "/legajos", variante: "secundario" },
        ]}
        estados={[
          { etiqueta: "personas registradas", valor: String(listado.data?.length ?? 0) },
          { etiqueta: "resultado(s) filtrado(s)", valor: String(personasFiltradas.length) },
          { etiqueta: "persona seleccionada", valor: seleccionId ? `#${seleccionId}` : "ninguna" },
        ]}
      />

      <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
        <aside className="space-y-4">
          <SectionCard
            titulo="Búsqueda y listado"
            descripcion="Filtrá por nombre, alias o teléfono y abrí una ficha en un clic."
          >
            <label className="label">
              Buscar por nombre, alias o teléfono
              <input
                value={busqueda}
                onChange={(event) => {
                  const valor = event.target.value;
                  setBusqueda(valor);
                  setSearchParams((actual) => {
                    const siguiente = new URLSearchParams(actual);
                    if (valor.trim()) siguiente.set("q", valor);
                    else siguiente.delete("q");
                    return siguiente;
                  });
                }}
                placeholder="Ej: Ana, Ani, 11..."
                className="field"
              />
            </label>

            <div className="mt-4 overflow-hidden rounded-[22px] border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900/70">
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  Resultados
                </span>
                {busqueda.trim() ? (
                  <StatusPill texto="Filtro activo" tone="neutral" />
                ) : (
                  <span className="hint">Sin filtro</span>
                )}
              </div>

              {listado.isLoading ? (
                <p className="px-4 py-5 text-sm text-slate-500 dark:text-slate-400">
                  Cargando personas...
                </p>
              ) : listado.isError ? (
                <p className="px-4 py-5 text-sm text-red-700 dark:text-red-300">
                  No se pudo cargar el listado.
                </p>
              ) : personasFiltradas.length === 0 ? (
                <div className="p-4">
                  <EmptyState
                    titulo="No hay resultados"
                    descripcion="Probá otro término o registrá una persona nueva."
                    accion={{ etiqueta: "Limpiar filtro", onClick: () => setBusqueda("") }}
                  />
                </div>
              ) : (
                <ul className="max-h-[60vh] space-y-2 overflow-auto p-3">
                  {personasFiltradas.map((persona) => (
                    <li key={persona.id}>
                      <button
                        onClick={() => {
                          setSeleccionId(persona.id);
                          setSearchParams((actual) => {
                            const siguiente = new URLSearchParams(actual);
                            siguiente.set("personaId", String(persona.id));
                            return siguiente;
                          });
                          setModoEdicion(false);
                        }}
                        className={`list-row ${
                          seleccionId === persona.id
                            ? "border-slate-900 ring-1 ring-slate-200 dark:border-sky-300 dark:ring-slate-700"
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block h-2.5 w-2.5 rounded-full border border-slate-300"
                            style={estiloColor(persona.colorReferencia)}
                          />
                          <span className="font-semibold text-slate-950 dark:text-white">
                            {persona.nombre}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {persona.alias || persona.telefono || "Sin dato extra"}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </SectionCard>

          {mostrarAlta && (
            <SectionCard
              titulo="Alta de persona"
              descripcion="Completá lo mínimo. El resto lo ajustás después."
            >
              <PersonaFormulario
                titulo="Nueva persona"
                textoBoton="Guardar persona"
                valor={nuevo}
                onChange={setNuevo}
                onSubmit={guardarNueva}
                loading={crear.isPending}
                error={errorNuevo}
              />
            </SectionCard>
          )}
        </aside>

        <div className="space-y-4">
          {!detalle.data && !detalle.isLoading && !detalle.isError && !seleccionId ? (
            <SectionCard
              titulo="Detalle de persona"
              descripcion="Seleccioná una persona del listado para ver su información operativa."
            >
              <EmptyState
                titulo="Sin persona seleccionada"
                descripcion="Elegí una persona para editar datos, revisar préstamos y operar legajo."
              />
            </SectionCard>
          ) : modoEdicion ? (
            <SectionCard
              titulo="Editar persona"
              descripcion="Ajustes de contacto, referencia y estado operativo."
            >
              <PersonaFormulario
                titulo="Editar persona"
                textoBoton="Guardar cambios"
                valor={edicion}
                onChange={setEdicion}
                onSubmit={guardarEdicion}
                onCancel={() => setModoEdicion(false)}
                loading={actualizar.isPending}
                error={errorEdicion}
              />
            </SectionCard>
          ) : (
            <>
              <PersonaDetalle
                persona={detalle.data ?? null}
                loading={detalle.isLoading}
                error={detalle.isError ? "No se pudo cargar el detalle." : null}
                onEditar={iniciarEdicion}
                onDarDeBaja={darDeBaja}
                deshabilitarBaja={eliminar.isPending}
              />

              {detalle.data && (
                <div className="panel-soft px-4 py-4 text-sm text-slate-600 dark:text-slate-300">
                  Desde esta persona podés abrir préstamos relacionados en{" "}
                  <Link
                    to="/prestamos"
                    className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 dark:text-white dark:decoration-slate-600"
                  >
                    Préstamos
                  </Link>{" "}
                  o revisar información contextual en{" "}
                  <Link
                    to="/legajos"
                    className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 dark:text-white dark:decoration-slate-600"
                  >
                    Legajos
                  </Link>
                  .
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
```

---

## 11) `frontend/src/modules/prestamos/PrestamosPage.tsx`

```tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageHeader } from "../../components/ui/PageHeader";
import { SectionCard } from "../../components/ui/SectionCard";
import { useListadoPersonas } from "../personas/hooks/usePersonas";
import { PrestamoAltaPanel } from "./components/PrestamoAltaPanel";
import { PrestamosListadoPanel } from "./components/PrestamosListadoPanel";
import { PrestamoWorkspace } from "./components/PrestamoWorkspace";
import { useListadoPrestamos } from "./hooks/usePrestamos";

type VistaMovilPrestamos = "listado" | "workspace";

const vistasMoviles: Array<{
  id: VistaMovilPrestamos;
  etiqueta: string;
  descripcion: string;
}> = [
  { id: "listado", etiqueta: "Explorar", descripcion: "Buscar y elegir préstamo" },
  { id: "workspace", etiqueta: "Operar", descripcion: "Cuotas, pagos y resumen" },
];

export function PrestamosPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [seleccionId, setSeleccionId] = useState<number | null>(() => {
    const prestamoId = searchParams.get("prestamoId");
    return prestamoId ? Number(prestamoId) : null;
  });
  const [vistaMovil, setVistaMovil] = useState<VistaMovilPrestamos>(() => {
    const vista = searchParams.get("vista");
    return vista === "workspace" || vista === "listado" ? vista : "listado";
  });
  const [mostrarAlta, setMostrarAlta] = useState(
    () => searchParams.get("alta") === "1",
  );

  const personas = useListadoPersonas();
  const prestamos = useListadoPrestamos();

  useEffect(() => {
    const primerPrestamo = prestamos.data?.[0];

    if (seleccionId === null && primerPrestamo) {
      setSeleccionId(primerPrestamo.id);
    }
  }, [prestamos.data, seleccionId]);

  useEffect(() => {
    setSearchParams((actual) => {
      const siguiente = new URLSearchParams(actual);
      if (seleccionId) {
        siguiente.set("prestamoId", String(seleccionId));
      } else {
        siguiente.delete("prestamoId");
      }
      siguiente.set("vista", vistaMovil);
      if (mostrarAlta) {
        siguiente.set("alta", "1");
      } else {
        siguiente.delete("alta");
      }
      return siguiente;
    });
  }, [seleccionId, vistaMovil, mostrarAlta, setSearchParams]);

  const personasPorId = useMemo(() => {
    const mapa = new Map<number, string>();
    (personas.data ?? []).forEach((persona) => {
      mapa.set(persona.id, persona.nombre);
    });
    return mapa;
  }, [personas.data]);

  const onCreado = (prestamoId: number) => {
    setSeleccionId(prestamoId);
    setMostrarAlta(false);
    setVistaMovil("workspace");
  };

  const prestamosTotal = prestamos.data?.length ?? 0;

  return (
    <section className="space-y-4">
      <PageHeader
        titulo="Préstamos"
        descripcion="Flujo operativo completo: explorá préstamos, abrí el workspace y resolvé cuotas o pagos desde la misma pantalla."
        breadcrumbs={[{ etiqueta: "Inicio", to: "/" }, { etiqueta: "Préstamos" }]}
        acciones={[
          {
            etiqueta: mostrarAlta ? "Cerrar alta" : "Nuevo préstamo",
            onClick: () => setMostrarAlta((actual) => !actual),
            variante: "principal",
          },
          { etiqueta: "Ir a personas", to: "/personas", variante: "secundario" },
        ]}
        estados={[
          { etiqueta: "préstamo(s) total(es)", valor: String(prestamosTotal) },
          { etiqueta: "selección activa", valor: seleccionId ? `#${seleccionId}` : "ninguna" },
          { etiqueta: "vista móvil", valor: vistaMovil },
        ]}
      />

      <SectionCard
        titulo="Circuito sugerido"
        descripcion="Primero elegís el préstamo. Después operás cuotas, referencia o pagos. Nada heroico: simplemente ordenado."
        suave
      >
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
          Si todavía no existe el préstamo, usá <strong>Nuevo préstamo</strong>.
          Para editar datos base de persona, entrá a{" "}
          <Link
            to="/personas"
            className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 dark:text-white dark:decoration-slate-600"
          >
            Personas
          </Link>
          .
        </p>
      </SectionCard>

      <div className="panel p-1.5 sm:hidden">
        <nav className="segmented-shell grid-cols-2" aria-label="Navegación de préstamos en móvil">
          {vistasMoviles.map((vista) => (
            <button
              key={vista.id}
              type="button"
              onClick={() => setVistaMovil(vista.id)}
              className={`segmented-item text-left ${
                vistaMovil === vista.id ? "segmented-item-active" : ""
              }`}
            >
              <span className="block">{vista.etiqueta}</span>
              <span className="mt-0.5 block text-[11px] opacity-80">
                {vista.descripcion}
              </span>
            </button>
          ))}
        </nav>
      </div>

      <div className="space-y-4 xl:hidden">
        {mostrarAlta && (
          <PrestamoAltaPanel
            personas={personas.data ?? []}
            personasLoading={personas.isLoading}
            onCreado={onCreado}
          />
        )}

        {vistaMovil === "listado" && (
          <PrestamosListadoPanel
            isLoading={prestamos.isLoading}
            isError={prestamos.isError}
            prestamos={prestamos.data ?? []}
            personasPorId={personasPorId}
            seleccionId={seleccionId}
            onSeleccionar={(prestamoId) => {
              setSeleccionId(prestamoId);
              setVistaMovil("workspace");
            }}
          />
        )}

        {vistaMovil === "workspace" && (
          <PrestamoWorkspace prestamoId={seleccionId} personasPorId={personasPorId} />
        )}
      </div>

      <div className="hidden gap-4 xl:grid xl:grid-cols-[340px_minmax(0,1fr)]">
        <PrestamosListadoPanel
          isLoading={prestamos.isLoading}
          isError={prestamos.isError}
          prestamos={prestamos.data ?? []}
          personasPorId={personasPorId}
          seleccionId={seleccionId}
          onSeleccionar={setSeleccionId}
        />

        <div className="space-y-4">
          {mostrarAlta && (
            <PrestamoAltaPanel
              personas={personas.data ?? []}
              personasLoading={personas.isLoading}
              onCreado={onCreado}
            />
          )}

          {prestamosTotal === 0 && !mostrarAlta ? (
            <SectionCard
              titulo="Workspace"
              descripcion="No hay préstamos activos para operar todavía."
            >
              <EmptyState
                titulo="Empezá cargando un préstamo"
                descripcion="El workspace se habilita automáticamente cuando exista un préstamo en el listado."
                accion={{ etiqueta: "Abrir alta", onClick: () => setMostrarAlta(true) }}
              />
            </SectionCard>
          ) : (
            <PrestamoWorkspace prestamoId={seleccionId} personasPorId={personasPorId} />
          )}
        </div>
      </div>
    </section>
  );
}
```

---

## 12) `frontend/src/modules/legajos/LegajosPage.tsx`

```tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageHeader } from "../../components/ui/PageHeader";
import { SectionCard } from "../../components/ui/SectionCard";
import { PersonaLegajoPanel } from "../personas/components/PersonaLegajoPanel";
import { useListadoPersonas } from "../personas/hooks/usePersonas";

export function LegajosPage() {
  const personas = useListadoPersonas();
  const [personaSeleccionadaId, setPersonaSeleccionadaId] = useState<number | null>(null);

  return (
    <section className="space-y-4">
      <PageHeader
        titulo="Legajos"
        descripcion="Información contextual separada de la operatoria económica diaria. Elegí persona y gestioná notas o adjuntos."
        breadcrumbs={[{ etiqueta: "Inicio", to: "/" }, { etiqueta: "Legajos" }]}
        acciones={[{ etiqueta: "Ir a personas", to: "/personas", variante: "secundario" }]}
        estados={[
          { etiqueta: "personas disponibles", valor: String(personas.data?.length ?? 0) },
          {
            etiqueta: "persona seleccionada",
            valor: personaSeleccionadaId ? `#${personaSeleccionadaId}` : "ninguna",
          },
        ]}
      />

      <SectionCard
        titulo="Selector de persona"
        descripcion="Elegí a quién corresponde el legajo que querés editar o consultar."
      >
        <label className="label">
          Persona
          <select
            className="field"
            value={personaSeleccionadaId ?? ""}
            onChange={(event) =>
              setPersonaSeleccionadaId(event.target.value ? Number(event.target.value) : null)
            }
          >
            <option value="">Seleccionar persona</option>
            {(personas.data ?? []).map((persona) => (
              <option key={persona.id} value={persona.id}>
                {persona.nombre}
              </option>
            ))}
          </select>
        </label>

        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Si necesitás corregir datos básicos como nombre, alias o contacto,
          hacelo desde{" "}
          <Link
            to="/personas"
            className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 dark:text-white dark:decoration-slate-600"
          >
            Personas
          </Link>
          .
        </p>
      </SectionCard>

      {personas.isLoading ? (
        <SectionCard titulo="Legajo" descripcion="Cargando información base.">
          <p className="text-sm text-slate-500 dark:text-slate-400">Cargando personas...</p>
        </SectionCard>
      ) : personas.isError ? (
        <SectionCard titulo="Legajo" descripcion="Error al cargar datos base.">
          <p className="text-sm text-red-700 dark:text-red-300">
            No se pudo cargar el listado de personas.
          </p>
        </SectionCard>
      ) : personaSeleccionadaId === null ? (
        <SectionCard titulo="Legajo" descripcion="Seleccioná una persona para continuar.">
          <EmptyState
            titulo="Esperando selección"
            descripcion="Elegí una persona para operar su legajo y gestionar adjuntos desde esta misma pantalla."
          />
        </SectionCard>
      ) : (
        <PersonaLegajoPanel personaId={personaSeleccionadaId} />
      )}
    </section>
  );
}
```

---

## 13) `frontend/src/modules/personas/components/PersonaFormulario.tsx`

```tsx
import type { ChangeEvent, FormEvent } from "react";
import type { PersonaPayload } from "../types/persona";

type Props = {
  titulo: string;
  textoBoton: string;
  valor: PersonaPayload;
  error: string | null;
  loading: boolean;
  onChange: (valor: PersonaPayload) => void;
  onSubmit: () => void;
  onCancel?: () => void;
};

function actualizarCampo(
  valor: PersonaPayload,
  event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
): PersonaPayload {
  const { name, value, type } = event.target;

  if (type === "checkbox") {
    const checked = (event.target as HTMLInputElement).checked;
    return { ...valor, [name]: checked };
  }

  return { ...valor, [name]: value };
}

function normalizarColorHex(colorReferencia: string) {
  const color = colorReferencia.trim();
  const esHex = /^#[0-9a-fA-F]{6}$/.test(color);
  return esHex ? color : "#94a3b8";
}

export function PersonaFormulario({
  titulo,
  textoBoton,
  valor,
  error,
  loading,
  onChange,
  onSubmit,
  onCancel,
}: Props) {
  const manejarSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={manejarSubmit} className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="card-title">{titulo}</h2>
          <p className="hint mt-1">Completá solo lo necesario para operar bien.</p>
        </div>

        {onCancel && (
          <button type="button" onClick={onCancel} className="boton-fantasma">
            Cancelar
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="label">
          Nombre *
          <input
            required
            name="nombre"
            value={valor.nombre}
            onChange={(e) => onChange(actualizarCampo(valor, e))}
            className="field"
          />
        </label>

        <label className="label">
          Alias
          <input
            name="alias"
            value={valor.alias}
            onChange={(e) => onChange(actualizarCampo(valor, e))}
            className="field"
          />
        </label>

        <label className="label">
          Teléfono
          <input
            name="telefono"
            value={valor.telefono}
            onChange={(e) => onChange(actualizarCampo(valor, e))}
            className="field"
          />
        </label>

        <label className="label">
          Color de referencia
          <div className="mt-1 flex items-center gap-2">
            <input
              type="color"
              value={normalizarColorHex(valor.colorReferencia)}
              onChange={(event) =>
                onChange({ ...valor, colorReferencia: event.target.value })
              }
              className="h-[46px] w-14 cursor-pointer p-1.5"
              aria-label="Selector de color de referencia"
            />
            <input
              name="colorReferencia"
              value={valor.colorReferencia}
              onChange={(e) => onChange(actualizarCampo(valor, e))}
              placeholder="Ej: #22c55e"
            />
          </div>
        </label>
      </div>

      <label className="label">
        Observación rápida
        <textarea
          name="observacionRapida"
          value={valor.observacionRapida}
          onChange={(e) => onChange(actualizarCampo(valor, e))}
          rows={4}
          className="field"
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="checkbox-tile">
          <input
            type="checkbox"
            name="cobraEnFecha"
            checked={valor.cobraEnFecha}
            onChange={(e) => onChange(actualizarCampo(valor, e))}
          />
          <span>Cobra en fecha</span>
        </label>

        <label className="checkbox-tile">
          <input
            type="checkbox"
            name="tieneIngresoExtra"
            checked={valor.tieneIngresoExtra}
            onChange={(e) => onChange(actualizarCampo(valor, e))}
          />
          <span>Tiene ingreso extra</span>
        </label>

        <label className="checkbox-tile">
          <input
            type="checkbox"
            name="activo"
            checked={valor.activo}
            onChange={(e) => onChange(actualizarCampo(valor, e))}
          />
          <span>Activo</span>
        </label>
      </div>

      {error && <p className="alert-danger">{error}</p>}

      <div className="flex flex-wrap items-center gap-2">
        <button type="submit" disabled={loading} className="boton-principal">
          {loading ? "Guardando..." : textoBoton}
        </button>
      </div>
    </form>
  );
}
```

---

## 14) `frontend/src/modules/prestamos/components/PrestamoAltaPanel.tsx`

```tsx
import { useEffect, useMemo, useState } from "react";
import { formatearMonedaSinCentavos } from "../../../utils/moneda";
import type { Persona } from "../../personas/types/persona";
import { useCalcularPrestamo, useCrearPrestamo } from "../hooks/usePrestamos";
import {
  crearPayloadCalculo,
  crearPayloadPrestamo,
  formularioInicialPrestamo,
  type CalculoPrestamoResultado,
  type PrestamoFormulario,
} from "../types/prestamo";

type PrestamoAltaPanelProps = {
  personas: Persona[];
  personasLoading: boolean;
  onCreado: (prestamoId: number) => void;
};

function esFormularioMinimoValido(formulario: PrestamoFormulario) {
  return (
    formulario.personaId.trim() &&
    Number(formulario.montoInicial) > 0 &&
    Number(formulario.cantidadCuotas) > 0
  );
}

export function PrestamoAltaPanel({
  personas,
  personasLoading,
  onCreado,
}: PrestamoAltaPanelProps) {
  const [formulario, setFormulario] = useState<PrestamoFormulario>(
    formularioInicialPrestamo,
  );
  const [errorFormulario, setErrorFormulario] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const crearPrestamo = useCrearPrestamo();
  const calcularPrestamo = useCalcularPrestamo();

  const puedeCalcularAlta = useMemo(
    () => esFormularioMinimoValido(formulario),
    [formulario],
  );

  useEffect(() => {
    if (!puedeCalcularAlta) {
      return;
    }

    const timeout = setTimeout(() => {
      calcularPrestamo.mutate(crearPayloadCalculo(formulario));
    }, 250);

    return () => clearTimeout(timeout);
  }, [formulario, puedeCalcularAlta]);

  const actualizarCampo = <K extends keyof PrestamoFormulario>(
    campo: K,
    valor: PrestamoFormulario[K],
  ) => {
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
    setMensajeExito(null);
    setErrorFormulario(null);
  };

  const guardarPrestamo = async () => {
    if (!esFormularioMinimoValido(formulario)) {
      setErrorFormulario(
        "Completá persona, monto inicial y cantidad de cuotas.",
      );
      return;
    }

    if (
      formulario.frecuenciaTipo === "CADA_X_DIAS" &&
      Number(formulario.frecuenciaCadaDias) <= 0
    ) {
      setErrorFormulario(
        "Para CADA_X_DIAS, la frecuencia debe ser mayor que 0.",
      );
      return;
    }

    if (Number(formulario.porcentajeFijoSugerido || "0") < 0) {
      setErrorFormulario("El porcentaje fijo sugerido no puede ser negativo.");
      return;
    }

    if (Number(formulario.interesManualOpcional || "0") < 0) {
      setErrorFormulario("El interés manual no puede ser negativo.");
      return;
    }

    if (
      formulario.frecuenciaTipo !== "FECHAS_MANUALES" &&
      formulario.usarFechasManuales
    ) {
      setErrorFormulario(
        "Usar fechas manuales solo aplica cuando la frecuencia es FECHAS_MANUALES.",
      );
      return;
    }

    if (
      formulario.frecuenciaTipo === "FECHAS_MANUALES" &&
      !formulario.usarFechasManuales
    ) {
      setErrorFormulario(
        'Para FECHAS_MANUALES, activá "Usar fechas manuales".',
      );
      return;
    }

    if (
      formulario.frecuenciaTipo !== "FECHAS_MANUALES" &&
      !formulario.fechaBase
    ) {
      setErrorFormulario(
        "La fecha base es obligatoria para frecuencia automática.",
      );
      return;
    }

    try {
      const prestamo = await crearPrestamo.mutateAsync(
        crearPayloadPrestamo(formulario),
      );
      onCreado(prestamo.id);
      setFormulario(formularioInicialPrestamo);
      setMensajeExito("Préstamo creado correctamente.");
    } catch {
      setErrorFormulario(
        "No se pudo crear el préstamo. Revisá los datos e intentá nuevamente.",
      );
    }
  };

  const resultadoAlta: CalculoPrestamoResultado | undefined =
    calcularPrestamo.data;

  return (
    <aside className="panel space-y-5 p-5 sm:p-6">
      <div className="space-y-2">
        <span className="helper-kicker">ALTA NUEVA</span>
        <div>
          <h2 className="titulo-seccion text-2xl">Alta de préstamo</h2>
          <p className="subtitulo-seccion">
            Cargá condiciones base sin centavos. Si ingresás decimales, el
            sistema redondea hacia arriba.
          </p>
        </div>
      </div>

      <label className="label">
        Persona
        <select
          className="field"
          value={formulario.personaId}
          onChange={(event) => actualizarCampo("personaId", event.target.value)}
        >
          <option value="">Seleccionar persona</option>
          {personas.map((persona) => (
            <option key={persona.id} value={persona.id}>
              {persona.nombre}
            </option>
          ))}
        </select>
      </label>

      {personasLoading && (
        <p className="hint">Cargando personas disponibles...</p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="label">
          Monto inicial
          <input
            type="number"
            min="0"
            step="1"
            className="field"
            value={formulario.montoInicial}
            onChange={(event) =>
              actualizarCampo("montoInicial", event.target.value)
            }
          />
        </label>

        <label className="label">
          Cantidad de cuotas
          <input
            type="number"
            min="1"
            className="field"
            value={formulario.cantidadCuotas}
            onChange={(event) =>
              actualizarCampo("cantidadCuotas", event.target.value)
            }
          />
        </label>

        <label className="label">
          Porcentaje fijo sugerido
          <input
            type="number"
            min="0"
            step="1"
            className="field"
            value={formulario.porcentajeFijoSugerido}
            onChange={(event) =>
              actualizarCampo("porcentajeFijoSugerido", event.target.value)
            }
          />
        </label>

        <label className="label">
          Interés manual opcional
          <input
            type="number"
            min="0"
            step="1"
            className="field"
            value={formulario.interesManualOpcional}
            onChange={(event) =>
              actualizarCampo("interesManualOpcional", event.target.value)
            }
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="label">
          Frecuencia
          <select
            className="field"
            value={formulario.frecuenciaTipo}
            onChange={(event) => {
              const frecuencia =
                event.target.value as PrestamoFormulario["frecuenciaTipo"];

              actualizarCampo("frecuenciaTipo", frecuencia);
              actualizarCampo(
                "usarFechasManuales",
                frecuencia === "FECHAS_MANUALES",
              );

              if (frecuencia !== "CADA_X_DIAS") {
                actualizarCampo("frecuenciaCadaDias", "");
              }
            }}
          >
            <option value="MENSUAL">Mensual</option>
            <option value="CADA_X_DIAS">Cada X días</option>
            <option value="FECHAS_MANUALES">Fechas manuales</option>
          </select>
        </label>

        <label className="label">
          {formulario.frecuenciaTipo === "FECHAS_MANUALES"
            ? "Fecha inicial sugerida (opcional)"
            : "Fecha base"}
          <input
            type="date"
            className="field"
            value={formulario.fechaBase}
            onChange={(event) =>
              actualizarCampo("fechaBase", event.target.value)
            }
          />
        </label>

        {formulario.frecuenciaTipo === "CADA_X_DIAS" && (
          <label className="label">
            Frecuencia cada X días
            <input
              type="number"
              min="1"
              className="field"
              value={formulario.frecuenciaCadaDias}
              onChange={(event) =>
                actualizarCampo("frecuenciaCadaDias", event.target.value)
              }
            />
          </label>
        )}
      </div>

      {formulario.frecuenciaTipo === "FECHAS_MANUALES" && (
        <label className="checkbox-tile">
          <input
            type="checkbox"
            checked={formulario.usarFechasManuales}
            onChange={(event) =>
              actualizarCampo("usarFechasManuales", event.target.checked)
            }
            disabled
          />
          <span>Usar fechas manuales</span>
        </label>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="label">
          Referencia
          <input
            className="field"
            value={formulario.referenciaCodigo}
            onChange={(event) =>
              actualizarCampo("referenciaCodigo", event.target.value)
            }
            maxLength={80}
          />
        </label>

        <label className="label">
          Estado
          <select
            className="field"
            value={formulario.estado}
            onChange={(event) =>
              actualizarCampo(
                "estado",
                event.target.value as PrestamoFormulario["estado"],
              )
            }
          >
            <option value="ACTIVO">Activo</option>
            <option value="FINALIZADO">Finalizado</option>
            <option value="RENEGOCIADO">Renegociado</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
        </label>
      </div>

      <label className="label">
        Observaciones
        <textarea
          className="field h-24"
          value={formulario.observaciones}
          onChange={(event) =>
            actualizarCampo("observaciones", event.target.value)
          }
          maxLength={600}
        />
      </label>

      {errorFormulario && <p className="alert-danger">{errorFormulario}</p>}
      {mensajeExito && <p className="alert-success">{mensajeExito}</p>}

      <button
        type="button"
        onClick={guardarPrestamo}
        disabled={crearPrestamo.isPending || personasLoading}
        className="boton-principal"
      >
        {crearPrestamo.isPending ? "Guardando..." : "Guardar préstamo"}
      </button>

      <div className="panel-soft p-4">
        <h3 className="card-title">Cálculo sugerido del alta</h3>

        {!puedeCalcularAlta ? (
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Completá persona, monto inicial y cantidad de cuotas.
          </p>
        ) : calcularPrestamo.isPending ? (
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Calculando...
          </p>
        ) : calcularPrestamo.isError ? (
          <p className="mt-2 text-sm text-red-700 dark:text-red-300">
            No se pudo obtener cálculo sugerido.
          </p>
        ) : (
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="surface-muted p-3">
              <dt className="hint">Total</dt>
              <dd className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">
                {formatearMonedaSinCentavos(resultadoAlta?.totalADevolver)}
              </dd>
            </div>
            <div className="surface-muted p-3">
              <dt className="hint">Cuota sugerida</dt>
              <dd className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">
                {formatearMonedaSinCentavos(resultadoAlta?.cuotaSugerida)}
              </dd>
            </div>
            <div className="surface-muted p-3">
              <dt className="hint">Invertido</dt>
              <dd className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">
                {formatearMonedaSinCentavos(resultadoAlta?.montoInvertido)}
              </dd>
            </div>
            <div className="surface-muted p-3">
              <dt className="hint">Ganado estimado</dt>
              <dd className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">
                {formatearMonedaSinCentavos(resultadoAlta?.montoGanadoEstimado)}
              </dd>
            </div>
            <div className="surface-muted p-3 sm:col-span-2">
              <dt className="hint">Por ganar</dt>
              <dd className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">
                {formatearMonedaSinCentavos(resultadoAlta?.montoPorGanar)}
              </dd>
            </div>
          </dl>
        )}
      </div>
    </aside>
  );
}
```

---

## 15) `frontend/src/modules/prestamos/components/PrestamosListadoPanel.tsx`

```tsx
import type { PrestamoResponse } from "../types/prestamo";
import {
  etiquetaEstado,
  etiquetaFrecuencia,
  formatearFecha,
  formatearMoneda,
} from "../utils/prestamoUi";

type PrestamosListadoPanelProps = {
  isLoading: boolean;
  isError: boolean;
  prestamos: PrestamoResponse[];
  personasPorId: Map<number, string>;
  seleccionId: number | null;
  onSeleccionar: (prestamoId: number) => void;
};

export function PrestamosListadoPanel({
  isLoading,
  isError,
  prestamos,
  personasPorId,
  seleccionId,
  onSeleccionar,
}: PrestamosListadoPanelProps) {
  return (
    <aside className="panel p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h2 className="card-title">Listado de préstamos</h2>
          <p className="hint mt-1">Seleccioná uno para operar</p>
        </div>
        <span className="hint">{prestamos.length} total</span>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Cargando préstamos...
        </p>
      ) : isError ? (
        <p className="text-sm text-red-700 dark:text-red-300">
          No se pudo cargar el listado de préstamos.
        </p>
      ) : prestamos.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Todavía no hay préstamos cargados. Usá “Nuevo préstamo” para comenzar.
        </p>
      ) : (
        <ul className="max-h-[64vh] space-y-2.5 overflow-auto pr-1">
          {prestamos.map((prestamo) => (
            <li key={prestamo.id}>
              <button
                type="button"
                onClick={() => onSeleccionar(prestamo.id)}
                className={`list-row ${
                  seleccionId === prestamo.id
                    ? "border-slate-900 ring-1 ring-slate-200 dark:border-sky-300 dark:ring-slate-700"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-950 dark:text-white">
                    #{prestamo.id}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${etiquetaEstado(
                      prestamo.estado,
                    )}`}
                  >
                    {prestamo.estado}
                  </span>
                </div>

                <p className="mt-2 text-slate-700 dark:text-slate-200">
                  {personasPorId.get(prestamo.personaId) ??
                    `Persona ${prestamo.personaId}`}
                </p>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {formatearMoneda(prestamo.montoInicial)} ·{" "}
                  {prestamo.cantidadCuotas} cuotas
                </p>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {etiquetaFrecuencia(
                    prestamo.frecuenciaTipo,
                    prestamo.frecuenciaCadaDias,
                  )}
                </p>

                {prestamo.referenciaCodigo && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Ref: {prestamo.referenciaCodigo}
                  </p>
                )}

                {prestamo.fechaBase && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {prestamo.frecuenciaTipo === "FECHAS_MANUALES"
                      ? "Inicio aux."
                      : "Base"}
                    : {formatearFecha(prestamo.fechaBase)}
                  </p>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
```

---

## 16) Qué tocar después, sin rehacer medio sistema

Para que el resto del proyecto quede alineado con este rediseño, hacé estos reemplazos puntuales en los componentes internos que hoy siguen con Tailwind “plano”:

### En cualquier formulario o panel interno
Reemplazá:

```tsx
className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
```

por:

```tsx
className="field"
```

### En labels de formularios
Reemplazá:

```tsx
className="text-sm text-slate-700"
```

o

```tsx
className="block text-sm text-slate-700"
```

por:

```tsx
className="label"
```

### En errores y mensajes
Reemplazá:

```tsx
className="text-sm text-red-700"
```

por:

```tsx
className="alert-danger"
```

Reemplazá:

```tsx
className="text-sm text-emerald-700"
```

por:

```tsx
className="alert-success"
```

### En tiles checkbox
Reemplazá:

```tsx
className="flex items-center gap-2 rounded border border-slate-300 bg-white px-3 py-2"
```

por:

```tsx
className="checkbox-tile"
```

### En listados clickeables
Reemplazá botones tipo:

```tsx
className="w-full rounded-xl border px-3 py-2 text-left text-sm shadow-sm transition ..."
```

por una base:

```tsx
className="list-row"
```

y agregá condicionales solo para selección activa.

---

## 17) Componentes que conviene revisar después de aplicar este paquete

No son obligatorios para que el rediseño ya se note, pero sí son los próximos candidatos naturales:

- `frontend/src/modules/prestamos/components/PrestamoWorkspace.tsx`
- `frontend/src/modules/prestamos/components/CuotasPrestamoPanel.tsx`
- `frontend/src/modules/prestamos/components/PagosPrestamoPanel.tsx`
- `frontend/src/modules/prestamos/components/PrestamoDetallePanel.tsx`
- `frontend/src/modules/personas/components/PersonaDetalle.tsx`
- `frontend/src/modules/personas/components/PersonaLegajoPanel.tsx`

La lógica no hay que tocarla. Solo hay que pasar esos paneles al mismo vocabulario visual: `panel`, `panel-soft`, `field`, `label`, `alert-*`, `list-row`, `checkbox-tile`.

---

## 18) Resultado esperado

Con este paquete vas a lograr:

- jerarquía visual mucho más clara;
- cards y contenedores con aspecto premium, no genérico;
- formularios más respirados y legibles;
- navegación lateral más seria y más moderna;
- login con mejor presencia;
- dashboard con densidad correcta y mejor lectura de KPIs;
- dark mode realmente usable;
- menos necesidad de “tunear” pantalla por pantalla.

No te va a convertir el sistema en Stripe. Tampoco hace falta.  
Sí lo va a sacar de “MVP prolijo” y lo va a llevar a “producto interno serio”.
