# IMPLEMENTACION_UI_CUOTAS.md

## Objetivo

Cerrar el faltante principal del MVP:
**permitir generar o cargar cuotas desde la UI principal de préstamos**.

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

## Qué falta en frontend

Hoy la pantalla de préstamos:
- crea préstamo,
- calcula,
- lista cuotas si existen,
- registra pagos,
- edita referencia,

pero **no permite generar las cuotas**.

---

## Propuesta concreta

### Paso 1 — API frontend
Modificar `frontend/src/services/prestamos/prestamosApi.ts`

Agregar:
- `generarCuotasPrestamo(id: number, payload?: GenerarCuotasPayload)`

Payload esperado:
- vacío para automático,
- con `cuotasManuales` para `FECHAS_MANUALES`.

---

### Paso 2 — Hook de React Query
Modificar `frontend/src/modules/prestamos/hooks/usePrestamos.ts`

Agregar:
- `useGenerarCuotasPrestamo()`

En `onSuccess` invalidar:
- `['prestamos']`
- `['prestamos', id]`
- `['prestamos', id, 'cuotas']`
- `['prestamos', id, 'resumen']`
- `['dashboard']`

---

### Paso 3 — Tipos
Modificar `frontend/src/modules/prestamos/types/prestamo.ts`

Agregar:
- `CuotaManualFormulario`
- `GenerarCuotasPayload`
- helpers para convertir formulario -> payload

---

### Paso 4 — UI en `PrestamosPage.tsx`
Agregar dentro del detalle del préstamo:

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

## Archivos a tocar

### Obligatorios
- `frontend/src/services/prestamos/prestamosApi.ts`
- `frontend/src/modules/prestamos/hooks/usePrestamos.ts`
- `frontend/src/modules/prestamos/types/prestamo.ts`
- `frontend/src/modules/prestamos/PrestamosPage.tsx`

### Recomendados
- tests frontend si el proyecto los incorpora más adelante
- documentación breve del flujo

---

## Criterio de aceptación

Esta tarea queda cerrada cuando:
- puedo crear un préstamo,
- puedo generar o cargar sus cuotas desde la UI,
- puedo verlas sin salir de la pantalla,
- y el flujo deja de depender de backend “escondido”.
