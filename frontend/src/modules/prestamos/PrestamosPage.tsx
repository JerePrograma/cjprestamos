import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useListadoPersonas } from "../personas/hooks/usePersonas";
import { PrestamoAltaPanel } from "./components/PrestamoAltaPanel";
import { PrestamosListadoPanel } from "./components/PrestamosListadoPanel";
import { PrestamoWorkspace } from "./components/PrestamoWorkspace";
import { useListadoPrestamos } from "./hooks/usePrestamos";

type VistaMovilPrestamos = "listado" | "workspace";

const vistasMoviles: Array<{ id: VistaMovilPrestamos; etiqueta: string }> = [
  { id: "listado", etiqueta: "Explorar" },
  { id: "workspace", etiqueta: "Operar" },
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
  const [mostrarAlta, setMostrarAlta] = useState(() => searchParams.get("alta") === "1");

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
    <section className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
        <div className="space-y-1">
          <h1 className="titulo-seccion">Préstamos</h1>
          <p className="subtitulo-seccion max-w-2xl">
            Explorá préstamos y operá cuotas/pagos en un workspace dedicado. El alta se abre en panel separado para evitar saturación.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 border border-slate-200">
            {prestamosTotal} préstamo{prestamosTotal === 1 ? "" : "s"}
          </span>
          <button
            type="button"
            onClick={() => setMostrarAlta((actual) => !actual)}
            className={mostrarAlta ? "boton-secundario" : "boton-principal"}
          >
            {mostrarAlta ? "Cerrar alta" : "Nuevo préstamo"}
          </button>
        </div>
      </header>

      <div className="panel p-1.5 sm:hidden">
        <nav className="grid grid-cols-2 gap-1" aria-label="Navegación de préstamos en móvil">
          {vistasMoviles.map((vista) => (
            <button
              key={vista.id}
              type="button"
              onClick={() => setVistaMovil(vista.id)}
              className={`rounded-lg px-2 py-2 text-xs font-medium transition ${
                vistaMovil === vista.id
                  ? "bg-slate-800 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {vista.etiqueta}
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

      <div className="hidden gap-4 xl:grid xl:grid-cols-[320px_minmax(0,1fr)]">
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
          <PrestamoWorkspace prestamoId={seleccionId} personasPorId={personasPorId} />
        </div>
      </div>
    </section>
  );
}
