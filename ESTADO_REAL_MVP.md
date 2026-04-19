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

### Colores y señales rápidas
- color de referencia en persona: **HECHO**

### Legajos
- backend: **PENDIENTE**
- UI real: **PENDIENTE**
- pantalla placeholder: **FUERA DE NAVEGACIÓN PRINCIPAL**

### Seguridad
- Basic Auth simple: **PARCIAL**
- login frontend real: **PENDIENTE**

### Calidad técnica
- tests unitarios del núcleo: **BIEN ENCAMINADOS**
- test de arranque real (contexto + endpoint health): **HECHO (alcance básico)**
- integración con datasource/Flyway en test automatizado (PostgreSQL con Testcontainers): **HECHO**
- documentación alineada al repo: **HECHO EN ESTA ETAPA**

---

## Conclusión

El repo está en estado:

**MVP operativo principal cerrado, con evolución pendiente en legajos y robustez técnica avanzada.**

Pendientes reales para la siguiente etapa:
1. legajo separado y adjuntos,
2. decidir alcance de seguridad frontend (si aplica).
