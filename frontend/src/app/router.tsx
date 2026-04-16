import { createBrowserRouter } from 'react-router-dom';
import { LayoutPrincipal } from '../components/layout/LayoutPrincipal';
import { DashboardPage } from '../modules/dashboard/DashboardPage';
import { PersonasPage } from '../modules/personas/PersonasPage';
import { PrestamosPage } from '../modules/prestamos/PrestamosPage';
import { PagosPage } from '../modules/pagos/PagosPage';
import { LegajosPage } from '../modules/legajos/LegajosPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LayoutPrincipal />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'personas', element: <PersonasPage /> },
      { path: 'prestamos', element: <PrestamosPage /> },
      { path: 'pagos', element: <PagosPage /> },
      { path: 'legajos', element: <LegajosPage /> },
    ],
  },
]);
