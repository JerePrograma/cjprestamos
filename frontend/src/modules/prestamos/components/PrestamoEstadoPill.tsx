import { StatusPill } from '../../../shared/ui/StatusPill';
import type { PrestamoResponse } from '../types/prestamo';

type PrestamoEstadoPillProps = {
  estado: PrestamoResponse['estado'];
};

function tonoEstado(estado: PrestamoResponse['estado']) {
  if (estado === 'ACTIVO') return 'success';
  if (estado === 'RENEGOCIADO') return 'warning';
  if (estado === 'FINALIZADO') return 'neutral';
  return 'danger';
}

function textoEstado(estado: PrestamoResponse['estado']) {
  if (estado === 'ACTIVO') return 'Activo';
  if (estado === 'FINALIZADO') return 'Finalizado';
  if (estado === 'RENEGOCIADO') return 'Renegociado';
  if (estado === 'CANCELADO') return 'Cancelado';
  return estado;
}

export function PrestamoEstadoPill({ estado }: PrestamoEstadoPillProps) {
  return <StatusPill texto={textoEstado(estado)} tone={tonoEstado(estado)} />;
}
