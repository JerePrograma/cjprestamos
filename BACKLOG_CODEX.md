# BACKLOG_CODEX.md

Backlog técnico priorizado para reflejar el **estado real** del repo.

## Reglas de estado
1. cada tarea tiene estado visible,
2. los estados válidos son **HECHA**, **PARCIAL** o **PENDIENTE**,
3. si una tarea está cerrada solo en backend o solo en frontend, queda **PARCIAL**.

---

# 0. Estado real del producto

## Núcleo del MVP (operación principal)

### HECHO
- BT-0002 — backend base
- BT-0003 — frontend base
- BT-1001 — dominio mínimo
- BT-1002 — migración inicial
- BT-1003 — auditoría temporal base
- BT-2001 — CRUD backend de persona
- BT-2002 — UI de personas
- BT-3001 — módulo backend de préstamo
- BT-3002 — cálculo simple por porcentaje fijo
- BT-3003 — backend de generación/listado de cuotas
- BT-3004 — UI alta de préstamo
- BT-3005 — listado y detalle de préstamos
- BT-3006 — UI de generación automática de cuotas
- BT-3007 — UI de carga manual de cuotas
- BT-3008 — cierre operativo del préstamo en UI
- BT-4001 — registro de pago
- BT-4002 — imputación de pagos
- BT-4003 — UI de pagos dentro del detalle de préstamo
- BT-5001 — backend del dashboard
- BT-5002 — UI del dashboard
- BT-5003 — módulo integral de control de caja (backend + UI: caja, inversión, balance mensual, proyección 30/60/90 y cartera en mora): **HECHA**
- BT-6001 — referencias del préstamo
- BT-6002 — colores de referencia para persona
- BT-0004 — honestidad de navegación / ocultar placeholders
- BT-0005 — test de arranque real (alcance básico)
- BT-0006 — integración datasource/Flyway con Testcontainers + CI Docker
- BT-7001 — refactor visual responsive del frontend
- BT-7002 — persistencia de contexto operativo en URL (personas/préstamos)
- BT-7003 — dashboard accionable con acceso directo al detalle de préstamo
- BT-7004 — workspace de préstamo reorganizado por secciones operativas
- BT-7005 — manejo de rutas no encontradas y error de navegación frontend
- BT-7006 — préstamos en layout 2 columnas + alta bajo demanda para menor saturación visual
- BT-7007 — segmentación de cuotas por subtareas operativas (generación/listado/renegociación)
- BT-3009 — regla unificada FECHAS_MANUALES con `fechaBase` auxiliar opcional (frontend/backend)
- BT-7010 — capa de UX/UI consistente (headers, estados, quick actions, patrones reutilizables): **HECHA**
- BT-7011 — eliminación de centavos con redondeo hacia arriba en cálculos, cuotas, pagos y UI: **HECHA**
- BT-7012 — rediseño visual integral frontend (tokens, layout, navegación, formularios y estados light/dark): **HECHA**

### PARCIAL
- (sin parciales activos en el núcleo)

### PENDIENTE CRÍTICO
- (sin pendientes críticos activos)

---

# 1. Evolución post-MVP inmediata

## ÉPICA 8 — Legajo y adjuntos
- BT-8001 — backend de legajo por persona: **HECHA**
- BT-8002 — UI de legajo integrada en flujo de Personas: **HECHA**
- BT-8005 — ruta dedicada de legajos en frontend con selector de persona: **HECHA**
- BT-8003 — backend de adjuntos de legajo (metadata + filesystem local): **HECHA**
- BT-8004 — UI de adjuntos de legajo (upload/listado/descarga/eliminación): **HECHA**

## ÉPICA 9 — Seguridad mínima operativa
- BT-9001 — seguridad mínima backend/frontend coherente: **HECHA EN MVP**
- BT-9002 — login frontend mínimo: **HECHA**
- BT-9003 — bootstrap idempotente de usuario `admin` por defecto: **HECHA**

## ÉPICA 10 — Ajustes manuales post-MVP
- BT-10001 — renegociación manual de cuotas futuras (backend + UI): **HECHA**
- BT-10002 — pagos con selección opcional de cuotas (manteniendo imputación automática default): **HECHA**
- BT-10003 — simulador de préstamos con cronograma + exportación PDF (backend/frontend): **HECHA**

---

# 2. Calidad y documentación

### HECHO
- Documentación principal alineada con estado real del repo (`README.md`, `ESTADO_REAL_MVP.md`, este backlog).
- Wording del test de arranque real ajustado a su alcance (contexto web + endpoint health, sin sobredimensionar validación).
- Documentación auxiliar histórica marcada explícitamente para evitar contradicciones (`AUDITORIA_*`, `MAPA_*`, `INDICE_*`).

### PENDIENTE NO CRÍTICO
- Robustez técnica avanzada de seguridad (sesión backend dedicada, rotación de credenciales, políticas de acceso más finas).
- Evoluciones fuera de alcance MVP inmediato (portal cliente, recordatorios automáticos, scoring, PDF, etc.).
