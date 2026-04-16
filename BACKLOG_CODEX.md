# BACKLOG_CODEX.md

Backlog técnico priorizado para implementar el MVP del sistema interno de préstamos.

## Cómo usar este archivo con Codex

Este archivo no reemplaza el prompt maestro.

Uso recomendado:
1. abrir Codex sobre el repositorio,
2. pasarle primero el contenido de `PROMPT_MAESTRO_CODEX.txt`,
3. luego pedirle que ejecute una tarea puntual de este backlog,
4. trabajar de a una tarea o un lote pequeño por vez.

---

# 0. Decisiones base del proyecto

## Enfoque funcional
- sistema interno,
- una sola operadora principal,
- uso manual-first,
- cálculo asistido por porcentaje fijo,
- posibilidad de ajustar montos y fechas manualmente,
- foco del dashboard en invertido, ganado, por ganar y deuda total.

## Stack
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

# 1. Estructura recomendada del repositorio

## Monorepo
- `/backend`
- `/frontend`
- `/docs`
- `/infra`

## Módulos backend sugeridos
- `auth`
- `persona`
- `prestamo`
- `cuota`
- `pago`
- `dashboard`
- `legajo`
- `audit`
- `common`

## Módulos frontend sugeridos
- `modules/personas`
- `modules/prestamos`
- `modules/pagos`
- `modules/dashboard`
- `modules/legajos`
- `components`
- `services`
- `types`

---

# 2. Backlog priorizado

## ÉPICA 0 — Bootstrap

### BT-0001 — Estructura base del monorepo
**Objetivo**  
Crear la estructura inicial del repositorio.

**Entregable**
- carpetas `backend`, `frontend`, `docs`, `infra`
- README raíz
- `.gitignore`
- `.editorconfig`
- `.gitattributes`

**Criterio de aceptación**
- repo ordenado
- listo para inicializar backend y frontend

---

### BT-0002 — Inicializar backend Spring Boot
**Objetivo**  
Crear proyecto base backend funcional.

**Entregable**
- proyecto Maven Spring Boot
- endpoint `/api/health`
- perfiles `dev` y `test`
- PostgreSQL + Flyway configurados
- test de contexto

**Criterio de aceptación**
- backend compila
- endpoint responde
- test básico pasa

---

### BT-0003 — Inicializar frontend React + TS + Vite
**Objetivo**  
Crear frontend base con layout y routing.

**Entregable**
- app React + TS + Vite
- React Router
- TanStack Query
- Tailwind
- rutas base
- layout inicial

**Criterio de aceptación**
- frontend levanta
- hay navegación mínima funcional

---

## ÉPICA 1 — Dominio mínimo y persistencia

### BT-1001 — Modelar entidades mínimas del MVP
**Objetivo**  
Crear el núcleo de dominio real del MVP.

**Entidades mínimas**
- `UsuarioInterno` (si auth entra en la etapa)
- `Persona`
- `Prestamo`
- `Cuota`
- `Pago`
- `ImputacionPago`
- `EventoPrestamo`

**Nota**  
`LegajoPersona` queda diferido para una segunda etapa del MVP.

**Criterio de aceptación**
- entidades coherentes
- relaciones consistentes
- enums definidos
- timestamps básicos

---

### BT-1002 — Crear migración Flyway inicial
**Objetivo**  
Persistir el esquema del MVP.

**Entregable**
- `V1__init.sql`

**Criterio de aceptación**
- tablas creadas
- FK e índices razonables
- convenciones SQL limpias

---

### BT-1003 — Auditoría temporal base
**Objetivo**  
Agregar `created_at` y `updated_at` automáticos.

**Criterio de aceptación**
- aplicado al menos a Persona, Prestamo, Cuota y Pago

---

## ÉPICA 2 — Personas

### BT-2001 — CRUD de Persona
**Objetivo**  
Registrar personas conocidas.

**Campos mínimos**
- nombre
- alias
- teléfono
- observacionRapida
- colorReferencia
- cobraEnFecha
- tieneIngresoExtra
- activo

**Criterio de aceptación**
- CRUD REST funcional
- validaciones
- tests

---

### BT-2002 — UI de Personas
**Objetivo**  
Alta, listado y detalle de personas.

**Criterio de aceptación**
- listado con búsqueda simple
- alta/edición
- detalle usable

---

## ÉPICA 3 — Préstamos manual-first

### BT-3001 — Crear módulo Prestamo
**Objetivo**  
Registrar préstamos según la forma real de trabajo.

**Campos mínimos**
- personaId
- montoInicial
- porcentajeFijoSugerido
- interesManualOpcional
- cantidadCuotas
- frecuenciaTipo
- frecuenciaCadaDias
- fechaBase
- usarFechasManuales
- referenciaCodigo
- observaciones
- estado

**Criterio de aceptación**
- crear y consultar préstamo
- listar activos
- tests de negocio

---

### BT-3002 — Servicio de cálculo simple
**Objetivo**  
Resolver cuentas matemáticas simples.

**Debe calcular**
- total a devolver
- cuota sugerida
- monto invertido
- monto ganado estimado
- monto por ganar

**Criterio de aceptación**
- servicio puro
- tests robustos

---

### BT-3003 — Generación de cuotas
**Objetivo**  
Permitir cuotas automáticas o manuales.

**Soportar**
- mensual
- cada X días
- fechas manuales

**Criterio de aceptación**
- cuotas persistidas
- tests de escenarios

---

### BT-3004 — UI alta de préstamo
**Objetivo**  
Crear pantalla operativa de alta.

**Criterio de aceptación**
- cálculo sugerido visible
- posibilidad de ajuste manual
- integración con API

