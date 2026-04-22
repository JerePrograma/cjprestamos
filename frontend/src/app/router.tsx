import { createBrowserRouter } from 'react-router-dom';
import { ErrorRutaPage } from '../components/layout/ErrorRutaPage';
import { LayoutPrincipal } from '../components/layout/LayoutPrincipal';
import { NoEncontradoPage } from '../components/layout/NoEncontradoPage';
import { ControlCajaPage } from '../modules/dashboard/ControlCajaPage';
import { DashboardPage } from '../modules/dashboard/DashboardPage';
import { LegajosPage } from '../modules/legajos/LegajosPage';
import { PersonasPage } from '../modules/personas/PersonasPage';
import { PrestamosPage } from '../modules/prestamos/PrestamosPage';
import { SimuladorPrestamosPage } from '../modules/prestamos/SimuladorPrestamosPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LayoutPrincipal />,
    errorElement: <ErrorRutaPage />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'control-caja', element: <ControlCajaPage /> },
      { path: 'personas', element: <PersonasPage /> },
      { path: 'prestamos', element: <PrestamosPage /> },
      { path: 'simulador', element: <SimuladorPrestamosPage /> },
      { path: 'legajos', element: <LegajosPage /> },
      { path: '*', element: <NoEncontradoPage /> },
    ],
  },
]);
