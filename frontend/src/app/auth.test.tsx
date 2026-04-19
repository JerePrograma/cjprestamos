import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from './auth';
import { LoginPage } from '../modules/auth/LoginPage';

const apiGetMock = vi.fn();
let manejador401: (() => void) | null = null;

vi.mock('../services/api', () => ({
  api: {
    get: (...args: unknown[]) => apiGetMock(...args),
  },
  configurarSesionApi: vi.fn(),
  limpiarSesionApi: vi.fn(),
  registrarManejadorNoAutorizado: (handler: () => void) => {
    manejador401 = handler;
  },
}));

function AplicacionDePrueba() {
  const { sesion } = useAuth();

  if (!sesion) {
    return <LoginPage />;
  }

  return <p>App habilitada</p>;
}

function renderConProveedores() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AplicacionDePrueba />
      </AuthProvider>
    </QueryClientProvider>,
  );
}

describe('flujo mínimo de autenticación', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    apiGetMock.mockReset();
    sessionStorage.clear();
    manejador401 = null;
  });

  it('sin sesión muestra el login', () => {
    renderConProveedores();

    expect(screen.getByRole('heading', { name: 'Acceso de operadora' })).toBeInTheDocument();
  });

  it('login exitoso habilita la app', async () => {
    apiGetMock.mockResolvedValue({ data: {} });
    renderConProveedores();

    fireEvent.change(screen.getByLabelText('Usuario'), { target: { value: 'operadora' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'operadora123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));

    expect(await screen.findByText('App habilitada')).toBeInTheDocument();
    expect(sessionStorage.getItem('cjprestamos.sesion.operadora.usuario')).toBe('operadora');
  });

  it('cuando hay 401 limpia sesión y vuelve al login', async () => {
    apiGetMock.mockResolvedValue({ data: {} });
    renderConProveedores();

    fireEvent.change(screen.getByLabelText('Usuario'), { target: { value: 'operadora' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'operadora123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));

    expect(await screen.findByText('App habilitada')).toBeInTheDocument();

    manejador401?.();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Acceso de operadora' })).toBeInTheDocument();
    });
  });
});
