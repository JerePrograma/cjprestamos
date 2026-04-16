# AGENTS.md

## Propósito del repositorio

Este repositorio contiene un sistema web interno de préstamos para conocidos.

El objetivo principal del producto es:
- mejorar la organización,
- resolver cuentas matemáticas simples,
- registrar personas, préstamos, cuotas, pagos y legajos,
- mostrar métricas claras: monto invertido, monto ganado, monto por ganar y deuda total.

No es una fintech, no es un sistema bancario, no es una plataforma de cobranza automática.

El enfoque correcto es **manual-first**:
- el sistema asiste,
- la operadora decide,
- el sistema no debe imponer rigidez innecesaria.

---

## Reglas de negocio clave

### 1. El sistema debe parecer una libreta digital ordenada, no una herramienta agresiva de cobranza
No priorizar:
- automatizaciones molestas,
- recordatorios automáticos,
- mensajes automáticos de WhatsApp,
- punitorios automáticos,
- notificaciones innecesarias.

### 2. La matemática simple debe ser impecable
Errores que no se toleran:
- suma incorrecta de cuotas,
- cálculo incorrecto de total a devolver,
- saldo pendiente incorrecto,
- monto ganado o por ganar incorrecto,
- deuda total incorrecta.

### 3. El sistema debe soportar trabajo manual
Debe permitir:
- porcentaje fijo sugerido,
- ajuste manual de monto final,
- fechas manuales,
- cuotas manuales,
- referencias personales,
- renegociación conversada.

### 4. La operadora es la única que modifica datos
Por ahora el sistema está pensado para una sola operadora interna.
No introducir permisos complejos ni flujos multiusuario sofisticados.

### 5. Separación conceptual obligatoria
Mantener siempre separados:
- **Persona**: datos operativos básicos
- **Legajo**: información más personal, referencias, garantías, ingresos, notas privadas
- **Préstamo**: operación económica vigente o histórica

No mezclar legajo con la vista principal de préstamos activos.

---

## Prioridades del MVP

Orden de prioridad real:
1. Personas
2. Legajo separado
3. Préstamos
4. Cálculo simple por porcentaje fijo
5. Cuotas
6. Pagos
7. Dashboard de métricas
8. Referencias y anotaciones

Si una tarea compite con otra, priorizar siempre:
- consistencia de dominio,
- claridad operativa,
- cálculo correcto,
- mantenimiento simple.

---

## Stack objetivo

### Backend
- Java 21
- Spring Boot 3.x
- Maven
- Spring Web
- Spring Data JPA
- PostgreSQL
- Flyway
- Spring Security simple
- JUnit 5 / Mockito

### Frontend
- React
- TypeScript
- Vite
- React Router
- TanStack Query
- Tailwind CSS
- Axios

---

## Convenciones generales

### Idioma
- Dominio, nombres funcionales, textos visibles y documentación: **en español**.
- Se aceptan nombres técnicos inevitables en inglés solo cuando son convenciones del framework o librería.

### Estilo
- Código claro, sobrio y mantenible.
- Evitar sobreingeniería.
- Evitar patrones innecesarios.
- Evitar abstracciones “por si acaso”.
- Evitar servicios gigantes.
- Evitar controladores obesos.
- Evitar DTOs ambiguos.

### Diseño
- Separar responsabilidades de forma razonable.
- Prefiere composición y servicios pequeños.
- No mezclar lógica de cálculo con persistencia.
- No mezclar lógica de negocio con transformaciones de UI.

### Comentarios
- Comentar solo cuando una regla de negocio no sea obvia.
- No llenar el código de comentarios redundantes.

---

## Convenciones backend

### Paquetes sugeridos
- `config`
- `auth`
- `common`
- `persona`
- `legajo`
- `prestamo`
- `cuota`
- `pago`
- `dashboard`
- `audit`

### Reglas backend
- Usar DTOs de request y response separados de entidades.
- Validar entradas con Bean Validation.
- Las entidades deben modelar el dominio, no la UI.
- Usar servicios explícitos para reglas de negocio.
- Usar migraciones Flyway para cada cambio estructural.
- No romper compatibilidad sin motivo.

### Cálculo
Todo cálculo económico debe quedar aislado en servicios específicos y cubierto por tests.

