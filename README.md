# cjprestamos

Sistema web interno de préstamos para conocidos, diseñado para una operadora principal con enfoque **manual-first**.

## En una frase

Una libreta digital operativa para registrar personas, préstamos, cuotas y pagos con matemática simple confiable, sin complejidad fintech innecesaria.

---

## Qué es y qué no es

### Sí es
- Un sistema interno para control diario de operación.
- Un asistente de cálculo y orden administrativo.
- Un punto de control económico con métricas claras.
- Matemática monetaria sin centavos: los importes se normalizan sin decimales con redondeo hacia arriba.

### No es
- Fintech.
- Banco.
- Plataforma de cobranza automática.

---

## Recorrido rápido (2-3 minutos)

1. Iniciar sesión con el usuario inicial configurado por variables de entorno.
2. Ir a **Personas** y cargar una persona.
3. Ir a **Préstamos** → **Nuevo préstamo** y registrar operación.
4. Abrir el **Workspace del préstamo** para:
   - revisar resumen económico,
   - generar/cargar cuotas,
   - registrar pagos.
5. Volver al **Dashboard** para ver:
   - monto inicial,
   - monto ganado,
   - monto por ganar,
   - deuda total,
   - préstamos activos.
6. Usar **Legajos** cuando se necesite contexto privado/adjuntos separado del flujo operativo principal.

---

## Módulos operativos

## 1) Dashboard
Punto de control de la jornada.
- KPIs económicos principales.
- Listados recientes de préstamos y personas activas.
- Acciones rápidas para continuar flujo sin fricción.

## 2) Personas
Libreta de personas conocidas.
- CRUD operativo.
- Búsqueda por nombre/alias/teléfono.
- Baja lógica con `activo=false`; el listado operativo muestra activas por defecto.
- Filtros para ver activas, dadas de baja o todas.
- Detalle editable y acceso al legajo relacionado.

## 3) Préstamos
Flujo económico principal.
- Alta de préstamo.
- Listado + selección.
- Eliminación operativa con `eliminado=true`; no se borran cuotas, pagos ni eventos.
- Los listados principales excluyen préstamos eliminados por defecto.
- Workspace por préstamo:
  - Resumen,
  - Cuotas,
  - Pagos.

## 4) Legajos
Contexto separado de la operación económica.
- Legajo por persona.
- Adjuntos (alta/listado/descarga/eliminación).

---

## Reglas operativas de baja lógica

- `Persona.activo=false` representa una persona dada de baja. No aparece en Dashboard ni en listados operativos por defecto, pero puede consultarse desde Personas con filtro **Dadas de baja** o **Todas**.
- No se pueden crear préstamos nuevos para personas dadas de baja.
- Los préstamos existentes de una persona dada de baja siguen visibles si no están eliminados, porque pueden conservar deuda o historial pendiente.
- `Prestamo.eliminado=true` representa eliminación operativa. El préstamo se oculta de listados, Dashboard, control de caja, reportes principales e integración HogarIA.
- La eliminación operativa de un préstamo no borra cuotas, pagos, imputaciones ni eventos asociados; el detalle directo por id conserva `eliminado=true` para auditoría interna.

---

## Arquitectura de pantallas (frontend)

- `LayoutPrincipal` (navegación principal + búsqueda contextual + atajos)
  - `/` → `DashboardPage`
  - `/personas` → `PersonasPage`
  - `/prestamos` → `PrestamosPage`
  - `/legajos` → `LegajosPage`

El diseño prioriza:
- navegación obvia,
- contexto visible del módulo,
- reducción de saturación,
- continuidad entre pantallas.

---

## Capturas esperadas (guía visual)

> Nota: este README describe cómo debería verse/respirarse la UI, sin prometer elementos no implementados.

- **Layout principal:** menú lateral con descripciones de módulos + atajos operativos.
- **Dashboard:** cards económicas limpias, acciones rápidas, listados recientes útiles.
- **Personas:** búsqueda arriba, listado escaneable y detalle claro en paralelo.
- **Préstamos:** encabezado de flujo + listado/Workspace con cambio rápido en móvil.
- **Legajos:** selector simple de persona + panel dedicado cuando hay selección.

