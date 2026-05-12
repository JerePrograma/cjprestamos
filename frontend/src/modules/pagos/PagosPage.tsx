import { PageHeader } from '../../components/ui/PageHeader';
import { SectionCard } from '../../components/ui/SectionCard';
import { EmptyState } from '../../components/ui/EmptyState';

export function PagosPage() {
  return (
    <section className="space-y-6">
      <PageHeader
        titulo="Pagos"
        descripcion="Pantalla base para registrar pagos, imputaciones y movimientos asociados a cuotas."
        breadcrumbs={[{ etiqueta: 'Inicio', to: '/' }, { etiqueta: 'Pagos' }]}
      />

      <SectionCard
        titulo="Registro de pagos"
        descripcion="Este módulo está preparado para concentrar las operaciones de imputación."
      >
        <EmptyState
          titulo="Módulo en preparación"
          descripcion="Cuando el flujo de pagos esté disponible, vas a poder registrar pagos e imputaciones desde esta pantalla."
        />
      </SectionCard>
    </section>
  );
}