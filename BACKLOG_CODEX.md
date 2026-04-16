# BACKLOG_CODEX.md

Backlog técnico priorizado para implementar el MVP del sistema interno de préstamos.

## Cómo usar este archivo con Codex

Este archivo **no reemplaza** el prompt maestro.

Uso recomendado:
1. abrir Codex sobre el repositorio
2. pasarle primero el contenido de `PROMPT_MAESTRO_CODEX.txt`
3. luego pedirle que ejecute una tarea puntual de este backlog
4. trabajar de a una tarea o un lote pequeño por vez

> Recomendación práctica: si vas a dejar instrucciones persistentes dentro del repo, conviene además crear un `AGENTS.md`, porque Codex puede usar esos archivos para guiarse dentro del proyecto. El backlog sirve como plan; `AGENTS.md` sirve como guía operativa del repo.

---

# 0. Decisiones base del proyecto

## Enfoque funcional
- sistema interno
- una sola operadora principal
- uso manual-first
- cálculo asistido por porcentaje fijo
- posibilidad de ajustar montos y fechas manualmente
- separación entre préstamos activos y legajo
- foco del dashboard en invertido, ganado, por ganar y deuda total

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
- `legajo`
- `prestamo`
- `cuota`
- `pago`
- `dashboard`
- `audit`
- `common`

## Módulos frontend sugeridos
- `modules/personas`
- `modules/legajos`
- `modules/prestamos`
- `modules/pagos`
- `modules/dashboard`
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

**Prompt sugerido para Codex**
```text
Prepará la estructura inicial del monorepo para un sistema interno de préstamos.

Requisitos:
- crear carpetas backend, frontend, docs, infra
- agregar README.md en la raíz con explicación breve
- agregar .gitignore adecuado para Java, Node, Spring Boot, Vite e IDEs
- agregar .editorconfig y .gitattributes razonables
- no crear código de negocio todavía
- mantener los textos en español
```

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

**Prompt sugerido para Codex**
```text
Dentro de /backend, crear un proyecto Spring Boot 3 con Java 21 y Maven.

Requisitos:
- dependencias: web, validation, data-jpa, security, postgresql, flyway, test
- crear GET /api/health que responda {"status":"ok"}
- crear application.yml, application-dev.yml, application-test.yml
- dejar Flyway configurado
- agregar test de contexto y test del endpoint health
- usar dominio en español cuando aplique
```

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

**Prompt sugerido para Codex**
```text
Dentro de /frontend, crear una app React + TypeScript + Vite.

Requisitos:
- React Router
- Axios
- TanStack Query
- Tailwind CSS
- layout base con sidebar y header
- rutas: /, /personas, /prestamos, /pagos, /legajos
- página Dashboard placeholder
- textos visibles en español
```

---

## ÉPICA 1 — Dominio y persistencia

### BT-1001 — Modelar entidades del MVP
**Objetivo**
Crear el núcleo del dominio.

**Entidades mínimas**
- `UsuarioInterno`
- `Persona`
- `LegajoPersona`
- `Prestamo`
- `Cuota`
- `Pago`
- `ImputacionPago`
- `EventoPrestamo`

**Criterio de aceptación**
- entidades coherentes
- relaciones consistentes
- enums definidos
- timestamps básicos

**Prompt sugerido para Codex**
```text
Modelar las entidades JPA del MVP del sistema de préstamos.

Entidades:
- UsuarioInterno
- Persona
- LegajoPersona
- Prestamo
- Cuota
- Pago
- ImputacionPago
- EventoPrestamo

Reglas funcionales:
- sistema manual-first
- legajo separado de préstamos activos
- una persona puede tener varios préstamos
- un préstamo tiene varias cuotas
- un pago puede imputarse a una o varias cuotas

Requisitos:
- usar nombres en español
- relaciones JPA correctas
- enums para estados
- mantener diseño simple y mantenible
```

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

**Prompt sugerido para Codex**
```text
Generar la migración Flyway inicial para PostgreSQL a partir del modelo MVP ya definido.

Requisitos:
- usar snake_case
- crear PK, FK e índices razonables
- agregar restricciones básicas de nulidad y unicidad cuando correspondan
- evitar sobreingeniería
- alinear nombres SQL al dominio en español
```

---

### BT-1003 — Auditoría temporal base
**Objetivo**
Agregar `created_at` y `updated_at` automáticos.

**Criterio de aceptación**
- aplicado al menos a Persona, Prestamo, Cuota, Pago, LegajoPersona

**Prompt sugerido para Codex**
```text
Agregar soporte base de auditoría temporal a las entidades principales.

Requisitos:
- created_at y updated_at automáticos
- solución simple y mantenible
- aplicar a Persona, Prestamo, Cuota, Pago y LegajoPersona
- incluir tests básicos si corresponde
```

