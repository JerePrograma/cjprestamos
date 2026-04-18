# BACKLOG_CODEX.md

Backlog técnico priorizado para cerrar el MVP operativo del sistema interno de préstamos.

## Cómo usar este archivo

Este backlog debe representar el **estado real** del repo, no solo la intención histórica.

Reglas:
1. cada tarea debe tener estado visible,
2. una tarea puede quedar **HECHA**, **PARCIAL** o **PENDIENTE**,
3. si una tarea está hecha en backend pero no cerrada en UI, se considera **PARCIAL**,
4. si una tarea impacta el flujo principal, no se mueve a “hecha” hasta poder usarla de punta a punta.

---

# 0. Estado real del producto

## Enfoque funcional confirmado
- sistema interno,
- una sola operadora principal,
- uso manual-first,
- cálculo asistido por porcentaje fijo,
- posibilidad de ajustar montos y fechas manualmente,
- foco del dashboard en invertido, ganado, por ganar y deuda total.

## Núcleo del MVP: situación actual

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
- BT-4001 — registro de pago
- BT-4002 — imputación de pagos
- BT-5001 — backend del dashboard
- BT-5002 — UI del dashboard
- BT-6001 — referencias del préstamo
- BT-6002 — colores de referencia para persona

### PARCIAL
- BT-3004 — UI alta de préstamo
- BT-3005 — listado y detalle de préstamos
- BT-4003 — UI de pagos
- BT-9001 — seguridad mínima backend

### PENDIENTE CRÍTICO
- BT-3006 — UI de generación automática de cuotas
- BT-3007 — UI de carga manual de cuotas
- BT-3008 — visibilidad clara del estado de cierre operativo del préstamo
- BT-0004 — honestidad de navegación / ocultar placeholders
- BT-0005 — reforzar test de arranque e integración real

### PENDIENTE NO CRÍTICO
- BT-7001 — renegociación simple
- BT-7002 — UI de ajuste manual
- BT-8001 a BT-8004 — legajo y adjuntos
- BT-9002 — login frontend

---

# 1. Prioridad real desde ahora

## Prioridad 1 — Cerrar el flujo principal
Estas son las tareas que realmente acercan el proyecto a “me sirve de verdad”:

### BT-3006 — UI de generación automática de cuotas
**Estado:** PENDIENTE  
**Objetivo:** permitir generar cuotas desde la interfaz para préstamos mensuales o cada X días.

**Archivos probables**
- `frontend/src/services/prestamos/prestamosApi.ts`
- `frontend/src/modules/prestamos/hooks/usePrestamos.ts`
- `frontend/src/modules/prestamos/PrestamosPage.tsx`
- `frontend/src/modules/prestamos/types/prestamo.ts`

**Criterio de aceptación**
- desde el detalle del préstamo se pueden generar cuotas,
- la UI refresca cuotas y resumen,
- el flujo no exige llamadas manuales a la API.

---

### BT-3007 — UI de carga manual de cuotas
**Estado:** PENDIENTE  
**Objetivo:** permitir ingresar fechas y montos manuales cuando `frecuenciaTipo = FECHAS_MANUALES`.

**Criterio de aceptación**
- formulario/manual editor claro,
- validación de cantidad de cuotas,
- validación de suma exacta,
- feedback útil de errores.

---

### BT-3008 — Cierre operativo del préstamo en UI
**Estado:** PENDIENTE  
**Objetivo:** que el detalle del préstamo muestre con claridad:
- total programado,
- total pagado,
- saldo pendiente,
- si las cuotas ya fueron generadas o no.

**Criterio de aceptación**
- sin entrar al backend, la operadora entiende el estado real del préstamo.

---

### BT-0004 — Honestidad de navegación
**Estado:** PENDIENTE  
**Objetivo:** no mostrar en el menú principal páginas placeholder sin valor operativo.

**Archivos probables**
- `frontend/src/components/layout/LayoutPrincipal.tsx`
- `frontend/src/modules/pagos/PagosPage.tsx`
- `frontend/src/modules/legajos/LegajosPage.tsx`

**Opciones válidas**
- ocultar las rutas,
- marcarlas como “próximamente”,
- o implementar lo mínimo útil real.

---

### BT-0005 — Reforzar test de arranque e integración real
**Estado:** PENDIENTE  
**Objetivo:** reemplazar o complementar tests triviales de arranque por pruebas con valor real.