Ejemplos:
- cálculo de total por porcentaje fijo,
- cálculo de cuota sugerida,
- cálculo de saldo pendiente,
- cálculo de ganado,
- cálculo de por ganar,
- imputación de pagos.

### Persistencia
- Usar PostgreSQL.
- Nombres de tablas/columnas en `snake_case`.
- Evitar consultas complejas prematuras.
- Indizar lo necesario, no todo.

---

## Convenciones frontend

### Organización
- separar por módulos,
- no concentrar toda la lógica en `pages/`,
- tener componentes reutilizables,
- mantener formularios simples.

### UX esperada
La UI debe ser:
- clara,
- operativa,
- sobria,
- útil,
- más cercana a una herramienta de gestión que a una app de marketing.

### Reglas frontend
- Textos visibles en español.
- Evitar animaciones innecesarias.
- Evitar complejidad visual gratuita.
- Formularios directos.
- Mostrar métricas principales claramente.
- Legajo separado visualmente de préstamos activos.

### Estado de datos
- Usar TanStack Query para fetch/cache.
- No duplicar innecesariamente estado remoto en stores globales.
- Mantener la lógica de formularios acotada.

---

## Reglas del dominio funcional

### Persona
Representa un conocido o cliente.
Debe soportar:
- nombre,
- alias,
- teléfono,
- observación rápida,
- color/referencia,
- si cobra a tiempo,
- si tiene ingreso extra,
- activo.

### Legajo
Debe ser un espacio separado para:
- referencias personales,
- garantías,
- detalle de ingresos,
- anotaciones privadas,
- archivos relevantes.

### Préstamo
Debe soportar:
- monto inicial,
- porcentaje fijo sugerido,
- ajuste manual,
- cantidad de cuotas,
- frecuencia,
- fechas manuales,
- referencia/código,
- observaciones,
- estado.

### Cuotas
Deben poder generarse:
- mensuales,
- cada X días,
- manuales.

### Pagos
Deben poder registrar:
- fecha,
- monto,
- referencia,
- observación,
- una o varias cuotas,
- pago parcial,
- pago adelantado,
- pago múltiple.

### Dashboard
Debe priorizar:
- monto invertido,
- monto ganado,
- monto por ganar,
- deuda total,
- préstamos activos.

No priorizar vencimientos complejos en el MVP.

---

## Qué NO hacer

No introducir sin pedido explícito:
- portal de clientes,
- sistema de notificaciones automáticas,
- integración con WhatsApp,
- punitorios automáticos,
- scoring complejo,
- recibos PDF,
- pagarés,
- multi-tenant,
- CQRS/event sourcing,
- microservicios,
- colas,
- WebSockets,
- caches distribuidos,
- infra compleja.

No rediseñar todo el proyecto cuando la tarea es puntual.

No cambiar nombres funcionales del dominio a inglés si no es estrictamente necesario.

No reemplazar una solución simple por una “más elegante” si no aporta valor real.

---

## Forma correcta de trabajar en una tarea

Cuando recibas una tarea:
1. leer el contexto y el backlog,
2. identificar archivos relevantes,
3. hacer el cambio mínimo correcto,
4. agregar o ajustar tests,
5. ejecutar validaciones,
6. resumir lo que cambiaste y cualquier decisión relevante.

Si hay ambigüedad:
- elegir la solución más simple,
- documentar la decisión,
- no inventar funcionalidades no pedidas.

---

## Validaciones obligatorias antes de terminar

### Backend
Ejecutar, si aplica:
- `./mvnw test` o `mvn test`

### Frontend
Ejecutar, si aplica:
- `npm run build`
- `npm run test` si existieran tests

### General
- verificar que el proyecto siga compilando,
- verificar que no haya imports rotos,
- verificar que no queden TODO críticos sin mencionar.

Si no es posible ejecutar algo, explicarlo claramente.

---

## Formato esperado de la respuesta de entrega

Cada entrega debe incluir:
1. resumen breve de lo implementado,
2. archivos principales modificados,
3. validaciones ejecutadas,
4. riesgos o pendientes detectados.

No dar respuestas largas e innecesarias.
No ocultar limitaciones.

---

## Criterio de calidad

Una tarea está bien hecha si:
- respeta el dominio,
- no rompe el flujo manual-first,
- mantiene la separación Persona / Legajo / Préstamo,
- los cálculos son correctos,
- el cambio es simple de entender,
- tiene pruebas razonables,
- no introduce complejidad gratis.