---

## ÉPICA 2 — Seguridad mínima

### BT-2001 — Login interno backend
**Objetivo**
Proteger la API para una sola operadora.

**Criterio de aceptación**
- login funcional
- endpoints protegidos
- tests básicos

**Prompt sugerido para Codex**
```text
Implementar seguridad mínima para el backend.

Contexto:
- no hay clientes con acceso
- solo una operadora interna
- necesitamos proteger la API sin complejidad innecesaria

Requisitos:
- POST /api/auth/login
- proteger el resto de endpoints salvo /api/health
- definir un único rol OPERADOR
- decidir entre JWT o sesión simple y documentar la decisión
- agregar tests del login y acceso protegido
```

---

### BT-2002 — Login frontend
**Objetivo**
Agregar pantalla de acceso e integración con backend.

**Criterio de aceptación**
- login funcional
- rutas protegidas
- logout funcional

**Prompt sugerido para Codex**
```text
Implementar en React la autenticación para la operadora interna.

Requisitos:
- pantalla /login
- formulario usuario + contraseña
- integración con /api/auth/login
- protección de rutas privadas
- logout
- manejo simple de errores
- UI clara y operativa
```

---

## ÉPICA 3 — Personas y legajos

### BT-3001 — CRUD de Persona
**Objetivo**
Registrar personas conocidas.

**Campos mínimos**
- nombre
- alias
- teléfono
- observación rápida
- color referencia
- cobra en fecha
- tiene ingreso extra
- activo

**Criterio de aceptación**
- CRUD REST funcional
- validaciones
- tests

**Prompt sugerido para Codex**
```text
Implementar el módulo backend de Personas.

Campos mínimos:
- nombre
- alias
- telefono
- observacionRapida
- colorReferencia
- cobraEnFecha
- tieneIngresoExtra
- activo

Requisitos:
- endpoints CRUD REST
- DTOs separados de entidades
- validaciones
- service + repository
- tests unitarios y de controller
- todo en español donde aplique
```

---

### BT-3002 — UI de Personas
**Objetivo**
Alta, listado y detalle de personas.

**Criterio de aceptación**
- listado con búsqueda simple
- alta/edición
- detalle usable

**Prompt sugerido para Codex**
```text
Implementar en React el módulo de Personas.

Requisitos:
- listado con búsqueda simple por nombre o alias
- alta y edición
- vista detalle
- mostrar color/referencia visual
- usar TanStack Query
- formularios claros y simples
```

---

### BT-3003 — Legajo separado
**Objetivo**
Separar información operativa de información contextual.

**Campos iniciales**
- referencias personales
- garantías
- detalle de ingresos
- anotaciones privadas

**Criterio de aceptación**
- API legajo funcional
- separado de préstamos activos

**Prompt sugerido para Codex**
```text
Implementar el módulo de LegajoPersona separado del módulo Persona.

Contexto funcional:
- la usuaria quiere diferenciar préstamos actuales de legajo
- el legajo sirve para referencias, garantías, ingresos y anotaciones privadas

Requisitos:
- entidad LegajoPersona asociada a Persona
- endpoint para consultar y actualizar el legajo
- tests básicos
- diseño preparado para adjuntos futuros
```

---

### BT-3004 — UI de Legajo
**Objetivo**
Mostrar legajo como sección separada.

**Criterio de aceptación**
- legajo editable
- claramente separado del resto

**Prompt sugerido para Codex**
```text
Agregar en el frontend una sección de LegajoPersona separada de la vista principal de la persona.

Requisitos:
- en el detalle de persona, incluir una sección o pestaña llamada Legajo
- permitir editar referencias personales, garantías, detalle de ingresos y anotaciones privadas
- mantener separación visual entre datos operativos y legajo
```

---

## ÉPICA 4 — Préstamos manual-first

### BT-4001 — Crear módulo Prestamo
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

**Prompt sugerido para Codex**
```text
Implementar el módulo backend de Prestamos del MVP.

Contexto funcional:
- sistema manual-first
- cálculo sugerido por porcentaje fijo
- decisión final ajustable manualmente
- préstamos a conocidos
- forma de cobro depende de la persona
- fechas pueden ser manuales

Requisitos:
- endpoints crear, obtener detalle y listar activos
- DTOs y validaciones
- tests
- dejar preparado para generar cuotas
```

---

### BT-4002 — Servicio de cálculo simple
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

**Prompt sugerido para Codex**
```text
Crear un servicio puro de cálculo simple para préstamos.

Necesidades:
- calcular monto total a devolver a partir de monto inicial + porcentaje fijo
- calcular monto de cuota sugerido según cantidad de cuotas
- calcular monto invertido, monto ganado estimado y monto por ganar
- contemplar redondeo consistente

Requisitos:
- servicio desacoplado
- tests unitarios exhaustivos
- nombres en español
- no mezclar con persistencia
```

