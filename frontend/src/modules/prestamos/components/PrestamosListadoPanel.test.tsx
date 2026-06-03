import type { ComponentProps } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PrestamosListadoPanel } from './PrestamosListadoPanel';
import type { PersonaPrestamoResumen, PrestamoResponse } from '../types/prestamo';

const prestamos: PrestamoResponse[] = [
  {
    id: 10,
    personaId: 1,
    montoInicial: 1000,
    porcentajeFijoSugerido: 20,
    interesManualOpcional: null,
    cantidadCuotas: 4,
    frecuenciaTipo: 'MENSUAL',
    frecuenciaCadaDias: null,
    fechaBase: '2026-05-01',
    usarFechasManuales: false,
    referenciaCodigo: 'REF-10',
    observaciones: null,
    estado: 'ACTIVO',
    eliminado: false,
    createdAt: null,
    updatedAt: null,
  },
  {
    id: 11,
    personaId: 2,
    montoInicial: 500,
    porcentajeFijoSugerido: null,
    interesManualOpcional: null,
    cantidadCuotas: 2,
    frecuenciaTipo: 'CADA_X_DIAS',
    frecuenciaCadaDias: 7,
    fechaBase: '2026-05-03',
    usarFechasManuales: false,
    referenciaCodigo: null,
    observaciones: null,
    estado: 'FINALIZADO',
    eliminado: false,
    createdAt: null,
    updatedAt: null,
  },
];

const personasPorId = new Map<number, PersonaPrestamoResumen>([
  [1, { nombre: 'Ana Activa', activo: true }],
  [2, { nombre: 'Beto Baja', activo: false }],
]);

function renderPanel(overrides: Partial<ComponentProps<typeof PrestamosListadoPanel>> = {}) {
  return render(
    <PrestamosListadoPanel
      isLoading={false}
      isError={false}
      busqueda=""
      filtroEstado="todos"
      prestamos={prestamos}
      totalPrestamos={prestamos.length}
      personasPorId={personasPorId}
      seleccionId={null}
      onCambiarBusqueda={vi.fn()}
      onCambiarFiltroEstado={vi.fn()}
      onSeleccionar={vi.fn()}
      {...overrides}
    />,
  );
}

describe('PrestamosListadoPanel', () => {
  afterEach(() => {
    cleanup();
  });

  it('muestra datos principales y badge cuando la persona asociada esta dada de baja', () => {
    renderPanel();

    expect(screen.getByText('REF-10')).toBeInTheDocument();
    expect(screen.getByText('Préstamo #11')).toBeInTheDocument();
    expect(screen.getByText('Ana Activa')).toBeInTheDocument();
    expect(screen.getByText('Persona dada de baja')).toBeInTheDocument();
    expect(screen.getAllByText(/Base:/)).toHaveLength(2);
  });

  it('notifica busqueda y filtro rapido por estado', () => {
    const onCambiarBusqueda = vi.fn();
    const onCambiarFiltroEstado = vi.fn();
    renderPanel({ onCambiarBusqueda, onCambiarFiltroEstado });

    fireEvent.change(screen.getByLabelText(/buscar por persona/i), {
      target: { value: 'ana' },
    });
    fireEvent.click(screen.getByRole('button', { name: /activos\/renegociados/i }));

    expect(onCambiarBusqueda).toHaveBeenCalledWith('ana');
    expect(onCambiarFiltroEstado).toHaveBeenCalledWith('cobrables');
  });
});
