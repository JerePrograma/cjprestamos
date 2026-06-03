import type { ComponentProps } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PersonasListadoPanel } from './PersonasListadoPanel';
import type { Persona } from '../types/persona';

const personas: Persona[] = [
  {
    id: 1,
    nombre: 'Ana Activa',
    alias: 'Ani',
    telefono: '111',
    observacionRapida: null,
    colorReferencia: '#22c55e',
    cobraEnFecha: true,
    tieneIngresoExtra: false,
    activo: true,
    createdAt: null,
    updatedAt: null,
  },
  {
    id: 2,
    nombre: 'Beto Baja',
    alias: null,
    telefono: '222',
    observacionRapida: null,
    colorReferencia: '#64748b',
    cobraEnFecha: false,
    tieneIngresoExtra: false,
    activo: false,
    createdAt: null,
    updatedAt: null,
  },
];

function renderPanel(overrides: Partial<ComponentProps<typeof PersonasListadoPanel>> = {}) {
  return render(
    <PersonasListadoPanel
      busqueda=""
      estado="todas"
      personas={personas}
      contadores={{ activas: 1, bajas: 1, visibles: personas.length }}
      isLoading={false}
      isError={false}
      seleccionId={null}
      onCambiarBusqueda={vi.fn()}
      onCambiarEstado={vi.fn()}
      onSeleccionar={vi.fn()}
      onLimpiarFiltro={vi.fn()}
      {...overrides}
    />,
  );
}

describe('PersonasListadoPanel', () => {
  afterEach(() => {
    cleanup();
  });

  it('muestra filtros, contadores y badge para personas dadas de baja', () => {
    renderPanel();

    expect(screen.getByRole('button', { name: /activas/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /dadas de baja/i })).toBeInTheDocument();
    expect(screen.getByText('Baja')).toBeInTheDocument();
    expect(screen.getByText('Beto Baja')).toBeInTheDocument();
    expect(screen.getByText('Visibles')).toBeInTheDocument();
  });

  it('por defecto puede recibir solo activas sin mostrar bajas', () => {
    renderPanel({
      estado: 'activas',
      personas: [personas[0]],
      contadores: { activas: 1, bajas: 1, visibles: 1 },
    });

    expect(screen.getByText('Ana Activa')).toBeInTheDocument();
    expect(screen.queryByText('Beto Baja')).not.toBeInTheDocument();
    expect(screen.queryByText('Baja')).not.toBeInTheDocument();
  });

  it('notifica cambio de filtro a dadas de baja', () => {
    const onCambiarEstado = vi.fn();
    renderPanel({ onCambiarEstado });

    fireEvent.click(screen.getByRole('button', { name: /dadas de baja/i }));

    expect(onCambiarEstado).toHaveBeenCalledWith('bajas');
  });
});