---

### BT-3005 — Listado y detalle de préstamos
**Objetivo**  
Visualizar estado de cada préstamo.

**Criterio de aceptación**
- listado funcional
- detalle con cuotas y resumen económico

---

## ÉPICA 4 — Pagos e imputación

### BT-4001 — Registrar pago
**Objetivo**  
Asentar pago con fecha y referencia.

**Campos mínimos**
- prestamoId
- fechaPago
- monto
- referencia
- observacion

**Criterio de aceptación**
- registro de pago funcional
- evento generado
- tests

---

### BT-4002 — Lógica de imputación
**Objetivo**  
Aplicar pagos correctamente.

**Escenarios obligatorios**
- pago exacto
- pago parcial
- pago múltiple
- pago adelantado

**Criterio de aceptación**
- saldos correctos
- tests exhaustivos

---

### BT-4003 — UI de pagos
**Objetivo**  
Registrar pagos desde el detalle del préstamo.

**Criterio de aceptación**
- formulario simple
- selección de cuota(s)
- historial visible

---

## ÉPICA 5 — Dashboard y métricas

### BT-5001 — Backend del dashboard
**Objetivo**  
Mostrar lo que realmente le importa a la operadora.

**Indicadores obligatorios**
- monto invertido
- monto ganado
- monto por ganar
- deuda total
- préstamos activos

**Criterio de aceptación**
- endpoint resumen funcional
- cálculos correctos
- tests

---

### BT-5002 — UI del dashboard
**Objetivo**  
Crear pantalla inicial útil.

**Criterio de aceptación**
- cards claras
- tabla opcional de préstamos activos recientes

---

## ÉPICA 6 — Referencias, colores y anotaciones

### BT-6001 — Referencias del préstamo
**Objetivo**  
Agregar referencias humanas sin volver el sistema críptico.

**Criterio de aceptación**
- referencia y notas visibles en alta, edición y detalle

---

### BT-6002 — Colores de referencia para persona
**Objetivo**  
Dar señal visual rápida.

**Criterio de aceptación**
- color editable
- visible en listado y detalle

---

## ÉPICA 7 — Ajustes manuales

### BT-7001 — Renegociación simple
**Objetivo**  
Permitir cambiar condiciones futuras sin tocar pagos ya registrados.

**Criterio de aceptación**
- se pueden ajustar cuotas futuras
- queda evento histórico
- no rompe integridad

---

### BT-7002 — UI de ajuste manual
**Objetivo**  
Editar cuotas futuras desde la interfaz.

**Criterio de aceptación**
- edición clara
- confirmación previa
- historial visible después

---

## ÉPICA 8 — Legajo y adjuntos (post-MVP inicial)

### BT-8001 — LegajoPersona
**Objetivo**  
Separar información operativa de información contextual.

**Campos iniciales**
- referenciasPersonales
- garantias
- detalleIngresos
- anotacionesPrivadas

**Criterio de aceptación**
- API legajo funcional
- separado de préstamos activos

---

### BT-8002 — UI de Legajo
**Objetivo**  
Mostrar legajo como sección separada.

**Criterio de aceptación**
- legajo editable
- claramente separado del resto

---

### BT-8003 — Adjuntar archivos al legajo
**Objetivo**  
Guardar comprobantes de transferencias realizadas y documentos relevantes.

**Criterio de aceptación**
- upload básico
- metadata persistida
- descarga funcional

---

### BT-8004 — UI de adjuntos del legajo
**Objetivo**  
Subir, listar y descargar archivos.

**Criterio de aceptación**
- flujo simple y claro

---

## ÉPICA 9 — Seguridad mínima (si hace falta en la etapa)

### BT-9001 — Login interno backend
**Objetivo**  
Proteger la API para una sola operadora.

**Criterio de aceptación**
- login funcional
- endpoints protegidos
- tests básicos

---

### BT-9002 — Login frontend
**Objetivo**  
Agregar pantalla de acceso e integración con backend.

**Criterio de aceptación**
- login funcional
- rutas protegidas
- logout funcional

---

# 3. Orden sugerido de ejecución

## Lote 1
- BT-0001
- BT-0002
- BT-0003

## Lote 2
- BT-1001
- BT-1002
- BT-1003

## Lote 3
- BT-2001
- BT-2002

## Lote 4
- BT-3001
- BT-3002
- BT-3003
- BT-3004
- BT-3005

## Lote 5
- BT-4001
- BT-4002
- BT-4003

## Lote 6
- BT-5001
- BT-5002
- BT-6001
- BT-6002

## Lote 7
- BT-7001
- BT-7002

## Lote 8
- BT-8001
- BT-8002
- BT-8003
- BT-8004

## Lote 9
- BT-9001
- BT-9002

---

# 4. Fuera del MVP

Estas tareas no entran en la primera versión:
- recordatorios automáticos
- mensajes automáticos para WhatsApp
- portal cliente
- pagaré digital
- recibos complejos en PDF
- scoring avanzado
- punitorio automático
- notificaciones push
- reportes complejos por vencimientos
- multiusuario con permisos finos

---

# 5. Plantilla estándar para pasar tareas a Codex

```text
Contexto funcional:
[explicar brevemente el porqué de la tarea]

Objetivo:
[qué debe quedar resuelto]

Alcance:
[qué sí entra]

Fuera de alcance:
[qué no debe tocar]

Restricciones:
- usar nombres en español para el dominio
- mantener código simple
- no sobreingenierizar
- agregar tests
- no romper código existente

Entregable esperado:
- archivos modificados
- tests
- breve resumen de decisiones