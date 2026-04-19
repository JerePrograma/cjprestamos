export type SesionOperadora = {
  usuario: string;
  password: string;
};

const CLAVE_SESION = 'cjprestamos.sesion.operadora';

export function leerSesionOperadora(): SesionOperadora | null {
  const valor = sessionStorage.getItem(CLAVE_SESION);
  if (!valor) {
    return null;
  }

  try {
    const sesionParseada = JSON.parse(valor) as Partial<SesionOperadora>;
    if (!sesionParseada.usuario || !sesionParseada.password) {
      return null;
    }

    return {
      usuario: sesionParseada.usuario,
      password: sesionParseada.password,
    };
  } catch {
    return null;
  }
}

export function guardarSesionOperadora(sesion: SesionOperadora) {
  sessionStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
}

export function limpiarSesionOperadora() {
  sessionStorage.removeItem(CLAVE_SESION);
}
