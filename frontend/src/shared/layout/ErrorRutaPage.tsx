import { isRouteErrorResponse, useRouteError } from "react-router-dom";

export function ErrorRutaPage() {
  const error = useRouteError();

  let titulo = "Ocurrió un error en la navegación";
  let detalle = "No se pudo cargar la pantalla solicitada.";

  if (isRouteErrorResponse(error)) {
    titulo = error.status === 404 ? "Ruta no encontrada" : `Error ${error.status}`;
    detalle = typeof error.data === "string" ? error.data : error.statusText;
  }

  return (
    <section className="panel max-w-xl space-y-2 p-5">
      <h1 className="titulo-seccion">{titulo}</h1>
      <p className="subtitulo-seccion">{detalle}</p>
      <a href="/" className="boton-secundario inline-flex">
        Volver al dashboard
      </a>
    </section>
  );
}
