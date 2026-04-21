import { FormEvent, useMemo, useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { SectionCard } from '../../components/ui/SectionCard';
import { formatearMonedaSinCentavos } from '../../utils/moneda';
import {
  descargarPdfSimulacionPrestamo,
  simularPrestamo,
} from '../../services/prestamos/prestamosApi';
import type { FrecuenciaTipo, SimulacionPrestamoPayload, SimulacionPrestamoResponse } from './types/prestamo';

type FormularioSimulador = {
  montoInicial: string;
  porcentajeFijoSugerido: string;
  interesManualOpcional: string;
  cantidadCuotas: string;
  frecuenciaTipo: FrecuenciaTipo;
  frecuenciaCadaDias: string;
  fechaPrimerVencimiento: string;
};

const formularioInicial: FormularioSimulador = {
  montoInicial: '',
  porcentajeFijoSugerido: '',
  interesManualOpcional: '',
  cantidadCuotas: '4',
  frecuenciaTipo: 'MENSUAL',
  frecuenciaCadaDias: '7',
  fechaPrimerVencimiento: '',
};

function numeroOpcional(valor: string): number | null {
  const v = valor.trim();
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.ceil(n) : null;
}

function construirPayload(formulario: FormularioSimulador): SimulacionPrestamoPayload {
  const montoInicial = Number(formulario.montoInicial);
  const cantidadCuotas = Number(formulario.cantidadCuotas);

  if (!Number.isFinite(montoInicial) || montoInicial <= 0) {
    throw new Error('Ingresá un monto inicial válido mayor a 0.');
  }

  if (!Number.isInteger(cantidadCuotas) || cantidadCuotas <= 0) {
    throw new Error('Ingresá una cantidad de cuotas válida.');
  }

  return {
    montoInicial: Math.ceil(montoInicial),
    porcentajeFijoSugerido: numeroOpcional(formulario.porcentajeFijoSugerido),
    interesManualOpcional: numeroOpcional(formulario.interesManualOpcional),
    cantidadCuotas,
    frecuenciaTipo: formulario.frecuenciaTipo,
    frecuenciaCadaDias: formulario.frecuenciaTipo === 'CADA_X_DIAS' ? Number(formulario.frecuenciaCadaDias) : null,
    fechaPrimerVencimiento: formulario.frecuenciaTipo === 'FECHAS_MANUALES' ? null : formulario.fechaPrimerVencimiento || null,
  };
}

export function SimuladorPrestamosPage() {
  const [formulario, setFormulario] = useState<FormularioSimulador>(formularioInicial);
  const [simulacion, setSimulacion] = useState<SimulacionPrestamoResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [descargando, setDescargando] = useState(false);

  const puedeDescargar = useMemo(() => simulacion !== null && !descargando, [simulacion, descargando]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      setCargando(true);
      const payload = construirPayload(formulario);
      const response = await simularPrestamo(payload);
      setSimulacion(response);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo simular el préstamo.');
    } finally {
      setCargando(false);
    }
  };

  const onDescargarPdf = async () => {
    try {
      setDescargando(true);
      const payload = construirPayload(formulario);
      const blob = await descargarPdfSimulacionPrestamo(payload);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'simulacion-prestamo.pdf';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo generar el PDF.');
    } finally {
      setDescargando(false);
    }
  };

  return (
    <section className="space-y-5">
      <PageHeader
        titulo="Simulador de préstamos"
        descripcion="Estimá el plan de cuotas antes de registrar el préstamo real."
        breadcrumbs={[{ etiqueta: 'Inicio', to: '/' }, { etiqueta: 'Simulador' }]}
      />

      <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
        <SectionCard titulo="Parámetros" descripcion="Definí monto, interés y frecuencia de cobro.">
          <form className="space-y-3" onSubmit={onSubmit}>
            <input placeholder="Monto inicial" value={formulario.montoInicial} onChange={(e) => setFormulario((f) => ({ ...f, montoInicial: e.target.value }))} />
            <input
              placeholder="% fijo sugerido"
              value={formulario.porcentajeFijoSugerido}
              onChange={(e) => setFormulario((f) => ({ ...f, porcentajeFijoSugerido: e.target.value }))}
            />
            <input
              placeholder="Interés manual (opcional)"
              value={formulario.interesManualOpcional}
              onChange={(e) => setFormulario((f) => ({ ...f, interesManualOpcional: e.target.value }))}
            />
            <input
              placeholder="Cantidad de cuotas"
              value={formulario.cantidadCuotas}
              onChange={(e) => setFormulario((f) => ({ ...f, cantidadCuotas: e.target.value }))}
            />
            <select
              value={formulario.frecuenciaTipo}
              onChange={(e) => setFormulario((f) => ({ ...f, frecuenciaTipo: e.target.value as FrecuenciaTipo }))}
            >
              <option value="MENSUAL">Mensual</option>
              <option value="CADA_X_DIAS">Cada X días</option>
              <option value="FECHAS_MANUALES">Fechas manuales</option>
            </select>
            {formulario.frecuenciaTipo === 'CADA_X_DIAS' && (
              <input
                placeholder="Cada cuántos días"
                value={formulario.frecuenciaCadaDias}
                onChange={(e) => setFormulario((f) => ({ ...f, frecuenciaCadaDias: e.target.value }))}
              />
            )}
            {formulario.frecuenciaTipo !== 'FECHAS_MANUALES' && (
              <input
                type="date"
                value={formulario.fechaPrimerVencimiento}
                onChange={(e) => setFormulario((f) => ({ ...f, fechaPrimerVencimiento: e.target.value }))}
              />
            )}

            {error && <p className="mensaje-error">{error}</p>}

            <div className="flex gap-2">
              <button type="submit" className="boton-principal" disabled={cargando}>
                {cargando ? 'Simulando...' : 'Simular cuotas'}
              </button>
              <button type="button" className="boton-secundario" disabled={!puedeDescargar} onClick={onDescargarPdf}>
                {descargando ? 'Generando PDF...' : 'Descargar PDF'}
              </button>
            </div>
          </form>
        </SectionCard>

        <SectionCard titulo="Resultado" descripcion="Vista previa del plan estimado.">
          {simulacion ? (
            <div className="space-y-3">
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                <div className="panel-soft p-3 text-sm">Monto inicial: <strong>{formatearMonedaSinCentavos(simulacion.montoInicial)}</strong></div>
                <div className="panel-soft p-3 text-sm">Interés: <strong>{formatearMonedaSinCentavos(simulacion.interesAplicado)}</strong></div>
                <div className="panel-soft p-3 text-sm">Total: <strong>{formatearMonedaSinCentavos(simulacion.totalADevolver)}</strong></div>
                <div className="panel-soft p-3 text-sm">Cuota estimada: <strong>{formatearMonedaSinCentavos(simulacion.montoPorCuotaEstimado)}</strong></div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left dark:border-slate-700">
                      <th className="px-2 py-2">#</th>
                      <th className="px-2 py-2">Vencimiento</th>
                      <th className="px-2 py-2">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {simulacion.cuotas.map((cuota) => (
                      <tr key={cuota.numeroCuota} className="border-b border-slate-100 dark:border-slate-800">
                        <td className="px-2 py-2">{cuota.numeroCuota}</td>
                        <td className="px-2 py-2">{cuota.fechaVencimiento ?? 'A definir'}</td>
                        <td className="px-2 py-2">{formatearMonedaSinCentavos(cuota.montoProgramado)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-600 dark:text-slate-300">Completá los datos y ejecutá la simulación para ver las cuotas estimadas.</p>
          )}
        </SectionCard>
      </div>
    </section>
  );
}
