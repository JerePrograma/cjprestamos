import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PrestamoWorkspace } from './PrestamoWorkspace';
import type { PersonaPrestamoResumen } from '../types/prestamo';

vi.mock('../../cuotas/hooks/useCuotasPrestamo', () => ({
  useCuotasPrestamo: () => ({ data: [], isLoading: false, isError: false }),
}));

vi.mock('../../pagos/hooks/usePagos', () => ({
  usePagosPrestamo: () => ({ data: [], isLoading: false, isError: false }),
}));

vi.mock('../hooks/usePrestamos', () => ({
  useDetallePrestamo: () => ({
    data: {
      id: 7,
      personaId: 1,
      montoInicial: 1000,
      porcentajeFijoSugerido: 20,
      interesManualOpcional: null,
      cantidadCuotas: 4,
      frecuenciaTipo: 'MENSUAL',
      frecuenciaCadaDias: null,
      fechaBase: '2026-05-01',
      usarFechasManuales: false,
      referenciaCodigo: 'REF-7',
      observaciones: null,
      estado: 'ACTIVO',
      eliminado: false,
      createdAt: null,
      updatedAt: null,
    },
    isLoading: false,
    isError: false,
  }),
  useResumenPrestamo: () => ({
    data: {
      interesAplicado: 200,
      totalADevolver: 1200,
      cuotaSugerida: 300,
      montoInvertido: 1000,
      montoGanadoEstimado: 200,
      montoPorGanar: 200,
    },
    isLoading: false,
    isError: false,
  }),
}));

vi.mock('../hooks/usePrestamoCuotasOperacion', () => ({
  usePrestamoCuotasOperacion: () => ({}),
}));

vi.mock('../hooks/usePrestamoPagosOperacion', () => ({
  usePrestamoPagosOperacion: () => ({ formularioPago: {}, cambiarCampoPago: vi.fn() }),
}));

vi.mock('../hooks/usePrestamoReferenciaForm', () => ({
  usePrestamoReferenciaForm: () => ({
    formularioReferencia: { referenciaCodigo: 'REF-7', observaciones: '' },
    cambiarReferencia: vi.fn(),
    guardarReferenciaPrestamo: vi.fn(),
    guardandoReferencia: false,
    errorReferencia: null,
    mensajeReferencia: null,
  }),
}));

const personasPorId = new Map<number, PersonaPrestamoResumen>([
  [1, { nombre: 'Ana Activa', activo: true }],
]);

function renderWorkspace(onEliminarPrestamo = vi.fn()) {
  render(
    <PrestamoWorkspace
      prestamoId={7}
      personasPorId={personasPorId}
      tabActiva="resumen"
      onCambiarTab={vi.fn()}
      onEliminarPrestamo={onEliminarPrestamo}
      eliminandoPrestamo={false}
      mensajeOperacion={null}
      errorOperacion={null}
    />,
  );
}

describe('PrestamoWorkspace', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('pide confirmacion antes de eliminar y luego dispara la accion', () => {
    const onEliminarPrestamo = vi.fn();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    renderWorkspace(onEliminarPrestamo);

    fireEvent.click(screen.getByRole('button', { name: /eliminar préstamo/i }));

    expect(confirmSpy).toHaveBeenCalledWith(expect.stringContaining('No se borrarán cuotas'));
    expect(onEliminarPrestamo).toHaveBeenCalledWith(7);
  });

  it('si se cancela la confirmacion no elimina', () => {
    const onEliminarPrestamo = vi.fn();
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    renderWorkspace(onEliminarPrestamo);

    fireEvent.click(screen.getByRole('button', { name: /eliminar préstamo/i }));

    expect(onEliminarPrestamo).not.toHaveBeenCalled();
  });
});