---

### BT-4003 — Generación de cuotas
**Objetivo**
Permitir cuotas automáticas o manuales.

**Soportar**
- mensual
- cada X días
- fechas manuales

**Criterio de aceptación**
- cuotas persistidas
- tests de escenarios

**Prompt sugerido para Codex**
```text
Implementar la generación de cuotas para el módulo de préstamos.

Reglas:
- si el préstamo es automático, generar cuotas según mensual o cada X días
- si el préstamo es manual, permitir fechas manuales
- cada cuota debe guardar número, fecha_vencimiento, monto_cuota, saldo_pendiente y estado

Requisitos:
- servicio de generación
- persistencia
- tests
```

---

### BT-4004 — UI alta de préstamo
**Objetivo**
Crear pantalla operativa de alta.

**Criterio de aceptación**
- cálculo sugerido visible
- posibilidad de ajuste manual
- integración con API

**Prompt sugerido para Codex**
```text
Implementar en React la pantalla de alta de préstamo.

Requisitos:
- seleccionar persona
- ingresar monto inicial
- ingresar porcentaje fijo sugerido
- cantidad de cuotas
- frecuencia
- fecha base
- opción de fechas manuales
- mostrar cálculo sugerido: total a devolver, cuota sugerida y ganancia estimada
- permitir ajustes manuales antes de guardar
- UI clara y operativa, no estilo fintech
```

---

### BT-4005 — Listado y detalle de préstamos
**Objetivo**
Visualizar estado de cada préstamo.

**Criterio de aceptación**
- listado funcional
- detalle con cuotas y resumen económico

**Prompt sugerido para Codex**
```text
Implementar en React el listado y detalle de préstamos.

Requisitos:
- listado de préstamos activos
- mostrar persona, monto inicial, total pactado, saldo pendiente y estado
- detalle con cabecera resumen, cuotas, referencias, observaciones y resumen económico
- diseño claro y orientado a operación diaria
```

---

## ÉPICA 5 — Pagos e imputación

### BT-5001 — Registrar pago
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

**Prompt sugerido para Codex**
```text
Implementar el módulo backend de registro de pagos.

Contexto funcional:
- la usuaria quiere asentar fecha de pago y número de cuota
- también quiere poder usar referencias
- puede haber pagos parciales, múltiples cuotas juntas o adelantos
- no hace falta pedir demasiados datos

Requisitos:
- registrar pago con fecha, monto, referencia y observación
- registrar imputaciones de pago a una o varias cuotas
- actualizar saldo pendiente de cuotas y préstamo
- dejar evento de auditoría simple
- tests obligatorios
```

---

### BT-5002 — Lógica de imputación
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

**Prompt sugerido para Codex**
```text
Implementar la lógica de imputación de pagos del sistema.

Escenarios obligatorios:
- pago exacto de una cuota
- pago parcial
- pago que cubre varias cuotas
- pago adelantado
- actualización correcta de saldo pendiente por cuota
- actualización correcta del préstamo

Requisitos:
- servicio desacoplado
- tests exhaustivos
- no introducir punitorios automáticos todavía
```

---

### BT-5003 — UI de pagos
**Objetivo**
Registrar pagos desde el detalle del préstamo.

**Criterio de aceptación**
- formulario simple
- selección de cuota(s)
- historial visible

**Prompt sugerido para Codex**
```text
Implementar en React el flujo de registro de pagos.

Requisitos:
- desde el detalle del préstamo, botón Registrar pago
- formulario con fecha, monto, referencia y observación
- posibilidad de seleccionar una o varias cuotas
- mostrar resultado de la imputación
- mostrar historial de pagos
- UX simple y rápida
```

---

## ÉPICA 6 — Dashboard y métricas

### BT-6001 — Backend del dashboard
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

**Prompt sugerido para Codex**
```text
Implementar el backend del Dashboard principal.

Indicadores:
- monto invertido
- monto ganado
- monto por ganar
- deuda total
- cantidad de préstamos activos

Contexto funcional:
- esto es lo primero que la usuaria quiere ver al entrar
- no priorizar vencimientos ni recordatorios en el MVP
- priorizar claridad matemática

Requisitos:
- endpoint GET /api/dashboard/resumen
- tests de cálculo
- usar servicios bien separados
```

---

### BT-6002 — UI del dashboard
**Objetivo**
Crear pantalla inicial útil.

**Criterio de aceptación**
- cards claras
- opcionalmente préstamos activos recientes

