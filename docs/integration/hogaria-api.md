# API de integración temporal con HogarIA (read-only)

## Objetivo
Exponer endpoints de lectura bajo `/api/integration/hogaria` para consumo del backend de HogarIA durante la fase puente legacy.

- **Solo lectura**.
- **No reemplaza** endpoints operativos existentes.
- **Autenticación**: Basic Auth vigente del MVP.

## Seguridad y limitaciones vigentes
- Se mantiene el esquema de Basic Auth actual del backend.
- Esta autenticación es válida solo para contexto interno MVP y no provee aislamiento multi-cuenta por `accountId`.
- Este bridge **no introduce** `profileId`/`accountId` aún (decisión explícita de transición legacy temporal).

## Endpoints

### 1) `GET /api/integration/hogaria/loans/active`
Retorna préstamos activos con resumen económico por préstamo.

No expone préstamos eliminados operativamente (`eliminado=true`).

Campos:
- `id`
- `personaId`
- `personaNombre`
- `montoInicial`
- `cantidadCuotas`
- `frecuenciaTipo`
- `estado`
- `totalCobrado`
- `totalPendiente`
- `gananciaRealizada`
- `gananciaProyectada`
- `createdAt`
- `updatedAt`

### 2) `GET /api/integration/hogaria/dashboard`
Retorna `HogariaDashboardResponse` (contrato estable de integración):
- `montoInvertido`
- `montoGanado`
- `montoPorGanar`
- `deudaTotal`
- `prestamosActivos`

### 3) `GET /api/integration/hogaria/control-caja`
Retorna `HogariaCashControlResponse` (contrato estable de integración):
- `cajaDisponible`
- `inversionActiva`
- `capitalRecuperado`
- `capitalPendiente`
- `gananciaRealizada`
- `gananciaProyectada`
- `ingresosMesActual`
- `egresosMesActual`
- `balanceMesActual`
- `proyeccionCobro30Dias`
- `proyeccionCobro60Dias`
- `proyeccionCobro90Dias`
- `carteraEnMora`
- `cuotasPendientes`
- `cuotasVencenProximos7Dias`
- `recuperoCapitalPorcentaje`
- `rendimientoEsperadoPorcentaje`

### 4) `GET /api/integration/hogaria/loans/{loanId}/installments`
Retorna cuotas del préstamo:
- `id`
- `prestamoId`
- `numeroCuota`
- `fechaVencimiento`
- `montoProgramado`
- `montoPagado`
- `saldoPendiente`
- `estado`

Si el préstamo está eliminado operativamente, responde `404` para no exponer historial fuera del módulo interno.

### 5) `GET /api/integration/hogaria/loans/{loanId}/payments`
Retorna pagos del préstamo. La composición contable se calcula por pago en orden cronológico:
- mientras el cobrado acumulado no supera `montoInicial`, se imputa a `principalRecovered`;
- al superar `montoInicial`, el excedente se imputa a `interestCollected`.

- `id`
- `prestamoId`
- `fechaPago`
- `monto`
- `principalRecovered`
- `interestCollected`
- `referenciaManual`
- `observaciones`
- `estado`

Si el préstamo está eliminado operativamente, responde `404` para no exponer historial fuera del módulo interno.

## Notas de integración con HogarIA
- **Impacto en contratos API**: los endpoints excluyen préstamos eliminados por baja lógica; las consultas directas de cuotas/pagos sobre un préstamo eliminado responden `404`.
- **Impacto en IDs**: se exponen IDs legacy `Long` del módulo actual; no hay UUID ni `profileId/accountId` en esta fase.
- **Impacto contable**: se mantiene separación explícita entre capital, interés, recupero y caja reutilizando métricas de servicios existentes, siempre filtrando préstamos eliminados en métricas operativas.
