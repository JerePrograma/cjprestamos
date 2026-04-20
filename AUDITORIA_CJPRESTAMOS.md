# AUDITORIA_CJPRESTAMOS.md

> ⚠️ **Documento histórico (no vigente).**
> Esta auditoría fue válida el **2026-04-18**. Algunas conclusiones ya fueron resueltas.
> Estado vigente: `README.md`, `ESTADO_REAL_MVP.md` y `BACKLOG_CODEX.md`.

Fecha: 2026-04-18

## 1. Veredicto ejecutivo

El proyecto **no debería considerarse todavía “completamente funcional”**.

Sí está **bien encaminado** y el núcleo elegido es correcto para el objetivo real del producto:
- organización,
- cálculo simple por porcentaje fijo,
- registro manual-first,
- dashboard con métricas útiles.

Pero todavía hay una diferencia importante entre:
- tener varias piezas implementadas,
- y tener un **flujo operativo cerrado de punta a punta**.

El faltante principal no es legajo ni auth sofisticada.  
El faltante principal es **cerrar la gestión de cuotas desde la UI**.

---

## 2. Lo que ya está bien resuelto o bien orientado

### Backend
- CRUD de personas.
- Módulo de préstamos.
- Cálculo simple por porcentaje fijo.
- Generación/listado de cuotas.
- Registro e imputación de pagos.
- Dashboard.
- Referencias del préstamo.
- Reglas adicionales de validación recientes.

### Frontend
- Dashboard útil.
- Personas con campos alineados al caso real.
- Pantalla de préstamos bastante avanzada.
- Registro de pagos integrado en el detalle.
- Edición de referencia del préstamo.

### Producto
- El enfoque manual-first se mantiene.
- No se introdujo complejidad innecesaria del tipo fintech.
- El dashboard prioriza métricas que sí importan.

---

## 3. Problemas detectados

### Problema 1 — Flujo principal incompleto
Existe backend para generar cuotas, incluso manuales, pero la UI principal no expone ese flujo de forma operativa.

Impacto:
- el préstamo puede crearse,
- puede tener cálculo sugerido,
- puede tener pagos,
- pero el paso central de “dejar asentadas las cuotas y sus montos” no queda cerrado naturalmente desde interfaz.

Esto impide decir que el MVP está “cerrado”.

---

### Problema 2 — Navegación sobredimensionada
El menú principal expone:
- `Pagos`
- `Legajos`

pero esas páginas siguen en estado placeholder o muy base.

Impacto:
- la UI promete más de lo que entrega,
- aumenta sensación de producto “a medio cocinar”,
- distrae del flujo que sí importa.

---

### Problema 3 — Test de arranque débil
El test base del backend quedó degradado a una validación casi vacía de construcción de clase.

Impacto:
- da una falsa sensación de seguridad,
- no valida wiring real,
- no valida configuración mínima,
- no valida arranque efectivo de Spring.

---

### Problema 4 — Documentación desalineada
El README lista estructura/archivos que no siempre están confirmados o mantenidos de forma consistente.

Impacto:
- erosiona confianza técnica,
- vuelve confusa la foto real del repo,
- complica usar la documentación como fuente de verdad.

---

## 4. Qué cambiaría ya

### Cambio A — documentación de control
Actualizar:
- `README.md`
- `AGENTS.md`
- `BACKLOG_CODEX.md`

Agregar:
- `ESTADO_REAL_MVP.md`
- `CHECKLIST_CIERRE_MVP.md`

---

### Cambio B — foco de producto
Prioridad máxima:
1. UI de generación automática de cuotas.
2. UI de carga manual de cuotas.
3. visibilidad clara del saldo pendiente por préstamo.
4. honestidad de navegación.
5. mejor validación técnica mínima.

---

### Cambio C — criterio de cierre
Dejar de considerar “cerrada” una tarea cuando:
- solo quedó backend,
- solo quedó frontend,
- o el flujo principal sigue partido.

---

## 5. Recomendación final

No cambiar la dirección del proyecto.  
Sí cambiar el **control de foco**.

La línea correcta es:
- menos pantallas placeholder,
- más cierre del flujo principal,
- menos backlog “ideal”,
- más backlog con estado real,
- menos sensación de avance,
- más avance utilizable.
