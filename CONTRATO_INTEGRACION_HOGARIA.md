# CONTRATO_INTEGRACION_HOGARIA

## 1. Propósito del documento
Este contrato define una base técnica y operativa para integrar **cjprestamos** con **HogarIA**, tomando como insumo el análisis del repositorio `https://github.com/JerePrograma/hogaria` (rama default al 2026-05-14).

Objetivo principal:
- garantizar consumo confiable de datos de préstamos,
- preservar separación contable (capital / interés / recupero / caja),
- reducir acoplamiento entre bounded contexts,
- habilitar evolución por versiones y feature flags.

---

## 2. Resumen ejecutivo del análisis de HogarIA

### 2.1 Stack y arquitectura detectada
- **Backend**: Java + Spring Boot + Maven + Flyway + JWT.
- **Frontend**: React + TypeScript + Vite.
- **Módulo de integración**: `backend/src/main/java/com/hogaria/integration/cjprestamos`.
- **Superficie API de integración en HogarIA**: `/api/profiles/{profileId}/external-loans/**`.

### 2.2 Modelo de integración implementado
HogarIA está diseñado para consumir a cjprestamos como sistema externo:
- **read-only por defecto** para consulta (`summary`),
- **sync contable manual y opcional** (fase 2) bajo `CJP_SYNC_ENABLED=true`,
- validación de configuración + diagnóstico de salud,
- manejo de idempotencia para evitar duplicaciones en sync.

### 2.3 Señales de madurez observadas
- Hay separación de cliente HTTP (`HttpCjPrestamosClient`), servicio de orquestación (`ExternalLoansService`) y controller (`ExternalLoansController`).
- Hay contrato DTO remoto explícito (records Java por endpoint).
- Hay migraciones para mapeo e idempotencia (`external_sync_mapping`, config de sync).
- Existe documento interno de integración en `docs/integracion-hogaria-cjprestamos.md`.

---

## 3. Límites de dominio (Bounded Context Contract)

## 3.1 System of Record acordado

### cjprestamos (autoridad)
- Personas / deudores
- Préstamos
- Cuotas
- Pagos
- Imputaciones
- Legajos

### HogarIA (autoridad)
- Usuarios / perfiles (`profileId`)
- Cuentas
- Categorías
- Movimientos financieros
- Presupuesto / planificación

## 3.2 Regla de oro
**HogarIA no debe recalcular la lógica core de préstamo**. Debe consumir resultados consolidados desde cjprestamos o derivados contractuales controlados.

---

## 4. Contrato API consumido por HogarIA (hacia cjprestamos)

Base remota esperada por HogarIA: `CJP_BASE_URL + CJP_API_PREFIX` (prefijo resuelto internamente en propiedades de integración).

## 4.1 Endpoints remotos requeridos
1. `GET /api/integration/hogaria/loans/active`
2. `GET /api/integration/hogaria/dashboard`
3. `GET /api/integration/hogaria/control-caja`
4. `GET /api/integration/hogaria/loans/{loanId}/installments`
5. `GET /api/integration/hogaria/loans/{loanId}/payments`

## 4.2 Headers de contexto funcional
HogarIA envía:
- `X-Profile-Id: <uuid>`
- `X-User-Id: <uuid>`

> Recomendación contractual: cjprestamos debe tratarlos como contexto operativo/auditoría, no como autorización principal si ya usa Basic Auth para integración sistema-a-sistema.

## 4.3 Autenticación esperada
- HogarIA usa **Basic Auth** al invocar cjprestamos (`CJP_USERNAME` / `CJP_PASSWORD`).
- Riesgo conocido en HogarIA: controles internos con `X-User-Id` en controller para acciones del usuario.

---

## 5. Esquemas de datos remotos inferidos desde el código de HogarIA

## 5.1 `loans/active` (array)
Campos esperados por item:
- `id: number`
- `personaId: number`
- `personaNombre: string`
- `montoInicial: decimal`
- `cantidadCuotas: number`
- `frecuenciaTipo: string`
- `estado: string`
- `totalCobrado: decimal`
- `totalPendiente: decimal`
- `gananciaRealizada: decimal`
- `gananciaProyectada: decimal`
- `createdAt: datetime`
- `updatedAt: datetime`

