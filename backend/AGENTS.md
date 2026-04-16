# AGENTS.md — Backend

## Alcance
Estas instrucciones aplican a todo el código dentro de `/backend`.

## Objetivo del backend
Implementar una API sólida, simple y trazable para un sistema interno de préstamos manual-first.

El backend no es una fintech ni un sistema bancario.  
Es una herramienta operativa para:
- registrar personas,
- crear préstamos manuales o semi-asistidos,
- calcular montos simples por porcentaje fijo,
- generar y ajustar cuotas,
- registrar pagos,
- imputar pagos a cuotas,
- exponer métricas básicas del dashboard.

## Prioridades funcionales
Priorizar siempre este orden:
1. Consistencia matemática
2. Modelo simple y mantenible
3. API clara para frontend React
4. Trazabilidad razonable de cambios
5. Extensibilidad moderada sin sobreingeniería

## Reglas de dominio obligatorias
- El sistema es **manual-first**.
- La operadora puede ajustar manualmente importes, fechas y condiciones.
- El cálculo automático es una ayuda, no una verdad absoluta.
- Debe existir separación entre:
  - `Persona`
  - `Prestamo`
  - `LegajoPersona` cuando se implemente
- Los préstamos pueden tener cuotas generadas automáticamente o manuales.
- Los pagos pueden ser:
  - exactos,
  - parciales,
  - múltiples,
  - adelantados.
- No introducir punitorios automáticos en el MVP.
- No introducir recordatorios automáticos en el MVP.
- No introducir portal cliente en el MVP.

## Principios de implementación
- Favorecer servicios chicos y con una responsabilidad clara.
- Evitar clases “Dios”.
- Evitar lógica compleja en controladores.
- Mantener la lógica de negocio en servicios.
- Validar inputs en DTOs y reforzar reglas en servicios.
- No duplicar reglas entre capas sin motivo.

## Convenciones de código
- Usar nombres del dominio en español:
  - `Persona`, `Prestamo`, `Cuota`, `Pago`, `ImputacionPago`, etc.
- Mantener nombres técnicos estándar cuando sea mejor para Spring/JPA.
- No usar abreviaturas oscuras.
- Métodos cortos y claros.
- No usar Lombok salvo necesidad real y justificada.

## Arquitectura sugerida
Organizar por módulos funcionales:
- `persona`
- `prestamo`
- `pago`
- `dashboard`
- `legajo`
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
- No filtrar entidades JPA directamente al exterior.
- Usar DTOs para request/response.
- Los errores deben ser claros y estables.

## Seguridad
- Seguridad mínima para operadora interna.
- No complejizar permisos en el MVP.
- Si la tarea no requiere auth, no expandir auth por cuenta propia.

## Testing
Cada tarea backend debe intentar dejar:
- tests unitarios para servicios críticos,
- tests de controller para endpoints importantes.

Priorizar tests en:
- cálculo simple,
- generación de cuotas,
- imputación de pagos,
- dashboard matemático,
- ajustes manuales.

## Qué NO hacer
- No agregar Kafka, colas, eventos distribuidos ni microservicios.
- No meter CQRS, DDD ceremonial ni factories innecesarias.
- No agregar features “por si en el futuro”.
- No tocar módulos no relacionados sin necesidad clara.

## Antes de cerrar una tarea
Verificar:
- compila,
- tests relevantes pasan,
- migraciones corren si fueron agregadas,
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