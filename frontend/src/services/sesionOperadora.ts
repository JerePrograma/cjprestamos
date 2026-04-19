export type SesionOperadora = {
  usuario: string;
};

const CLAVE_USUARIO_RECORDADO = 'cjprestamos.sesion.operadora.usuario';

export function leerSesionOperadora(): SesionOperadora | null {
  const usuario = sessionStorage.getItem(CLAVE_USUARIO_RECORDADO);
  if (!usuario) {
    return null;
  }

  return { usuario };
}

export function guardarSesionOperadora(sesion: SesionOperadora) {
  sessionStorage.setItem(CLAVE_USUARIO_RECORDADO, sesion.usuario);
}

export function limpiarSesionOperadora() {
  // Se conserva el último usuario para facilitar reingreso manual.
}

export function olvidarUsuarioRecordado() {
  sessionStorage.removeItem(CLAVE_USUARIO_RECORDADO);
}