## 5.2 `dashboard` (objeto)
- `montoInvertido: decimal`
- `montoGanado: decimal`
- `montoPorGanar: decimal`
- `deudaTotal: decimal`
- `prestamosActivos: number`

## 5.3 `control-caja` (objeto)
- `cajaDisponible: decimal`
- `inversionActiva: decimal`
- `capitalRecuperado: decimal`
- `capitalPendiente: decimal`
- `gananciaRealizada: decimal`
- `gananciaProyectada: decimal`
- `ingresosMesActual: decimal`
- `egresosMesActual: decimal`
- `balanceMesActual: decimal`
- `proyeccionCobro30Dias: decimal`
- `proyeccionCobro60Dias: decimal`
- `proyeccionCobro90Dias: decimal`
- `carteraEnMora: decimal`
- `cuotasPendientes: number`
- `cuotasVencenProximos7Dias: number`
- `recuperoCapitalPorcentaje: decimal`
- `rendimientoEsperadoPorcentaje: decimal`

## 5.4 `loans/{loanId}/payments` (array)
- `id: number`
- `prestamoId: number`
- `fechaPago: date`
- `monto: decimal`
- `principalRecovered: decimal`
- `interestCollected: decimal`
- `referenciaManual: string`
- `observaciones: string`
- `estado: string`

> Regla crítica observada: si `principalRecovered` o `interestCollected` llegan nulos, HogarIA considera error de contrato y corta el flujo de ese pago.

---

## 6. Contrato funcional de sincronización contable (fase 2)

## 6.1 Eventos contables que HogarIA genera desde datos de cjprestamos
1. `DISBURSEMENT` (desembolso del préstamo)
2. `PAYMENT_PRINCIPAL_RECOVERY` (recupero de capital)
3. `PAYMENT_INTEREST_INCOME` (ingreso por interés)

## 6.2 Reglas mínimas para cjprestamos
- Proveer **split explícito** de pago: principal vs interés.
- Mantener estabilidad semántica de `estado` y fechas de pago.
- Entregar IDs estables por préstamo/pago para idempotencia externa.

## 6.3 Idempotencia
HogarIA ya trabaja con mapping de eventos procesados. Para que sea robusto entre sistemas:
- `loan.id` y `payment.id` deben ser inmutables.
- Reintentos de red deben retornar mismos IDs y valores.
- Si existe corrección retroactiva, debe definirse contrato de reversa/ajuste (no implícito).

---

## 7. Requisitos no funcionales del contrato

## 7.1 Disponibilidad y resiliencia
- Timeouts configurables (`CJP_CONNECT_TIMEOUT_MS`, `CJP_READ_TIMEOUT_MS`).
- Respuesta de diagnóstico (`health`) en HogarIA que distinga:
  - `MISCONFIGURED`
  - `OK`
  - `UNAUTHORIZED`
  - `UNAVAILABLE`

## 7.2 Manejo de errores remoto
Interpretación actual en HogarIA:
- `401/403` -> autenticación/autorización rechazada.
- `5xx` -> servicio no disponible.
- otros `4xx` -> error HTTP genérico.

## 7.3 Observabilidad mínima recomendada
- Correlation ID por request entre ambos sistemas.
- Logs estructurados con:
  - endpoint lógico,
  - status HTTP remoto,
  - profileId,
  - duración,
  - cantidad de eventos creados/omitidos.

---

## 8. Seguridad: estado real y brechas

## 8.1 Estado actual detectado
- Integración sistema-a-sistema con Basic Auth.
- Uso de headers `X-User-Id`/`X-Profile-Id` para contexto.
- En HogarIA, el controller de external-loans pide `X-User-Id` explícito.

## 8.2 Riesgos
- Suplantación si headers de identidad se usan como control fuerte.
- Exposición de credenciales Basic Auth si no hay canal seguro/secret manager.
- Sync accidental en producción si `CJP_SYNC_ENABLED` queda activo sin procedimiento.

