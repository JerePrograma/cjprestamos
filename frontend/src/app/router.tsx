import { createBrowserRouter } from 'react-router-dom';
import { ErrorRutaPage } from '../shared/layout/ErrorRutaPage';
import { LayoutPrincipal } from '../shared/layout/LayoutPrincipal';
import { NoEncontradoPage } from '../shared/layout/NoEncontradoPage';
import { ControlCajaPage } from '../modules/caja/pages/ControlCajaPage';
import { DashboardPage } from '../modules/dashboard/pages/DashboardPage';
import { LegajosPage } from '../modules/legajos/pages/LegajosPage';
import { PersonasPage } from '../modules/personas/pages/PersonasPage';
import { PrestamosPage } from '../modules/prestamos/pages/PrestamosPage';
import { SimuladorPrestamosPage } from '../modules/simulador/pages/SimuladorPrestamosPage';

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
