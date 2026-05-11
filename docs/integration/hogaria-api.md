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

### 5) `GET /api/integration/hogaria/loans/{loanId}/payments`
Retorna pagos del préstamo:
- `id`
- `prestamoId`
- `fechaPago`
- `monto`
- `referenciaManual`
- `observaciones`
- `estado`

## Notas de integración con HogarIA
- **Impacto en contratos API**: se agregan contratos nuevos estables bajo `/api/integration/hogaria`; no se alteran contratos existentes.
- **Impacto en IDs**: se exponen IDs legacy `Long` del módulo actual; no hay UUID ni `profileId/accountId` en esta fase.
- **Impacto contable**: se mantiene separación explícita entre capital, interés, recupero y caja reutilizando métricas de servicios existentes.