## 8.3 Recomendación contractual de evolución
1. Mantener read-only como default operativo.
2. Migrar autenticación entre sistemas a token firmado de servicio (mTLS u OAuth2 client credentials).
3. Firmar o validar contexto de usuario/perfil fuera de headers spoofeables.
4. Agregar allowlist IP + rate limit para endpoints de integración.

---

## 9. Compatibilidad de IDs y mapeos

## 9.1 Situación
- HogarIA opera con `UUID` para `profileId/userId`.
- cjprestamos expone IDs numéricos en entidades de préstamos/pagos.

## 9.2 Contrato recomendado
- Mantener IDs locales de préstamo/pago como `Long` en integración (sin cast ambiguo).
- Agregar, cuando sea posible, `externalRef` estable y legible para auditoría humana.
- No asumir que `personaId` de cjprestamos equivale a `profileId` de HogarIA.

## 9.3 Tabla de mapeo conceptual
- `profileId (HogarIA)` ↔ configuración de sync (`external_loan_sync_config`) ↔ categorías/cuenta destino
- `loan.id (cjprestamos)` ↔ evento `DISBURSEMENT`
- `payment.id (cjprestamos)` ↔ eventos `PAYMENT_*`

---

## 10. Versionado del contrato

## 10.1 Política propuesta
- Versionado de prefijo remoto: `/api/integration/hogaria/v1/...` (si aún no existe, planificar).
- Cambios breaking: nueva versión (`v2`) + convivencia temporal.
- Cambios additive: permitidos en misma versión (campos opcionales).

## 10.2 Definición de breaking change
- Renombrar/eliminar campos actuales consumidos.
- Cambiar tipo de dato (ej. decimal -> string).
- Alterar semántica de split capital/interés.
- Modificar códigos HTTP esperados sin transición.

---

## 11. Matriz de pruebas de contrato (recomendada)

## 11.1 Casos read-only
- Resumen OK con datos reales.
- Resumen OK sin préstamos activos.
- Error 401 remoto (credenciales inválidas).
- Error 500 remoto.
- Timeout de conexión.

## 11.2 Casos sync/dry-run
- Dry-run con 1 préstamo y pagos con split válido.
- Sync real con idempotencia (segunda ejecución no duplica).
- Pago con `principalRecovered=null` -> error controlado.
- Config de sync incompleta -> `BadRequest`.
- Categorías/cuenta fuera de profile -> rechazo.

## 11.3 Criterios de aceptación
- Cero duplicados ante reintentos.
- Separación contable intacta en movimientos generados.
- Mensajes de error diagnósticos y accionables.

---

## 12. Roadmap sugerido de integración

## Corto plazo
- Congelar contrato v1 documentado en OpenAPI/JSON Schema.
- Añadir tests contractuales automáticos (consumer-driven o pact-like).
- Estandarizar catálogo de errores (`code`, `message`, `details`).

## Mediano plazo
- Endurecer autenticación S2S y firma de contexto.
- Introducir correlación distribuida y tablero de salud del conector.
- Definir política de correcciones retroactivas de pagos.

## Largo plazo
- Event-driven integration (outbox/webhooks) para near real-time.
- Reconciliación automática diaria con reporte de diferencias.

---

## 13. Decisiones operativas recomendadas para cjprestamos

1. Mantener explícita la separación **capital / interés / recupero / caja** en API y reportes.
2. Considerar los endpoints de HogarIA como consumidor externo formal (evitar cambios no versionados).
3. Documentar SLA de disponibilidad y ventana de mantenimiento.
4. Proveer endpoint de health específico de integración (si no existe, agregar).
5. Publicar ejemplos de payload reales anonimizados para pruebas de contrato.

---

## 14. Estado final de este análisis
**Estado: HECHA (documentación).**

Este archivo constituye una propuesta de contrato técnico-operativo de integración basada en el estado actual del repositorio HogarIA analizado el **14 de mayo de 2026**.