---

## Estado actual del MVP

### Núcleo operativo principal (MVP) — CERRADO
- Personas: CRUD backend y UI operativa.
- Préstamos: alta, listado, detalle y cálculo sugerido.
- Cuotas: generación automática/manual desde UI y backend.
- Pagos: registro con imputación automática y selección opcional de cuotas destino.
- Dashboard: métricas principales visibles.
- Referencias y colores: soporte implementado.

### Evolución post-MVP inmediata — CERRADA
- Legajo por persona en Personas y en ruta dedicada `/legajos`.
- Adjuntos del legajo con storage local configurable.
- Seguridad mínima con login frontend + backend Basic Auth.
- Bootstrap idempotente de usuario inicial `admin`.
- Renegociación manual de cuotas futuras con registro histórico.

### UX/UI operación (abril 2026) — CERRADA
- Navegación principal reforzada con contexto de módulo y atajos.
- Encabezados de pantalla estandarizados (breadcrumbs, estado y acciones).
- Dashboard más accionable (quick actions + recientes).
- Patrones reutilizables (`PageHeader`, `SectionCard`, `EmptyState`, `StatusPill`).
- Mejor continuidad Dashboard → Personas → Préstamos → Legajos.
- Mejor soporte mobile en flujo de préstamos (explorar/operar).

Para estado detallado: ver `ESTADO_REAL_MVP.md` y `BACKLOG_CODEX.md`.

---


## Integración con HogarIA (estado real)

HogarIA ya cuenta con módulo `external-loans` (cliente hacia cjprestamos, summary, sync-config y sync).

Resumen y riesgos actuales de esta integración:
- ver `docs/integracion-hogaria-cjprestamos.md`.
- estado recomendado actual: **read-only**.
- sync: **fase 2 condicionada** (no documentado como baseline de producción hasta cerrar seguridad/read-only e idempotencia).

---

## Stack actual

### Backend
- Java 21
- Spring Boot 3.x
- Maven
- Spring Web
- Spring Data JPA
- PostgreSQL
- Flyway
- Bean Validation
- Spring Security simple
- JUnit 5 + Mockito

### Frontend
- React
- TypeScript
- Vite
- React Router
- TanStack Query
- Axios
- Tailwind CSS

---

## Desarrollo local

## 1) Backend

Requisitos:
- Java 21
- PostgreSQL activo en `localhost:5432`
- base de datos `cjprestamos`
- variables locales de base de datos y bootstrap configuradas fuera de Git

Variables mínimas para un entorno nuevo en PowerShell:

```powershell
$env:DB_URL = "jdbc:postgresql://localhost:5432/cjprestamos"
$env:DB_USER = "<DB_USER_LOCAL>"
$env:DB_PASSWORD = "<DB_PASSWORD_LOCAL>"

$env:BOOTSTRAP_ADMIN_ENABLED = "true"
$env:BOOTSTRAP_ADMIN_USERNAME = "<ADMIN_LOCAL_USER>"
$env:BOOTSTRAP_ADMIN_PASSWORD = "<ADMIN_LOCAL_PASSWORD>"
$env:BOOTSTRAP_ADMIN_ROLE = "OPERADORA"

$env:CORS_ALLOWED_ORIGINS = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174"
```

Arranque:

```bash
cd backend
mvn spring-boot:run
```

API base: `http://localhost:8081/api`

Endpoint de reportes PDF:
- `GET /api/reportes/dashboard/pdf?desde=YYYY-MM-DD&hasta=YYYY-MM-DD`
- Respuesta: `application/pdf`, descarga `cjprestamos-dashboard-YYYYMMDD-YYYYMMDD.pdf`.
- El rango es inclusivo. Los pagos del período usan `fechaContable`; si está vacía, usan `fechaPago`.
- El reporte incluye resumen ejecutivo, snapshot de control de caja, cartera/riesgo, movimientos del período y observaciones automáticas.

