import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, configurarSesionApi, limpiarSesionApi, registrarManejadorNoAutorizado } from '../services/api';
import { guardarSesionOperadora, type SesionOperadora } from '../services/sesionOperadora';
import { queryClient } from './queryClient';

type CredencialesOperadora = {
  usuario: string;
  password: string;
};

type AuthContextType = {
  sesion: SesionOperadora | null;
  iniciarSesion: (credenciales: CredencialesOperadora) => Promise<void>;
  cerrarSesion: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function limpiarSesionGlobal() {
  limpiarSesionApi();
  queryClient.clear();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [sesion, setSesion] = useState<SesionOperadora | null>(null);

  const cerrarSesion = useCallback(() => {
    limpiarSesionGlobal();
    setSesion(null);
  }, []);

  const iniciarSesion = async (credenciales: CredencialesOperadora) => {
    configurarSesionApi(credenciales);

    try {
      const respuesta = await api.get<{ username: string; rol: string }>('/auth/me');
      const nuevaSesion = { usuario: respuesta.data.username || credenciales.usuario };
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
