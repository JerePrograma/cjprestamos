import { Link } from "react-router-dom";

export function NoEncontradoPage() {
  return (
    <section className="panel max-w-xl space-y-2 p-5">
      <h1 className="titulo-seccion">Ruta no encontrada</h1>
      <p className="subtitulo-seccion">
        La pantalla que intentaste abrir no existe o fue movida.
      </p>
      <Link to="/" className="boton-secundario inline-flex">
        Ir al dashboard
      </Link>
    </section>
  );
}
