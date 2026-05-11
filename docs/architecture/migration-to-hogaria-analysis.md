# Análisis de migración del dominio de préstamos de cjprestamos hacia HogarIA

## 0) Alcance y método
- Este documento es una auditoría técnica estática (código fuente + migraciones + frontend) sin cambios de lógica en runtime.
- Se relevó backend (entidades, servicios, controladores, DTOs, repositorios, seguridad, Flyway) y frontend (rutas, páginas y clientes API).
- Se asume objetivo de integración progresiva en HogarIA preservando semántica contable de capital/interés/recupero/caja y **sin asumir que Persona = usuario autenticado**.

## 1) Entidades del dominio actual
### 1.1 Persona
- `Persona` es entidad operativa de deudor/contacto (no usuario de auth), con atributos de contexto manual (`alias`, `cobraEnFecha`, `tieneIngresoExtra`, etc.).
- Relación 1:N con `Prestamo`.
- ID actual: `Long` autoincremental.

### 1.2 Prestamo
- Núcleo del dominio: referencia a `Persona`, monto inicial, esquema de interés (porcentaje fijo sugerido o interés manual), cantidad/frecuencia de cuotas, estado.
- Relaciones: 1:N con `Cuota`, `Pago`, `EventoPrestamo`.
- Semántica de cálculo delegada a services (correcto para portabilidad).

### 1.3 Cuota
- Cuota programada por préstamo, con `montoProgramado`, `montoPagado`, estado (`PENDIENTE/PARCIAL/PAGADA`) y fecha de vencimiento opcional.
- Restricción única `(prestamo_id, numero_cuota)`.

### 1.4 Pago
- Pago registrado sobre préstamo, con fecha, monto, referencia manual, observación, estado.
- Imputación real se resuelve en `ImputacionPago`.

### 1.5 ImputacionPago
- Tabla/entidad puente entre `Pago` y `Cuota`, con monto imputado y fecha de imputación.
- Soporta pagos parciales/múltiples/dirigidos a cuotas seleccionadas.

### 1.6 EventoPrestamo
- Bitácora de eventos funcionales de préstamo (`tipo_evento`, `descripcion`, `fecha_evento`).
- Útil para trazabilidad y eventual auditoría en HogarIA.

### 1.7 Legajo y adjuntos
- Existen `LegajoPersona` (1:1 con `Persona`) y `LegajoAdjunto` (N:1 con legajo).
- Adjunto guarda metadatos y referencia de storage (`nombre_archivo_storage`), sin binarios en DB.

### 1.8 Usuarios/auth
- Existe `UsuarioSistema` separado del dominio de personas/deudores.
- Confirma separación conceptual requerida para HogarIA (deudor != usuario autenticado).

## 2) Servicios y reglas de negocio
### 2.1 Cálculo de préstamos
- `CalculadoraPrestamoService`: calcula interés aplicado, total a devolver y cuota sugerida.
- Reglas: prioridad a interés manual sobre porcentaje, validaciones de negativos, normalización monetaria.

### 2.2 Simulador
- `SimuladorPrestamoService`: usa calculadora + distribución de cuotas + cálculo de fechas por frecuencia.
- Incluye salida PDF (OpenPDF) como capability acoplada al backend actual.

### 2.3 Generación/ajuste de cuotas
- `CuotaService`: generación automática/manual, ajustes futuros y registro de eventos.
- Mantiene reglas de estado de cuota y consistencia con préstamo.

### 2.4 Pagos e imputaciones
- `PagoService`: valida monto/estado de préstamo/cuotas objetivo, distribuye imputaciones, actualiza estado de cuota y eventualmente finaliza préstamo.
- Registra `EventoPrestamo` al cobrar.

### 2.5 Dashboard
- `DashboardService` separa métricas de inversión activa, capital recuperado, ganancia realizada/proyectada y deuda/cartera.
- También calcula proyecciones 30/60/90 y mora por vencimiento.

