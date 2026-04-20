# cjprestamos

Sistema web interno de préstamos para conocidos, con enfoque manual-first.

## Objetivo del producto

El objetivo principal del sistema es:

- mejorar la organización,
- resolver cuentas matemáticas simples,
- registrar personas, préstamos, cuotas y pagos,
- mostrar métricas claras:
  - monto invertido,
  - monto ganado,
  - monto por ganar,
  - deuda total.

## Qué NO es este sistema

Este sistema:

- no es una fintech,
- no es un sistema bancario,
- no es una plataforma de cobranza automática.

La operadora decide.  
El sistema asiste.  
El criterio humano sigue mandando.

---

## Estado actual del MVP

### Núcleo operativo principal (MVP) — CERRADO
- Personas: CRUD backend y UI operativa.
- Préstamos: alta, listado, detalle y cálculo sugerido.
- Cuotas: generación automática/manual disponible desde UI y backend.
- Pagos: registro con imputación automática y selección opcional de cuotas destino.
- Dashboard: métricas principales visibles.
- Referencias y colores: soporte inicial implementado.
- Detalle operativo del préstamo: estado de cuotas, total programado, total pagado y saldo pendiente.
- Pagos en MVP: decisión cerrada, se operan dentro del detalle de préstamo (sin pantalla separada en navegación principal).

### Evolución post-MVP inmediata — CERRADA
- Legajo por persona operativo dentro de la vista de Personas y también en ruta dedicada `/legajos` (crear/editar).
- Adjuntos del legajo (subida/listado/descarga/eliminación) con storage local en filesystem configurable.
- Seguridad mínima con login frontend + backend Basic Auth.
- Bootstrap idempotente de usuario inicial `admin`.
- Renegociación manual de cuotas futuras con registro de evento histórico.

### Ajustes de operación y UX/UI (abril 2026) — CERRADOS
- Workspace de préstamos reorganizado por secciones (`Resumen`, `Cuotas`, `Pagos`) para reducir saturación visual.
- Vista de préstamos simplificada en 2 columnas (exploración + workspace) y alta en panel dedicado bajo demanda.
- Segmentación interna de `Cuotas` por subtareas (`Generación/Carga`, `Listado`, `Renegociación`) para evitar pared de formularios.
- Persistencia de contexto operativo en URL para préstamos/personas (selección y filtros principales).
- Dashboard más accionable con acceso directo al detalle operativo del préstamo.
- Manejo explícito de rutas no encontradas y error de navegación en frontend.
- Formularios y focos visuales con mejor accesibilidad base.
- Regla unificada para `FECHAS_MANUALES`: `fechaBase` se acepta como fecha inicial auxiliar opcional (no obligatoria) y se usa para precompletar la primera cuota en UI.

### Estado real recomendado
Para seguimiento de producto y priorización:
- ver `ESTADO_REAL_MVP.md`
- ver `BACKLOG_CODEX.md`

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

## Estructura confirmada del repositorio

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

Documentos auxiliares/históricos:
- `AUDITORIA_CJPRESTAMOS.md` (histórico)
- `MAPA_DE_CAMBIOS_SUGERIDOS.md` (histórico)
- `INDICE_DEL_PAQUETE.md` (histórico)

---

## Desarrollo local

### 1) Backend

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

La API queda en `http://localhost:8080/api`.

Credenciales iniciales para desarrollo:
- usuario: `admin`
- contraseña: `admin`
- rol: `OPERADORA`

Notas de seguridad mínima:
- el usuario `admin` se crea automáticamente al iniciar si no existe,
- la creación es idempotente,
- la contraseña se guarda codificada con `PasswordEncoder`,
- se puede desactivar el bootstrap con `app.auth.bootstrap-admin.enabled=false`.

### 2) Frontend

Crear entorno local desde el ejemplo:

```bash
cd frontend
cp .env.example .env
```

Instalar dependencias y levantar:

```bash
npm install
npm run dev
```

El frontend usa por defecto `VITE_API_BASE_URL=/api` y Vite proxyea `/api` a `http://localhost:8080`.

Autenticación frontend (mínima):
- al abrir la app, se solicita usuario y contraseña,
- la contraseña no se persiste en `sessionStorage` (solo se recuerda el usuario),
- la sesión activa del frontend vive en memoria y se pierde al recargar la página,
- Axios envía Basic Auth solo mientras la sesión esté activa,
- ante `401` se limpia sesión y se vuelve a login automáticamente.

### 3) Verificación rápida

- backend: `GET http://localhost:8080/api/health`
- frontend: abrir `http://localhost:5173`
- flujo personas/legajo: seleccionar persona, crear o editar legajo y operar adjuntos sin Postman.
- flujo legajos dedicados: abrir `/legajos`, elegir persona y operar legajo + adjuntos.
- flujo renegociación: en detalle de préstamo, ajustar cuotas futuras, confirmar y guardar.
- flujo pagos: en detalle de préstamo, registrar pago con imputación automática o seleccionando cuotas específicas.

---

## Criterio práctico de cierre

No considerar “cerrada” una funcionalidad si:
- existe solo en backend pero no en la UI operativa principal,
- existe en el menú pero la pantalla es placeholder,
- los cálculos están probados solo de manera superficial.

Una entrega queda realmente cerrada cuando el flujo principal se puede usar de punta a punta sin depender de pasos manuales técnicos.

---

> Nota técnica (BT-0006): los tests de integración usan PostgreSQL real con Testcontainers (perfil `test`).  
> En desarrollo local sin Docker pueden quedar skipeados por `@Testcontainers(disabledWithoutDocker = true)`.  
> En CI oficial (`.github/workflows/backend-tests.yml`) se ejecuta `mvn test` en runner Ubuntu con Docker disponible, por lo que esa integración corre de forma obligatoria.
