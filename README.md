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

### No es
- Fintech.
- Banco.
- Plataforma de cobranza automática.

---

## Recorrido rápido (2-3 minutos)

1. Iniciar sesión (`admin/admin` en entorno local inicial).
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
- Listados recientes de préstamos y personas.
- Acciones rápidas para continuar flujo sin fricción.

## 2) Personas
Libreta de personas conocidas.
- CRUD operativo.
- Búsqueda por nombre/alias/teléfono.
- Detalle editable y acceso al legajo relacionado.

## 3) Préstamos
Flujo económico principal.
- Alta de préstamo.
- Listado + selección.
- Workspace por préstamo:
  - Resumen,
  - Cuotas,
  - Pagos.

## 4) Legajos
Contexto separado de la operación económica.
- Legajo por persona.
- Adjuntos (alta/listado/descarga/eliminación).

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
- usuario/clave por defecto: `postgres/postgres`

Arranque:

```bash
cd backend
mvn spring-boot:run
```

API base: `http://localhost:8080/api`

Credenciales iniciales desarrollo:
- usuario: `admin`
- contraseña: `admin`
- rol: `OPERADORA`

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

1. Login con `admin/admin`.
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
