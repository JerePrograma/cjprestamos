import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider, useAuth } from './app/auth';
import { queryClient } from './app/queryClient';
import { router } from './app/router';
import { LoginPage } from './modules/auth/LoginPage';
import './styles.css';

function AplicarTemaGuardado() {
  useEffect(() => {
    const temaGuardado = window.localStorage.getItem('tema-ui');
    const esOscuro = temaGuardado ? temaGuardado === 'oscuro' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', esOscuro);
  }, []);

  return null;
}

function App() {
  const { sesion } = useAuth();

  if (!sesion) {
    return <LoginPage />;
  }

  return <RouterProvider router={router} />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AplicarTemaGuardado />
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