### 2.6 Control de caja
- Implementado dentro de `DashboardService` (`obtenerControlCaja`), usando pagos y préstamos activos.
- Buena base para extraer a módulo contable de HogarIA.

## 3) Controllers y endpoints relevantes
- Prefijo general `/api` con Basic Auth global (excepto health).
- Módulos principales:
  - Personas: CRUD en `/api/personas`.
  - Préstamos: alta/listado/detalle/activos, cálculo, simulación y PDF en `/api/prestamos`.
  - Cuotas: generar/listar/ajustar en `/api/prestamos/{prestamoId}/cuotas`.
  - Pagos: registrar y listar en `/api/pagos` y `/api/prestamos/{prestamoId}/pagos`.
  - Dashboard: `/api/dashboard/resumen` y `/api/dashboard/control-caja`.
  - Legajo: `/api/personas/{personaId}/legajo` + adjuntos.
  - Auth/usuarios: `/api/auth/me`, `/api/usuarios`.

## 4) DTOs
- El backend usa DTOs de request/response por módulo (no expone entidades JPA directo).
- Fortalezas: contratos explícitos para frontend y potencial fachada API hacia HogarIA.
- Oportunidad: versionado de contratos (`/v1`) y DTOs con IDs duales (`legacyId` + `uuid`) para transición.

## 5) Repositories
- Repositorios Spring Data por agregado (`Persona`, `Prestamo`, `Cuota`, `Pago`, `ImputacionPago`, `EventoPrestamo`, `Legajo`, `UsuarioSistema`).
- Consultas orientadas a listados por estado/fecha/relación; suficiente para primer puente API.

## 6) Migraciones Flyway
- V1 crea núcleo dominio (persona/prestamo/cuota/pago/imputacion/evento) + índices.
- V2 agrega legajo persona.
- V3 agrega usuarios sistema/auth.
- V4 agrega adjuntos de legajo.
- No se detectan columnas `UUID`, `profile_id` o `account_id` aún.

## 7) Seguridad actual
- `SecurityConfig`: Basic Auth, CSRF disabled, CORS configurable, `/api/health` público.
- Estado adecuado para MVP interno, insuficiente para ecosistema HogarIA multi-cuenta/multi-tenant.
- Riesgos: credenciales básicas en frontend, sin scopes, sin auditoría de claims por operación.

## 8) Frontend: rutas, páginas y clientes API
- Rutas principales: dashboard, control-caja, personas, préstamos, simulador, legajos.
- Cliente `axios` central con Authorization Basic en header global.
- Servicios API separados por módulo (`personas`, `prestamos`, `pagos`, `dashboard`, `legajos`).
- Hay pantalla de login operadora y control de sesión local; no hay OAuth/JWT.

## 9) Partes portables casi directo a HogarIA
1. **Reglas matemáticas puras** (`CalculadoraPrestamoService`).
2. **Lógica de imputación** de pago a cuotas (si se encapsula sin dependencias HTTP).
3. **Modelo de cuotas y estados** (pendiente/parcial/pagada).
4. **Métricas de recuperación y ganancia** del dashboard/control caja.
5. **Bitácora de eventos** de préstamo como audit trail funcional.

## 10) Partes que requieren refactor para integración
### 10.1 IDs Long -> UUID
- Recomendado migrar por fases con doble columna (`id` legacy Long + `uuid` único) y luego promover UUID como ID público/API.

### 10.2 profileId/accountId
- Agregar en `Prestamo` y opcionalmente en `Persona` campos de pertenencia externa (`profileId`, `accountId`) con índices.
- Validar tenancy en capa de servicio antes de cualquier operación.

### 10.3 Seguridad
- Reemplazar Basic Auth por token-based (JWT/OIDC) con claims de tenant/rol/cuenta.
- Introducir autorización por recurso (evitar acceso cruzado por IDs).

### 10.4 Categorías
- El dominio actual no muestra taxonomía de categorías de préstamo/gasto/cobro.
- Incluir catálogo versionado para reportabilidad HogarIA.

