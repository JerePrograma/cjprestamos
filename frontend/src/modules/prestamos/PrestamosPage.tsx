import { useEffect, useMemo, useState } from "react";
import { useListadoPersonas } from "../personas/hooks/usePersonas";
import { PrestamoAltaPanel } from "./components/PrestamoAltaPanel";
import { PrestamosListadoPanel } from "./components/PrestamosListadoPanel";
import { PrestamoWorkspace } from "./components/PrestamoWorkspace";
import { useListadoPrestamos } from "./hooks/usePrestamos";

export function PrestamosPage() {
  const [seleccionId, setSeleccionId] = useState<number | null>(null);

  const personas = useListadoPersonas();
  const prestamos = useListadoPrestamos();

  useEffect(() => {
    if (seleccionId === null && prestamos.data && prestamos.data.length > 0) {
      setSeleccionId(prestamos.data[0].id);
    }
  }, [prestamos.data, seleccionId]);

  const personasPorId = useMemo(() => {
    const mapa = new Map<number, string>();
    (personas.data ?? []).forEach((persona) => {
      mapa.set(persona.id, persona.nombre);
    });
    return mapa;
  }, [personas.data]);

  return (
    <section className="space-y-5">
      <header className="space-y-1">
        <h1 className="titulo-seccion">Préstamos</h1>
        <p className="subtitulo-seccion">
          Listado, detalle operativo y alta de préstamo en una sola vista manual-first.
        </p>
      </header>

      <div className="grid gap-4 xl:grid-cols-[280px_1fr] 2xl:grid-cols-[280px_1fr_360px]">
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
          onCreado={(prestamoId) => setSeleccionId(prestamoId)}
        />
      </div>
    </section>
  );
}
