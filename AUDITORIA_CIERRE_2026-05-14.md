# AUDITORIA_CIERRE_2026-05-14

## Estado: PARCIAL (honesto)

Se auditó el estado funcional con foco backend/frontend/tests. El sistema está operativo en flujos principales, pero el cierre total queda **parcial** por 2 razones:
1. `mvn test` falla en tests de integración dependientes de Testcontainers/PostgreSQL en este entorno.
2. Persisten tareas de hardening para lifecycle financiero avanzado (anulación/reversión + eventos en todos los casos de borde) a validar E2E adicionalmente.

## Ajustes aplicados en esta entrega

- `PrestamoRequest` deja de aceptar `estado` desde cliente en alta.
- El backend fija estado inicial seguro `ACTIVO`.
- El listado de préstamos activos/cobrables incluye `ACTIVO` + `RENEGOCIADO`.

## Matriz CRUD/lifecycle (resumen auditado)

| Entidad | Backend create | read/list | update | delete/soft-delete/anular | Frontend | Tests | Observaciones |
|---|---|---|---|---|---|---|---|
| Persona | Sí | Sí | Sí | Sí (delete) | Sí | Sí | Borrar persona requiere revisar impacto en préstamos históricos. |
| Prestamo | Sí | Sí | Parcial (referencia/obs) | No delete; estados (`CANCELADO`, `FINALIZADO`, `RENEGOCIADO`) | Sí | Sí | Alta ahora sin `estado` cliente; estado inicial backend. |
| Cuota | Generación auto/manual | Sí | Ajuste futuras | No delete destructivo | Sí | Sí | Reglas de ajuste ligadas a imputaciones/pagos. |
| Pago | Sí | Sí | No update directo | Anulación/reversión: parcial según implementación actual | Sí (detalle préstamo) | Sí | Validar idempotencia y reversión en escenarios concurrentes. |
| ImputacionPago | Interno | Sí (vía pagos/cuotas) | No | Reversión ligada a pago | Parcial | Sí | Debe mantenerse transaccional. |
| LegajoPersona | Sí | Sí | Sí | Archivado lógico (según flujo) | Sí | Sí | Operativo para legajo por persona. |
| LegajoAdjunto | Sí | Sí/list/download | Metadata implícita | Delete + eliminación física | Sí | Sí | Mantener validaciones de nombre/tipo/tamaño/path traversal. |
| EventoPrestamo | Interno | Sí (si expuesto) | No | No | Parcial | Parcial | Clave para trazabilidad de lifecycle financiero. |
| UsuarioSistema | Sí | Sí | Sí (estado/password) | Baja lógica/desactivación | Sí (auth) | Sí | Evitar defaults inseguros fuera dev/local. |

## Integración HogarIA

- Se debe seguir validando parity entre legacy `/api/integration/hogaria/**` y v1 `/api/v1/integration/hogaria/**` con tests de contrato sobre fixtures estables.
- Endpoints de integración deben mantenerse read-only con roles `INTEGRATION`, `OPERADORA`, `ADMIN`.
