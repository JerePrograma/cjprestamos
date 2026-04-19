import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, configurarSesionApi, limpiarSesionApi, registrarManejadorNoAutorizado } from '../services/api';
import {
  guardarSesionOperadora,
  leerSesionOperadora,
  limpiarSesionOperadora,
  type SesionOperadora,
} from '../services/sesionOperadora';
import { queryClient } from './queryClient';

type AuthContextType = {
  sesion: SesionOperadora | null;
  iniciarSesion: (sesion: SesionOperadora) => Promise<void>;
  cerrarSesion: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function limpiarSesionGlobal() {
  limpiarSesionOperadora();
  limpiarSesionApi();
  queryClient.clear();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [sesion, setSesion] = useState<SesionOperadora | null>(() => {
    const sesionInicial = leerSesionOperadora();
    if (sesionInicial) {
      configurarSesionApi(sesionInicial);
    }
    return sesionInicial;
  });

  const cerrarSesion = useCallback(() => {
    limpiarSesionGlobal();
    setSesion(null);
  }, []);

  const iniciarSesion = async (nuevaSesion: SesionOperadora) => {
    configurarSesionApi(nuevaSesion);

    try {
      await api.get('/dashboard/resumen');
      guardarSesionOperadora(nuevaSesion);
      setSesion(nuevaSesion);
      queryClient.clear();
    } catch (error) {
      limpiarSesionApi();
      throw error;
    }
  };

  useEffect(() => {
    registrarManejadorNoAutorizado(() => {
      cerrarSesion();
    });
  }, [cerrarSesion]);

  return (
    <AuthContext.Provider value={{ sesion, iniciarSesion, cerrarSesion }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }

  return context;
}