**Prompt sugerido para Codex**
```text
Implementar la pantalla de Dashboard en React.

Requisitos:
- mostrar cards con monto invertido, monto ganado, monto por ganar, deuda total y préstamos activos
- opcionalmente una tabla simple de préstamos activos recientes
- diseño sobrio y útil
- textos en español
```

---

## ÉPICA 7 — Referencias, colores y anotaciones

### BT-7001 — Referencias del préstamo
**Objetivo**
Agregar referencias humanas sin volver el sistema críptico.

**Criterio de aceptación**
- referencia y notas visibles en alta, edición y detalle

**Prompt sugerido para Codex**
```text
Agregar soporte formal a referencias y códigos humanos en el módulo de préstamos.

Contexto:
- la usuaria quiere referencias propias
- no quiere que el sistema se vuelva "código Excel"
- tiene que poder anotar de forma natural

Requisitos:
- campo referenciaCodigo en Prestamo
- notas internas editables
- mostrar esos campos en alta, edición y detalle
- no usar nombres técnicos feos en la UI
```

---

### BT-7002 — Colores de referencia para persona
**Objetivo**
Dar señal visual rápida.

**Criterio de aceptación**
- color editable
- visible en listado y detalle

**Prompt sugerido para Codex**
```text
Agregar soporte de color/referencia visual para Persona.

Objetivo funcional:
- marcar rápidamente si alguien inspira confianza o si suele cobrar a tiempo
- no hace falta scoring complejo

Requisitos:
- enum o catálogo simple de colores/referencias
- visible en listado y detalle
- editable
- diseño simple
```

---

## ÉPICA 8 — Ajustes manuales

### BT-8001 — Renegociación simple
**Objetivo**
Permitir cambiar condiciones futuras sin tocar pagos ya registrados.

**Criterio de aceptación**
- se pueden ajustar cuotas futuras
- queda evento histórico
- no rompe integridad

**Prompt sugerido para Codex**
```text
Implementar soporte de ajuste manual de un préstamo ya existente.

Contexto funcional:
- las condiciones pueden cambiar y se conversan
- no se refinancia formalmente todavía; se renegocia de forma simple
- hay que mantener referencia histórica

Requisitos:
- permitir modificar cuotas futuras y fechas futuras
- no tocar pagos ya registrados
- registrar EventoPrestamo con antes/después
- tests de integridad
```

---

### BT-8002 — UI de ajuste manual
**Objetivo**
Editar cuotas futuras desde la interfaz.

**Criterio de aceptación**
- edición clara
- confirmación previa
- historial visible después

**Prompt sugerido para Codex**
```text
Implementar en React la edición manual de cuotas futuras de un préstamo.

Requisitos:
- desde el detalle del préstamo, permitir editar fechas e importes de cuotas futuras
- pedir confirmación antes de guardar
- mostrar después el historial del cambio
- experiencia simple y clara
```

---

## ÉPICA 9 — Adjuntos mínimos

### BT-9001 — Adjuntar archivos al legajo
**Objetivo**
Guardar comprobantes de transferencias realizadas y documentos relevantes.

**Criterio de aceptación**
- upload básico
- metadata persistida
- descarga funcional

**Prompt sugerido para Codex**
```text
Implementar soporte mínimo de adjuntos para LegajoPersona.

Contexto funcional:
- interesa guardar transferencias realizadas y documentación relevante
- por ahora no hace falta foco en comprobantes de pagos recibidos

Requisitos:
- endpoint para subir archivo
- guardar metadata en base de datos
- asociar al legajo de la persona
- endpoint para descargar
- solución simple, local o preparada para storage configurable
```

---

### BT-9002 — UI de adjuntos del legajo
**Objetivo**
Subir, listar y descargar archivos.

**Criterio de aceptación**
- flujo simple y claro

**Prompt sugerido para Codex**
```text
Implementar en React la sección de adjuntos del LegajoPersona.

Requisitos:
- subir archivo
- listar archivos existentes
- descargar
- interfaz simple y prolija
- mantener separado del bloque de préstamos activos
```

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

## Lote 5
- BT-4001
- BT-4002
- BT-4003
- BT-4004
- BT-4005

## Lote 6
- BT-5001
- BT-5002
- BT-5003

## Lote 7
- BT-6001
- BT-6002
- BT-7001
- BT-7002

## Lote 8
- BT-8001
- BT-8002
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
```

---

# 6. Criterio de aceptación global del MVP

El MVP está bien si permite:
- crear personas
- crear legajo separado
- crear préstamos con cálculo sugerido por porcentaje fijo
- ajustar montos y fechas manualmente
- generar y ver cuotas
- registrar pagos
- imputar pagos correctamente
- calcular deuda total
- mostrar monto invertido, ganado y por ganar
- guardar referencias personales y colores sin volver el sistema rígido
- mantener código simple, consistente y testeado
