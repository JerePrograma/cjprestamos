# MAPA_DE_CAMBIOS_SUGERIDOS.md

## 1. Documentación / gobernanza

### `README.md`
**Acción sugerida**
- corregir estructura prometida,
- agregar estado real del MVP,
- documentar criterio de cierre,
- dejar de vender archivos/carpetas no confirmados.

### `AGENTS.md`
**Acción sugerida**
- agregar criterio de cierre end-to-end,
- prohibir placeholders engañosos en navegación,
- exigir honestidad sobre tests débiles,
- forzar actualización del estado real del MVP.

### `BACKLOG_CODEX.md`
**Acción sugerida**
- pasar de backlog ideal a backlog con estado real,
- marcar tareas hechas / parciales / pendientes,
- agregar nuevas tareas críticas de UI de cuotas y honestidad de navegación.

### `ESTADO_REAL_MVP.md`
**Archivo nuevo sugerido**
- snapshot corto y honesto del estado del producto.

### `CHECKLIST_CIERRE_MVP.md`
**Archivo nuevo sugerido**
- checklist práctico para no declarar cosas cerradas antes de tiempo.

---

## 2. Frontend / producto

### `frontend/src/modules/prestamos/PrestamosPage.tsx`
**Acción sugerida**
- agregar bloque para generar cuotas automáticas,
- agregar editor para cuotas manuales cuando `FECHAS_MANUALES`,
- mostrar estado “cuotas generadas / pendientes de generar”,
- mostrar saldo pendiente real.

### `frontend/src/modules/prestamos/hooks/usePrestamos.ts`
**Acción sugerida**
- agregar hooks de generación de cuotas,
- invalidar detalle, cuotas, resumen y dashboard cuando corresponda.

### `frontend/src/services/prestamos/prestamosApi.ts`
**Acción sugerida**
- agregar llamadas a:
  - `POST /prestamos/{id}/cuotas/generar`
  - eventual helper para cuotas manuales.

### `frontend/src/modules/prestamos/types/prestamo.ts`
**Acción sugerida**
- agregar tipos para cuotas manuales / request de generación.

### `frontend/src/components/layout/LayoutPrincipal.tsx`
**Acción sugerida**
- ocultar `Pagos` y `Legajos`,
- o marcarlos explícitamente como pendientes,
- o dejar una sola entrada principal de trabajo si todavía no hay módulo real separado.

### `frontend/src/modules/pagos/PagosPage.tsx`
**Acción sugerida**
- o se elimina del menú,
- o se transforma en pantalla real,
- o se deja como futura y no navegable.

### `frontend/src/modules/legajos/LegajosPage.tsx`
**Acción sugerida**
- mismo criterio que Pagos.

---

## 3. Backend / calidad técnica

### `backend/src/test/java/com/cjprestamos/backend/CjprestamosBackendApplicationTests.java`
**Acción sugerida**
- restaurar o complementar con prueba de arranque real,
- no dejar solo una instanciación de clase.

### tests de integración o controller relevantes
**Acción sugerida**
- asegurar que el wiring mínimo importante siga vivo.
