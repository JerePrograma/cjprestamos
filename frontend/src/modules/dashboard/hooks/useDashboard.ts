import { useMutation, useQuery } from '@tanstack/react-query';
import { exportarDashboardPdf, obtenerResumenDashboard } from '../api/dashboardApi';

const QUERY_KEY_DASHBOARD = ['dashboard'];

type ExportarDashboardPdfParams = {
  desde: string;
  hasta: string;
};

export function useResumenDashboard() {
  return useQuery({
    queryKey: [...QUERY_KEY_DASHBOARD, 'resumen'],
    queryFn: obtenerResumenDashboard,
    refetchInterval: 120_000,
  });
}

export function useExportarDashboardPdf() {
  return useMutation({
    mutationFn: ({ desde, hasta }: ExportarDashboardPdfParams) => exportarDashboardPdf(desde, hasta),
  });
}
