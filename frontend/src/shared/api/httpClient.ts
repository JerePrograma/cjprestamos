import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? '/api';

let manejadorNoAutorizado: (() => void) | null = null;

export const api = axios.create({
  baseURL,
  timeout: 10_000,
});

type CredencialesOperadora = {
  usuario: string;
  password: string;
};

export function configurarSesionApi(credenciales: CredencialesOperadora) {
  api.defaults.headers.common.Authorization = `Basic ${btoa(`${credenciales.usuario}:${credenciales.password}`)}`;
}

export function limpiarSesionApi() {
  delete api.defaults.headers.common.Authorization;
}

export function registrarManejadorNoAutorizado(handler: () => void) {
  manejadorNoAutorizado = handler;
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && manejadorNoAutorizado) {
      manejadorNoAutorizado();
    }

    return Promise.reject(error);
  },
);
