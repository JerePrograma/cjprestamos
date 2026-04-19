# IMPLEMENTACION_UI_CUOTAS.md

## Objetivo

Dejar documentado el flujo vigente para:
**generar o cargar cuotas desde la UI principal de préstamos**.

---

## Qué ya existe

### Backend ya soporta
- `POST /api/prestamos/{prestamoId}/cuotas/generar`
- `GET /api/prestamos/{prestamoId}/cuotas`

Además:
- soporta `MENSUAL`,
- soporta `CADA_X_DIAS`,
- soporta `FECHAS_MANUALES`,
- valida suma exacta y cantidad en manuales.

---

## Estado actual en frontend

La pantalla de préstamos hoy:
- crea préstamo,
- calcula,
- genera cuotas automáticas,
- guarda cuotas manuales para `FECHAS_MANUALES`,
- lista cuotas,
- registra pagos,
- muestra historial de pagos,
- permite editar referencia y observaciones,
- muestra cierre operativo del préstamo (estado cuotas, total programado, total pagado, saldo pendiente).

---

## Implementación aplicada

### Paso 1 — API frontend
Archivo: `frontend/src/services/prestamos/prestamosApi.ts`

Implementado:
- `generarCuotasPrestamo(id: number, payload?: GenerarCuotasPayload)`

Payload esperado:
- vacío para automático,
- con `cuotasManuales` para `FECHAS_MANUALES`.

---

### Paso 2 — Hook de React Query
Archivo: `frontend/src/modules/prestamos/hooks/usePrestamos.ts`

Implementado:
- `useGenerarCuotasPrestamo()`

En `onSuccess` invalida:
- `['prestamos']`
- `['prestamos', id]`
- `['prestamos', id, 'cuotas']`
- `['dashboard']`

---

### Paso 3 — Tipos
Archivo: `frontend/src/modules/prestamos/types/prestamo.ts`

Implementado:
- `CuotaManualPayload`
- `GenerarCuotasPayload`

---

### Paso 4 — UI en `PrestamosPage.tsx`
Estado en el detalle del préstamo:

#### Caso A — préstamo sin cuotas y frecuencia automática
Mostrar botón:
- `Generar cuotas`

#### Caso B — préstamo sin cuotas y frecuencia manual
Mostrar:
- tabla/editor de cuotas manuales,
- número,
- fecha,
- monto,
- botón `Guardar cuotas manuales`

#### Caso C — préstamo con cuotas
No mostrar el formulario de generación.
Mostrar el listado como hoy.

---

## Reglas UX mínimas

### Automático
- si ya hay cuotas, no mostrar generar.
- si backend rechaza regeneración, mostrar error claro.

### Manual
- cantidad de filas = `cantidadCuotas`
- validar fecha obligatoria
- validar monto > 0
- validar suma total exacta
- si la suma no coincide, bloquear submit en frontend antes de pegarle al backend

---

## Mensajes sugeridos

### Exito
- `Cuotas generadas correctamente.`
- `Cuotas manuales guardadas correctamente.`

### Error
- `Este préstamo ya tiene cuotas generadas.`
- `Completá todas las fechas manuales.`
- `La suma de las cuotas debe coincidir con el total a devolver.`

---

## Archivos involucrados

### Obligatorios
- `frontend/src/services/prestamos/prestamosApi.ts`
- `frontend/src/modules/prestamos/hooks/usePrestamos.ts`
- `frontend/src/modules/prestamos/types/prestamo.ts`
- `frontend/src/modules/prestamos/PrestamosPage.tsx`

### Relacionados
- tests frontend si el proyecto los incorpora más adelante
- documentación breve del flujo

---

## Criterio de aceptación vigente

Este frente se considera **HECHO** cuando:
- puedo crear un préstamo,
- puedo generar o cargar sus cuotas desde la UI,
- puedo verlas sin salir de la pantalla,
- y el flujo no depende de llamadas manuales escondidas al backend.

## Pendientes relacionados (fuera de este documento)
- integración backend de mayor profundidad con DB/Flyway en test end-to-end.
