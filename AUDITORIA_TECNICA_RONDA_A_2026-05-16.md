# Auditoría técnica integral — Ronda A (2026-05-16)

## Estado final de esta ronda
**Estado:** parcial (Ronda A aplicada, rondas B/C/D pendientes).

## 1) Mapa de flujos reales de usuario
- **Login:** `LoginPage` usa Basic Auth contra `/auth/me`, recuerda usuario en `sessionStorage`, no persiste credencial ni auto-login real.
- **Dashboard:** resumen KPI + atajos + préstamos recientes + personas recientes.
- **Personas:** listado + búsqueda + alta/edición + detalle + legajo en paneles.
- **Alta de préstamo:** desde `PrestamosPage` con panel de alta; al crear, selecciona préstamo y cambia a workspace.
- **Workspace de préstamo:** detalle, cuotas, pagos, ajustes y renegociaciones desde panel principal.
- **Cuotas:** generación manual/automática y ajustes futuros en módulo de cuotas.
- **Pagos:** registro de pago y asignación/imputación a cuotas.
- **Control de caja:** KPIs de caja, rendimiento, cierre mensual, proyecciones.
- **Legajos:** pantalla dedicada + panel por persona para adjuntos.
- **Simulador:** módulo específico de simulación de préstamo y cuotas.

## 2) Componentes/pantallas con exceso de responsabilidad
- `PrestamosPage.tsx` concentra: navegación móvil, selección activa, sincronización URL, alta y workspace.
- `PrestamoWorkspace` concentra demasiadas sub-operaciones (detalle/cuotas/pagos/ajustes).
- `DashboardPage.tsx` combina demasiadas secciones operativas en una sola vista.

## 3) Repeticiones UX detectadas
- Bloques de carga/error repetidos entre dashboard/control de caja.
- Mensajes descriptivos largos y redundantes en headers de pantallas operativas.
- Patrones de card métrica con pequeñas variantes no reutilizadas.

## 4) Puntos donde el usuario puede perderse
- En préstamos, coexistencia de “alta/listado/workspace” en una sola pantalla puede confundir estado actual.
- En dashboard, exceso de foco compartido entre KPI + atajos + recientes.
- En control de caja, lectura ejecutiva y detalle conviven sin separación fuerte.

## 5) Puntos backend con ambigüedad operativa (a reforzar en ronda D)
- Reglas de redondeo y separación capital/interés deben verificarse en más tests de borde.
- Renegociación e imputaciones requieren pruebas adicionales de idempotencia operativa.
- Errores HTTP de negocio pueden estandarizarse aún más por código/causa.

## 6) Riesgos de integración HogarIA
- Confirmar estabilidad de alias y contrato read-only en `/api/v1/integration/hogaria/**` en cada entrega.
- Confirmar que seguridad por rol `INTEGRATION` no se degrade en cambios de auth MVP.

## 7) Riesgos seguridad/config local
- Basic Auth válida solo MVP: riesgo inherente de credenciales estáticas en entornos no controlados.
- Validar que no se filtren configuraciones sensibles fuera de `application-dev`/`application-test`.

## Quick wins aplicados en esta ronda
1. Se consolidó patrón reutilizable de estados transversales de feedback en frontend:
   - `ErrorState`
   - `LoadingState`
2. Se reemplazó duplicación de bloques de error/carga en Dashboard.
3. Se reemplazó duplicación de error en Control de caja.

## Próximos pasos propuestos (B/C/D)
- **B (Préstamos):** separar `PrestamosPage` en hooks de navegación/selección + paneles más acotados.
- **C (Personas/Legajos):** simplificar empty states y acciones ambiguas de edición/baja.
- **D (Backend/tests):** reforzar pruebas de redondeo, renegociación y HogarIA read-only.