### 10.5 Movimientos
- Actualmente pagos e inversión se usan para caja, pero falta un ledger explícito de movimientos contables atomizados.
- Recomendado agregar `MovimientoCaja` derivado de eventos de negocio para conciliación.

### 10.6 Planificación mensual
- Hay proyecciones en dashboard, pero no planificación mensual explícita por cuenta/perfil.
- Recomendado módulo de planificación sobre cuotas futuras + metas + escenarios.

## 11) Qué NO conviene migrar todavía
1. Generación PDF embebida en backend de préstamos (mejor extraer luego como servicio documental).
2. Gestión de archivos de legajo sin definir estándar común de storage/ACL en HogarIA.
3. UX interna específica de operación manual si HogarIA aún no definió flujo equivalente.

## 12) Riesgos de migración
- **Riesgo semántico**: mezclar capital recuperado con interés realizado al migrar métricas.
- **Riesgo de identidad**: asumir `Persona` como `User` del ecosistema.
- **Riesgo de autorización**: exponer IDs secuenciales sin aislamiento de tenant.
- **Riesgo de data quality**: préstamos históricos con ajustes manuales requieren estrategia de compatibilidad.
- **Riesgo operativo**: doble escritura sin idempotencia puede duplicar pagos/imputaciones.

## 13) Estrategia recomendada de migración
### Fase A — Puente temporal por API (recomendada primera)
- Mantener backend actual como “engine de dominio” y exponer/consumir APIs desde HogarIA.
- Introducir en contratos campos externos (`profileId`, `accountId`, `externalLoanId`) y trazas de correlación.
- Implementar idempotencia en alta de pago/imputación.

### Fase B — Absorción progresiva
- Extraer primero servicios puros: calculadora, imputador, dashboard matemático.
- Luego migrar agregados `Prestamo/Cuota/Pago/Imputacion` con pruebas de regresión contable.
- Mantener adaptadores para legacy IDs durante transición.

### Fase C — Retiro del backend independiente
- Cuando HogarIA cubra seguridad, tenancy, movimientos y reporting, desactivar endpoints legacy gradualmente.
- Ejecutar plan de deprecación con fechas, métricas de uso y rollback.

## 14) Tabla de mapeo “Entidad actual → Entidad propuesta en HogarIA”
| Entidad actual cjprestamos | Entidad propuesta en HogarIA | Estado sugerido | Notas de migración |
|---|---|---|---|
| Persona | BorrowerProfile (o DebtorContact) | Migrar con adaptación | No mapear a User; agregar `profileId/accountId` y UUID público. |
| Prestamo | LoanContract | Migrar prioritario | Preservar separación capital/interés y estados operativos. |
| Cuota | LoanInstallment | Migrar prioritario | Mantener `montoProgramado`, `montoPagado`, estado y vencimiento. |
| Pago | LoanPayment | Migrar prioritario | Requiere idempotencia y trazabilidad de origen. |
| ImputacionPago | PaymentAllocation | Migrar prioritario | Es clave para exactitud matemática. |
| EventoPrestamo | LoanEvent / DomainAuditEvent | Migrar prioritario | Unificar catálogo de tipos de evento. |
| LegajoPersona | BorrowerDossier | Migrar posterior | Depende de estrategia documental HogarIA. |
| LegajoAdjunto | DossierAttachment | Migrar posterior | Definir storage, ACL, antivirus y retención. |
| UsuarioSistema | OperatorUser (IAM HogarIA) | No migrar directo | Reemplazar por proveedor IAM central. |

## 15) Recomendaciones ejecutables de corto plazo (sin cambiar lógica)
1. Definir contrato canónico de dinero y redondeo compartido entre ambos sistemas.
2. Congelar catálogo de estados/eventos y documentar equivalencias para migración.
3. Diseñar estrategia dual-ID y plan de backfill UUID.
4. Especificar controles de autorización por `accountId` antes de abrir integración productiva.
5. Crear suite de “pruebas de paridad contable” con casos de pagos parciales/múltiples/adelantados.
