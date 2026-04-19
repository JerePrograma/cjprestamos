import axios from 'axios';
import type { SesionOperadora } from './sesionOperadora';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? '/api';

let manejadorNoAutorizado: (() => void) | null = null;

export const api = axios.create({
  baseURL,
  timeout: 10_000,
});

export function configurarSesionApi(sesion: SesionOperadora) {
  api.defaults.headers.common.Authorization = `Basic ${btoa(`${sesion.usuario}:${sesion.password}`)}`;
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
