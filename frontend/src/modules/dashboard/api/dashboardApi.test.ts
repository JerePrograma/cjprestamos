import { describe, expect, it, vi } from 'vitest';
import { exportarDashboardPdf } from './dashboardApi';

const apiGetMock = vi.fn();

vi.mock('../../../shared/api/httpClient', () => ({
  api: {
    get: (...args: unknown[]) => apiGetMock(...args),
  },
}));

describe('dashboardApi', () => {
  it('exportarDashboardPdf solicita el PDF como blob con el rango indicado', async () => {
    const blob = new Blob(['%PDF-1.4'], { type: 'application/pdf' });
    apiGetMock.mockResolvedValue({ data: blob });

    const resultado = await exportarDashboardPdf('2026-05-01', '2026-05-31');

    expect(resultado).toBe(blob);
    expect(apiGetMock).toHaveBeenCalledWith('/reportes/dashboard/pdf', {
      params: {
        desde: '2026-05-01',
        hasta: '2026-05-31',
      },
      responseType: 'blob',
      timeout: 30_000,
    });
  });
});
