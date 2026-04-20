# ESTADO_REAL_MVP.md

## Objetivo del archivo

Este archivo existe para responder una sola pregunta:

**¿Qué tan cerca está el repo de un MVP operativo usable de verdad?**

No reemplaza al backlog.  
No lista deseos.  
Lista estado real.

---

## Criterio de lectura

- **HECHO**: usable de forma razonable.
- **PARCIAL**: existe pero no cierra flujo real.
- **PENDIENTE**: todavía falta implementar.

---

## Estado actual

### Personas
- CRUD backend: **HECHO**
- UI de personas: **HECHO**

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
- cierre operativo visible en detalle (programado/pagado/saldo/estado): **HECHO**

### Pagos
- backend de registro: **HECHO**
- imputación: **HECHO**
- UI de pagos dentro del detalle: **HECHO**
- pantalla separada `/pagos`: **REMOVIDA DE NAVEGACIÓN (intencional)**

### Dashboard
- backend: **HECHO**
- UI: **HECHO**

### Experiencia visual
- UI responsive sobria en layout y módulos principales: **HECHO**

### Colores y señales rápidas
- color de referencia en persona: **HECHO**

### Legajos
- backend: **HECHO** (backend mínimo usable de legajo por persona)
- UI real: **PENDIENTE**
- pantalla placeholder: **FUERA DE NAVEGACIÓN PRINCIPAL**

### Seguridad
- Basic Auth simple: **HECHO**
- login frontend mínimo (sin persistir contraseña, logout + manejo 401): **HECHO**
- módulo de usuarios de sistema (persistidos en DB) + endpoint de sesión `/api/auth/me`: **HECHO**
- seguridad mínima backend/frontend coherente (sin sesión backend dedicada): **HECHO EN MVP**

### Calidad técnica
- tests unitarios del núcleo: **BIEN ENCAMINADOS**
- test de arranque real (contexto + endpoint health): **HECHO (alcance básico)**
- integración con datasource/Flyway en test automatizado (PostgreSQL con Testcontainers): **HECHO**
- CI backend ejecutando `mvn test` con Docker para forzar integración Testcontainers: **HECHO**
- ejecución local sin Docker: **PARCIAL ESPERADO** (tests de integración se pueden skippear por diseño)
- documentación alineada al repo: **HECHO EN ESTA ETAPA**

---

## Conclusión

El repo está en estado:

**MVP operativo principal cerrado, con evolución pendiente en UI de legajos, adjuntos y robustez técnica avanzada.**

Pendientes reales para la siguiente etapa:
1. UI de legajo separado y adjuntos.
