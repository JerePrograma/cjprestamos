# AGENTS.md — Backend

## Alcance
Estas instrucciones aplican a todo el código dentro de `/backend`.

## Objetivo del backend
Implementar una API sólida, simple y trazable para un sistema interno de préstamos manual-first.

El backend **no** es una fintech ni un sistema bancario. Es una herramienta operativa para:
- registrar personas,
- guardar legajos separados,
- crear préstamos manuales o semi-asistidos,
- calcular montos simples por porcentaje fijo,
- generar y ajustar cuotas,
- registrar pagos,
- imputar pagos a cuotas,
- exponer métricas básicas del dashboard.

## Prioridades funcionales
Priorizar siempre este orden:
1. Consistencia matemática
2. Trazabilidad de cambios
3. Modelo simple y mantenible
4. API clara para frontend React
5. Extensibilidad moderada sin sobreingeniería

## Reglas de dominio obligatorias
- El sistema es **manual-first**.
- La operadora puede ajustar manualmente importes, fechas y condiciones.
- El cálculo automático es una ayuda, no una verdad absoluta.
- Debe existir separación entre:
  - `Persona` (datos operativos básicos)
  - `LegajoPersona` (anotaciones privadas, referencias, garantías, ingresos)
  - `Prestamo` (operación financiera)
- Los préstamos pueden tener cuotas generadas automáticamente o manuales.
- Los pagos pueden ser:
  - exactos,
  - parciales,
  - múltiples,
  - adelantados.
- No introducir punitorios automáticos en el MVP.
- No introducir notificaciones automáticas en el MVP.
- No introducir portal cliente en el MVP.

## Principios de implementación
- Favorecer servicios chicos y con una responsabilidad clara.
- Evitar clases “Dios”.
- Evitar lógica compleja en controladores.
- Mantener la lógica de negocio en servicios de dominio/aplicación.
- Validar inputs en DTOs y reforzar reglas en servicios.
- No duplicar reglas entre capas sin motivo.
- Si una decisión de dominio es discutible, documentarla en un comentario breve o en README técnico.

## Convenciones de código
- Usar nombres del dominio en español cuando tenga sentido:
  - `Persona`, `Prestamo`, `Cuota`, `Pago`, `ImputacionPago`, etc.
- Mantener nombres técnicos estándar cuando sea mejor para Spring/JPA.
- No usar abreviaturas oscuras.
- Métodos cortos y claros.
- Evitar comentarios redundantes; comentar solo donde la regla de negocio no sea obvia.
- No usar Lombok salvo que realmente reduzca ruido sin ocultar demasiado comportamiento.

## Arquitectura sugerida
Organizar por módulos funcionales:
- `persona`
- `legajo`
- `prestamo`
- `pago`
- `dashboard`
- `auth`
- `common`
- `audit`

Dentro de cada módulo, preferir:
- `controller`
- `dto`
- `service`
- `repository`
- `model`
- `mapper` si hace falta

## Persistencia
- Base de datos: PostgreSQL
- Migraciones: Flyway
- Usar SQL legible y explícito.
- Nombrar tablas/columnas en `snake_case`.
- Crear índices solo donde tengan valor real.
- No introducir optimizaciones prematuras.

## API REST
- Prefijo general: `/api`
- Responder JSON consistente.
- Errores validados con estructura clara.
- No filtrar entidades JPA directamente al exterior.
- Usar DTOs para request/response.

## Seguridad
- Seguridad mínima para operadora interna.
- No complejizar permisos en el MVP.
- Proteger endpoints salvo salud/login.
- Mantener el diseño preparado para crecer, pero sin construir ahora lo que no se usa.

## Testing
Cada tarea backend debe intentar dejar:
- tests unitarios para servicios críticos,
- tests de controller para endpoints importantes,
- tests de integración solo cuando agreguen valor real.

Priorizar tests en:
- cálculo simple,
- generación de cuotas,
- imputación de pagos,
- dashboard matemático,
- ajustes manuales.

## Qué NO hacer
- No convertir el backend en una arquitectura enterprise innecesaria.
- No agregar Kafka, colas, eventos distribuidos ni microservicios.
- No meter CQRS, DDD ceremonial ni factories innecesarias.
- No agregar recordatorios automáticos ni cron jobs si no fueron pedidos en la tarea.
- No agregar features “por si en el futuro”.
- No tocar módulos no relacionados sin necesidad clara.

## Antes de cerrar una tarea
Verificar:
- compila,
- tests relevantes pasan,
- migraciones corren,
- DTOs y validaciones están alineados,
- no se rompió una regla de negocio del MVP,
- el cambio quedó acotado al alcance pedido.

## Formato esperado de entrega de Codex
Cuando cierres una tarea backend, informar brevemente:
1. qué cambiaste,
2. qué archivos tocaste,
3. qué decisiones tomaste,
4. qué tests agregaste o ejecutaste,
5. qué queda pendiente si algo no entró.
