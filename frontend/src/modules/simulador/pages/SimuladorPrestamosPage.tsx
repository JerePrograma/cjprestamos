import { FormEvent, useMemo, useState } from 'react';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { PageHeader } from '../../../shared/ui/PageHeader';
import { SectionCard } from '../../../shared/ui/SectionCard';
import { formatearMonedaSinCentavos } from '../../../shared/lib/money';
import type { FrecuenciaTipo } from '../../prestamos/types/prestamo';
import {
  useDescargarPdfSimulacionPrestamo,
  useSimularPrestamo,
} from '../hooks/useSimuladorPrestamos';
import {
  construirPayloadSimulador,
  formularioInicialSimulador,
  type FormularioSimulador,
} from '../utils/simuladorPrestamo';

function MiniResultado({ titulo, valor }: { titulo: string; valor: number }) {
  return (
    <article className="surface-inset">
      <p className="label-ui">{titulo}</p>
      <p className="mt-1 text-lg font-semibold text-app">
        {formatearMonedaSinCentavos(valor)}
      </p>
    </article>
  );
}

export function SimuladorPrestamosPage() {
  const [formulario, setFormulario] = useState<FormularioSimulador>(formularioInicialSimulador);
  const [error, setError] = useState<string | null>(null);
  const simular = useSimularPrestamo();
  const descargarPdf = useDescargarPdfSimulacionPrestamo();
  const simulacion = simular.data ?? null;

  const puedeDescargar = useMemo(
    () => simulacion !== null && !descargarPdf.isPending,
    [simulacion, descargarPdf.isPending],
  );

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      const payload = construirPayloadSimulador(formulario);
      await simular.mutateAsync(payload);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo simular el préstamo.');
    }
  };

  const onDescargarPdf = async () => {
    try {
      const payload = construirPayloadSimulador(formulario);
      const blob = await descargarPdf.mutateAsync(payload);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = 'simulacion-prestamo.pdf';
      link.click();

      window.URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo generar el PDF.');
    }
  };

  return (
    <section className="space-y-6">
      <PageHeader
        titulo="Simulador de préstamos"
        descripcion="Estimá el plan de cuotas antes de registrar el préstamo real."
        breadcrumbs={[{ etiqueta: 'Inicio', to: '/' }, { etiqueta: 'Simulador' }]}
      />

      <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
        <SectionCard titulo="Parámetros" descripcion="Definí monto, interés y frecuencia de cobro.">
          <form className="space-y-4" onSubmit={onSubmit}>
            <label className="block text-sm">
              <span className="label-ui mb-1 block">Monto inicial</span>
              <input
                placeholder="Ej: 100000"
                value={formulario.montoInicial}
                onChange={(event) =>
                  setFormulario((actual) => ({
                    ...actual,
                    montoInicial: event.target.value,
                  }))
                }
              />
            </label>

            <label className="block text-sm">
              <span className="label-ui mb-1 block">% fijo sugerido</span>
              <input
                placeholder="Ej: 30"
                value={formulario.porcentajeFijoSugerido}
                onChange={(event) =>
                  setFormulario((actual) => ({
                    ...actual,
                    porcentajeFijoSugerido: event.target.value,
                  }))
                }
              />
            </label>

            <label className="block text-sm">
              <span className="label-ui mb-1 block">Interés manual opcional</span>
              <input
                placeholder="Ej: 35000"
                value={formulario.interesManualOpcional}
                onChange={(event) =>
                  setFormulario((actual) => ({
                    ...actual,
                    interesManualOpcional: event.target.value,
                  }))
                }
              />
            </label>

            <label className="block text-sm">
              <span className="label-ui mb-1 block">Cantidad de cuotas</span>
              <input
                placeholder="Ej: 4"
                value={formulario.cantidadCuotas}
                onChange={(event) =>
                  setFormulario((actual) => ({
                    ...actual,
                    cantidadCuotas: event.target.value,
                  }))
                }
              />
            </label>

            <label className="block text-sm">
              <span className="label-ui mb-1 block">Frecuencia</span>
              <select
                value={formulario.frecuenciaTipo}
                onChange={(event) =>
                  setFormulario((actual) => ({
                    ...actual,
                    frecuenciaTipo: event.target.value as FrecuenciaTipo,
                  }))
                }
              >
                <option value="MENSUAL">Mensual</option>
                <option value="CADA_X_DIAS">Cada X días</option>
                <option value="FECHAS_MANUALES">Fechas manuales</option>
              </select>
            </label>

            {formulario.frecuenciaTipo === 'CADA_X_DIAS' && (
              <label className="block text-sm">
                <span className="label-ui mb-1 block">Cada cuántos días</span>
                <input
                  placeholder="Ej: 7"
                  value={formulario.frecuenciaCadaDias}
                  onChange={(event) =>
                    setFormulario((actual) => ({
                      ...actual,
                      frecuenciaCadaDias: event.target.value,
                    }))
                  }
                />
              </label>
            )}

            {formulario.frecuenciaTipo !== 'FECHAS_MANUALES' && (
              <label className="block text-sm">
                <span className="label-ui mb-1 block">Primer vencimiento</span>
                <input
                  type="date"
                  value={formulario.fechaPrimerVencimiento}
                  onChange={(event) =>
                    setFormulario((actual) => ({
                      ...actual,
                      fechaPrimerVencimiento: event.target.value,
                    }))
                  }
                />
              </label>
            )}

            {error && <p className="mensaje-error">{error}</p>}

            <div className="flex flex-wrap gap-2">
              <button type="submit" className="boton-principal" disabled={simular.isPending}>
                {simular.isPending ? 'Simulando...' : 'Simular cuotas'}
              </button>

              <button
                type="button"
                className="boton-secundario"
                disabled={!puedeDescargar}
                onClick={onDescargarPdf}
              >
                {descargarPdf.isPending ? 'Generando PDF...' : 'Descargar PDF'}
              </button>
            </div>
          </form>
        </SectionCard>

        <SectionCard titulo="Resultado" descripcion="Vista previa del plan estimado.">
          {simulacion ? (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <MiniResultado titulo="Monto inicial" valor={simulacion.montoInicial} />
                <MiniResultado titulo="Interés" valor={simulacion.interesAplicado} />
                <MiniResultado titulo="Total" valor={simulacion.totalADevolver} />
                <MiniResultado titulo="Cuota estimada" valor={simulacion.montoPorCuotaEstimado} />
              </div>

              <div className="tabla-ui overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Vencimiento</th>
                      <th>Monto</th>
                    </tr>
                  </thead>

                  <tbody>
                    {simulacion.cuotas.map((cuota) => (
                      <tr key={cuota.numeroCuota}>
                        <td>{cuota.numeroCuota}</td>
                        <td>{cuota.fechaVencimiento ?? 'A definir'}</td>
                        <td>{formatearMonedaSinCentavos(cuota.montoProgramado)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <EmptyState
              titulo="Sin simulación todavía"
              descripcion="Completá los datos y ejecutá la simulación para ver las cuotas estimadas."
            />
          )}
        </SectionCard>
      </div>
    </section>
  );
}