**Archivos probables**
- `backend/src/test/java/com/cjprestamos/backend/CjprestamosBackendApplicationTests.java`
- tests de controller/integración relevantes
- configuración de test con perfil adecuado

**Criterio de aceptación**
- el proyecto no parezca más validado de lo que realmente está.

---

# 2. Tareas ya adelantadas pero no cerradas del todo

### BT-3004 — UI alta de préstamo
**Estado:** PARCIAL  
**Qué ya existe**
- formulario de alta,
- cálculo sugerido,
- validaciones importantes,
- integración de creación.

**Qué falta para marcarla como cerrada**
- integración natural con generación de cuotas,
- reducción de fricción entre “crear préstamo” y “dejarlo listo para operar”.

---

### BT-3005 — listado y detalle de préstamos
**Estado:** PARCIAL  
**Qué ya existe**
- listado,
- detalle,
- resumen económico,
- referencia y observaciones,
- cuotas y pagos visibles si existen.

**Qué falta**
- indicar mejor si faltan cuotas por generar,
- destacar saldo pendiente real,
- evitar sensación de flujo incompleto.

---

### BT-4003 — UI de pagos
**Estado:** PARCIAL  
**Qué ya existe**
- registro de pagos desde el detalle,
- historial visible,
- refresco de queries relevantes.

**Qué falta**
- eventualmente exponer mejor la imputación/saldo por cuota,
- decidir si la ruta `/pagos` sigue existiendo o si pagos vive solo dentro de préstamos.

---

### BT-9001 — seguridad mínima backend
**Estado:** PARCIAL  
**Qué ya existe**
- Basic Auth simple,
- CORS de desarrollo,
- endpoint de health libre.

**Qué falta**
- validar si el enfoque actual es suficiente para producción interna,
- evitar hardcodeo difuso en frontend si se endurece el acceso.

---

# 3. Backlog diferido con intención explícita

## ÉPICA 7 — Ajustes manuales
### BT-7001 — Renegociación simple
**Estado:** PENDIENTE

### BT-7002 — UI de ajuste manual
**Estado:** PENDIENTE

## ÉPICA 8 — Legajo y adjuntos
### BT-8001 — LegajoPersona
**Estado:** PENDIENTE

### BT-8002 — UI de Legajo
**Estado:** PENDIENTE

### BT-8003 — Adjuntar archivos al legajo
**Estado:** PENDIENTE

### BT-8004 — UI de adjuntos del legajo
**Estado:** PENDIENTE

## ÉPICA 9 — Seguridad adicional
### BT-9002 — Login frontend
**Estado:** PENDIENTE

---

# 4. Orden sugerido de ejecución desde hoy

## Lote A — Cierre del MVP operativo
- BT-3006
- BT-3007
- BT-3008
- BT-0004
- BT-0005

## Lote B — Consolidación
- revisar BT-3004 como HECHA o mantener PARCIAL
- revisar BT-3005 como HECHA o mantener PARCIAL
- revisar BT-4003 como HECHA o mantener PARCIAL

## Lote C — Evolución post-MVP
- BT-7001
- BT-7002
- BT-8001
- BT-8002
- BT-8003
- BT-8004
- BT-9002

---

# 5. Fuera del MVP

Estas tareas siguen fuera de la primera versión útil:
- recordatorios automáticos,
- mensajes automáticos para WhatsApp,
- portal cliente,
- pagaré digital,
- recibos PDF,
- scoring avanzado,
- punitorio automático,
- multiusuario con permisos finos,
- automatizaciones complejas.

---

# 6. Plantilla estándar para nuevas tareas

```text
Contexto funcional:
[por qué esta tarea acerca el producto al uso real]

Estado actual:
[qué ya existe y qué sigue faltando]

Objetivo:
[qué debe quedar realmente resuelto]

Alcance:
[qué sí entra]

Fuera de alcance:
[qué no debe tocar]

Restricciones:
- usar nombres en español para el dominio
- mantener código simple
- no sobreingenierizar
- agregar tests
- no romper el flujo manual-first
- no declarar “hecha” una tarea cerrada solo en backend

Entregable esperado:
- archivos modificados
- tests
- validaciones ejecutadas
- estado final: hecha / parcial / pendiente
```
