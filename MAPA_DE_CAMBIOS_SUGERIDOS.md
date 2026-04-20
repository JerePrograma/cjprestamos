# MAPA_DE_CAMBIOS_SUGERIDOS.md

> ⚠️ **Documento histórico (no vigente).**
> Este mapa describe un estado transitorio de implementación.
> Puede contradecir rutas o pantallas actuales.
> Estado vigente: `README.md`, `ESTADO_REAL_MVP.md` y `BACKLOG_CODEX.md`.

## 1. Documentación / gobernanza

### `README.md`
**Estado actual**
- alineado con estado real del MVP y prioridades vigentes.

### `AGENTS.md`
**Estado actual**
- criterio de cierre end-to-end y navegación honesta ya definidos en el repositorio.

### `BACKLOG_CODEX.md`
**Estado actual**
- backlog orientado a estado real con tareas en HECHA / PARCIAL / PENDIENTE.

### `ESTADO_REAL_MVP.md`
**Estado actual**
- snapshot activo del estado operativo del MVP.

### `CHECKLIST_CIERRE_MVP.md`
**Estado actual**
- checklist disponible para cierre funcional real.

---

## 2. Frontend / producto

### `frontend/src/modules/prestamos/PrestamosPage.tsx`
**Estado actual**
- bloque de generación automática implementado,
- editor de cuotas manuales implementado para `FECHAS_MANUALES`,
- estado de cuotas y cierre operativo visible en detalle.

### `frontend/src/modules/prestamos/hooks/usePrestamos.ts`
**Estado actual**
- `useGenerarCuotasPrestamo` implementado con invalidaciones de queries relevantes.

### `frontend/src/services/prestamos/prestamosApi.ts`
**Estado actual**
- `generarCuotasPrestamo` ya implementado con payload opcional manual.

### `frontend/src/modules/prestamos/types/prestamo.ts`
**Estado actual**
- tipos de cuotas manuales y payload de generación disponibles.

### `frontend/src/components/layout/LayoutPrincipal.tsx`
**Estado actual**
- navegación principal enfocada en módulos operativos (sin placeholders).

### `frontend/src/modules/pagos/PagosPage.tsx`
**Estado actual**
- no se expone como ruta principal; pagos se operan desde detalle de préstamo.

### `frontend/src/modules/legajos/LegajosPage.tsx`
**Estado actual**
- no se expone como ruta principal hasta tener valor operativo real.

---

## 3. Backend / calidad técnica

### `backend/src/test/java/com/cjprestamos/backend/CjprestamosBackendApplicationTests.java`
**Estado actual**
- prueba de arranque con contexto Spring + health endpoint implementada.

### tests de integración o controller relevantes
**Pendiente real**
- sumar integración con datasource/Flyway en un entorno de test controlado.
