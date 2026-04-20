# ESTADO_REAL_MVP.md

## Objetivo del archivo

Responder de forma honesta:

**¿Qué tan cerca está el repo de un MVP operativo usable de verdad?**

---

## Criterio de lectura

- **HECHO**: usable de punta a punta.
- **PARCIAL**: existe, pero no cierra flujo real.
- **PENDIENTE**: falta implementar.

---

## Estado actual

### Personas
- CRUD backend: **HECHO**
- UI de personas: **HECHO**
- acceso operativo al legajo desde Personas: **HECHO**

### Préstamos
- backend base: **HECHO**
- alta UI: **HECHO**
- listado/detalle UI: **HECHO**
- referencias/observaciones: **HECHO**

### Cálculo
- cálculo por porcentaje fijo: **HECHO**

### Cuotas
- backend de generación automática/manual: **HECHO**
- UI de generación automática: **HECHO**
- UI de carga manual: **HECHO**
- cierre operativo visible en detalle: **HECHO**
- renegociación manual de cuotas futuras sin tocar pagos previos: **HECHO**

### Pagos
- backend de registro: **HECHO**
- imputación automática por orden: **HECHO**
- selección opcional de cuota(s) destino al registrar pago: **HECHO**
- UI de pagos dentro del detalle: **HECHO**
- pantalla separada `/pagos`: **REMOVIDA DE NAVEGACIÓN (intencional)**

### Dashboard
- backend: **HECHO**
- UI: **HECHO**

### Legajos
- backend legajo por persona: **HECHO**
- UI crear/editar legajo por persona: **HECHO**
- backend adjuntos (metadata + filesystem local): **HECHO**
- UI adjuntos (subida/listado/descarga/eliminación): **HECHO**
- pantalla dedicada `/legajos` en navegación principal: **HECHA**

### Seguridad
- Basic Auth simple: **HECHO**
- login frontend mínimo (sin persistir contraseña, logout + manejo 401): **HECHO**
- módulo de usuarios de sistema + endpoint `/api/auth/me`: **HECHO**
- bootstrap idempotente de usuario inicial `admin/admin`: **HECHO**
- sesión backend dedicada (token/cookie): **PENDIENTE**

### Calidad técnica
- tests unitarios del núcleo: **HECHO EN NIVEL MVP**
- test de arranque real (contexto + endpoint health): **HECHO (alcance básico y explícito)**
- integración datasource/Flyway con PostgreSQL Testcontainers: **HECHO**
- CI backend con `mvn test` y Docker: **HECHO**
- ejecución local sin Docker: **PARCIAL ESPERADO** (integración puede skippear)
- documentación alineada al repo: **HECHO**

### UX/UI y operación
- dashboard con acceso directo al detalle operativo de préstamos: **HECHO**
- persistencia de contexto principal en URL (personas/préstamos): **HECHO**
- reorganización del detalle de préstamo por secciones para reducir saturación: **HECHO**
- vista de préstamos en 2 columnas + alta en panel dedicado para reducir ruido operativo: **HECHO**
- segmentación de cuotas en subtareas (generación/carga, listado, renegociación): **HECHO**
- manejo de ruta no encontrada/error de navegación en frontend: **HECHO**

### Regla funcional crítica alineada
- `FECHAS_MANUALES` acepta `fechaBase` opcional como fecha inicial auxiliar (backend + frontend + validaciones): **HECHO**

---

## Conclusión

Estado actual del repo:

**MVP operativo principal cerrado + evolución post-MVP inmediata cerrada (legajo usable, adjuntos locales y bootstrap admin).**

Pendiente real más relevante:
1. robustez de seguridad más avanzada (fuera de alcance MVP/manual-first actual).