Credenciales iniciales desarrollo:
- usuario: valor de `BOOTSTRAP_ADMIN_USERNAME`
- contraseña: valor de `BOOTSTRAP_ADMIN_PASSWORD`
- rol: valor de `BOOTSTRAP_ADMIN_ROLE` (`OPERADORA` para operación local)

Notas de seguridad del MVP:
- Basic Auth sigue siendo válida solo para desarrollo/MVP interno.
- El bootstrap inicial no crea usuarios si falta usuario o contraseña.
- No versionar `.env` reales; usar `.env.example` como plantilla.

## 2) Frontend

Crear entorno local desde ejemplo:

```bash
cd frontend
cp .env.example .env
```

Instalar y levantar:

```bash
npm install
npm run dev
```

Frontend en `http://localhost:5173`.

## 3) Cómo probar flujo real (manual-first)

1. Login con las credenciales locales configuradas en `BOOTSTRAP_ADMIN_USERNAME` y `BOOTSTRAP_ADMIN_PASSWORD`.
2. Crear persona en `/personas`.
3. Crear préstamo en `/prestamos`.
4. En Workspace del préstamo:
   - revisar resumen,
   - generar/cargar cuotas,
   - registrar pago.
5. Confirmar impacto en `/` (dashboard).
6. Opcional: completar legajo/adjuntos en `/legajos`.

---

## Estructura del repo

```text
/backend
/frontend
AGENTS.md
BACKLOG_CODEX.md
ESTADO_REAL_MVP.md
CHECKLIST_CIERRE_MVP.md
DECISIONES_MVP.md
CHECKLIST_ENTREGA_CODEX.md
```

Documentos históricos (solo contexto):
- `AUDITORIA_CJPRESTAMOS.md`
- `MAPA_DE_CAMBIOS_SUGERIDOS.md`
- `INDICE_DEL_PAQUETE.md`

---

## Criterio práctico de cierre

Una funcionalidad no se considera cerrada si:
- existe solo backend o solo frontend,
- aparece en menú pero es placeholder,
- no cierra flujo real de punta a punta.

El criterio de calidad es operativo: menos fricción, más claridad y números confiables.


## Runbook local en paralelo con HogarIA

Configuración recomendada para evitar conflictos entre ambos repositorios en desarrollo local:

| App | Frontend | Backend | Auth local | Variables requeridas | Comando de arranque |
|---|---|---|---|---|---|
| HogarIA | `http://localhost:5174` | `http://localhost:8080` | JWT Bearer (`/api/auth/login`) con fallback `X-User-Id` solo dev | Backend: `DB_URL`, `DB_USER`, `DB_PASSWORD`, `CORS_ALLOWED_ORIGINS`, `ALLOW_X_USER_ID_FALLBACK`; Frontend: `VITE_API_BASE_URL`, `VITE_ALLOW_DEV_X_USER_ID` | `cd backend && mvn spring-boot:run` + `cd frontend && npm run dev -- --port 5174` |
| cjprestamos | `http://localhost:5173` | `http://localhost:8081` | Basic Auth con usuario bootstrap local por entorno | Backend: `DB_URL`, `DB_USER`, `DB_PASSWORD`, `BOOTSTRAP_ADMIN_USERNAME`, `BOOTSTRAP_ADMIN_PASSWORD`, `CORS_ALLOWED_ORIGINS`; Frontend: `VITE_API_BASE_URL=/api` | `cd backend && mvn spring-boot:run` + `cd frontend && npm run dev` |

Notas de interoperabilidad:
- En ambos frontends se recomienda `VITE_API_BASE_URL=/api` y usar proxy de Vite para evitar hardcodear hosts y reducir problemas CORS en desarrollo.
- `cjprestamos` backend permite configurar CORS con `CORS_ALLOWED_ORIGINS`; para desarrollo local se recomiendan `localhost` y `127.0.0.1` en puertos `5173` y `5174`.
- Si HogarIA frontend se levanta sin proxy y sin backend activo, aparecerá `ERR_CONNECTION_REFUSED`; esto es esperado hasta iniciar `http://localhost:8080`.
- El endpoint de legajo puede responder `404` cuando la persona todavía no tenga legajo cargado; tratarlo como estado funcional y no como caída técnica.
