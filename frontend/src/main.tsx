import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider, useAuth } from './app/auth';
import { queryClient } from './app/queryClient';
import { router } from './app/router';
import { LoginPage } from './modules/auth/LoginPage';
import './styles.css';

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
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
