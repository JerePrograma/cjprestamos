import { describe, expect, it, vi } from 'vitest';
import { eliminarPrestamo } from './prestamosApi';

const apiDeleteMock = vi.fn();

vi.mock('../../../shared/api/httpClient', () => ({
  api: {
    delete: (...args: unknown[]) => apiDeleteMock(...args),
  },
}));

describe('prestamosApi', () => {
  it('eliminarPrestamo llama al endpoint DELETE del prestamo', async () => {
    apiDeleteMock.mockResolvedValue({});

    await eliminarPrestamo(15);

    expect(apiDeleteMock).toHaveBeenCalledWith('/prestamos/15');
  });
});
