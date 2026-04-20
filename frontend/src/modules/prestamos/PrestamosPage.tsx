import { useEffect, useMemo, useState } from "react";
import { useListadoPersonas } from "../personas/hooks/usePersonas";
import { PrestamoAltaPanel } from "./components/PrestamoAltaPanel";
import { PrestamosListadoPanel } from "./components/PrestamosListadoPanel";
import { PrestamoWorkspace } from "./components/PrestamoWorkspace";
import { useListadoPrestamos } from "./hooks/usePrestamos";

type VistaMovilPrestamos = "listado" | "detalle" | "alta";

const vistasMoviles: Array<{ id: VistaMovilPrestamos; etiqueta: string }> = [
  { id: "listado", etiqueta: "Listado" },
  { id: "detalle", etiqueta: "Detalle" },
  { id: "alta", etiqueta: "Alta" },
];

export function PrestamosPage() {
  const [seleccionId, setSeleccionId] = useState<number | null>(null);
  const [vistaMovil, setVistaMovil] = useState<VistaMovilPrestamos>("listado");

  const personas = useListadoPersonas();
  const prestamos = useListadoPrestamos();

  useEffect(() => {
    const primerPrestamo = prestamos.data?.[0];

    if (seleccionId === null && primerPrestamo) {
      setSeleccionId(primerPrestamo.id);
    }
  }, [prestamos.data, seleccionId]);

  const personasPorId = useMemo(() => {
    const mapa = new Map<number, string>();
    (personas.data ?? []).forEach((persona) => {
      mapa.set(persona.id, persona.nombre);
    });
    return mapa;
  }, [personas.data]);

  const onCreado = (prestamoId: number) => {
    setSeleccionId(prestamoId);
    setVistaMovil("detalle");
  };

  return (
    <section className="space-y-5">
      <header className="space-y-1">
        <h1 className="titulo-seccion">Préstamos</h1>
        <p className="subtitulo-seccion">
          Flujo operativo completo: listado, detalle, cuotas, pagos y alta en una sola vista.
        </p>
      </header>

      <div className="panel p-1.5 sm:hidden">
        <nav className="grid grid-cols-3 gap-1" aria-label="Navegación de préstamos en móvil">
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
        {vistaMovil === "listado" && (
          <PrestamosListadoPanel
            isLoading={prestamos.isLoading}
            isError={prestamos.isError}
            prestamos={prestamos.data ?? []}
            personasPorId={personasPorId}
            seleccionId={seleccionId}
            onSeleccionar={(prestamoId) => {
              setSeleccionId(prestamoId);
              setVistaMovil("detalle");
            }}
          />
        )}

        {vistaMovil === "detalle" && (
          <PrestamoWorkspace prestamoId={seleccionId} personasPorId={personasPorId} />
        )}

        {vistaMovil === "alta" && (
          <PrestamoAltaPanel
            personas={personas.data ?? []}
            personasLoading={personas.isLoading}
            onCreado={onCreado}
          />
        )}
      </div>

      <div className="hidden gap-4 xl:grid xl:grid-cols-[300px_minmax(0,1fr)_360px] 2xl:grid-cols-[340px_minmax(0,1fr)_380px]">
        <PrestamosListadoPanel
          isLoading={prestamos.isLoading}
          isError={prestamos.isError}
          prestamos={prestamos.data ?? []}
          personasPorId={personasPorId}
          seleccionId={seleccionId}
          onSeleccionar={setSeleccionId}
        />

        <PrestamoWorkspace prestamoId={seleccionId} personasPorId={personasPorId} />

        <PrestamoAltaPanel
          personas={personas.data ?? []}
          personasLoading={personas.isLoading}
          onCreado={onCreado}
        />
      </div>
    </section>
  );
}
