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
- alta UI: **PARCIAL**
- listado/detalle UI: **PARCIAL**
- referencias/observaciones: **HECHO**

### Cálculo
- cálculo por porcentaje fijo: **HECHO**

### Cuotas
- backend de generación automática/manual: **HECHO**
- UI de generación automática: **PENDIENTE**
- UI de carga manual: **PENDIENTE**

### Pagos
- backend de registro: **HECHO**
- imputación: **HECHO**
- UI de pagos dentro del detalle: **PARCIAL**
- pantalla separada `/pagos`: **NO RELEVANTE / PLACEHOLDER**

### Dashboard
- backend: **HECHO**
- UI: **HECHO**

### Colores y señales rápidas
- color de referencia en persona: **HECHO**

### Legajos
- backend: **PENDIENTE**
- UI real: **PENDIENTE**
- pantalla placeholder: **EXISTE PERO NO CUENTA COMO FEATURE**

### Seguridad
- Basic Auth simple: **PARCIAL**
- login frontend real: **PENDIENTE**

### Calidad técnica
- tests unitarios del núcleo: **BIEN ENCAMINADOS**
- test de arranque real: **PENDIENTE / DÉBIL**
- documentación alineada al repo: **PARCIAL**

---

## Conclusión

El repo está en estado:

**MVP encaminado, pero no cerrado.**

La barrera para pasar a “operativo de verdad” está en:
1. cerrar cuotas desde UI,
2. mostrar mejor el saldo real del préstamo,
3. dejar de vender placeholders como módulos reales,
4. endurecer un poco la validación técnica básica.
