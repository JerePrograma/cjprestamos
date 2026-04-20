import { createBrowserRouter } from 'react-router-dom';
import { ErrorRutaPage } from '../components/layout/ErrorRutaPage';
import { LayoutPrincipal } from '../components/layout/LayoutPrincipal';
import { NoEncontradoPage } from '../components/layout/NoEncontradoPage';
import { DashboardPage } from '../modules/dashboard/DashboardPage';
import { LegajosPage } from '../modules/legajos/LegajosPage';
import { PersonasPage } from '../modules/personas/PersonasPage';
import { PrestamosPage } from '../modules/prestamos/PrestamosPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LayoutPrincipal />,
    errorElement: <ErrorRutaPage />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'personas', element: <PersonasPage /> },
      { path: 'prestamos', element: <PrestamosPage /> },
      { path: 'legajos', element: <LegajosPage /> },
      { path: '*', element: <NoEncontradoPage /> },
    ],
  },
]);
