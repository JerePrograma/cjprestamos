# AGENTS.md

## Descripción funcional del proyecto

`cjprestamos` es un sistema interno de control de préstamos, pensado para operación manual-first.

El sistema permite gestionar:
- personas/deudores,
- préstamos,
- cuotas,
- pagos,
- imputaciones,
- dashboard de métricas,
- control de caja,
- simulador,
- generación de PDF,
- legajos.

Objetivo operativo del MVP:
- registrar operaciones de forma clara,
- asegurar exactitud matemática,
- separar correctamente capital, interés, recupero y movimientos de caja,
- asistir a la operadora sin rigidizar el flujo manual.

No es una fintech ni un core bancario.

---

## Estructura esperada del repositorio

### Backend
- Stack: Java 21 + Spring Boot 3.x + Maven.
- Módulos/tecnologías clave: Spring Web, Spring Data JPA, Spring Security (simple), Flyway, PostgreSQL, Bean Validation, OpenPDF.
- Responsabilidad: exponer APIs, resolver reglas de negocio del dominio de préstamos, persistencia y cálculos.

### Frontend
- Stack: React 18 + TypeScript + Vite.
- Librerías clave: Axios, TanStack Query, React Router, Tailwind CSS.
- Responsabilidad: flujo operativo de carga/consulta, visualización de métricas y soporte de operación diaria.

---

## Comandos esperados de trabajo

### Backend
- `mvn test`
- `mvn spring-boot:run`

### Frontend
- `npm install`
- `npm run build`
- `npm run test`

> Ejecutar validaciones razonables antes de cerrar una tarea y dejar explícito si algo no pudo correrse.

---

## Reglas de arquitectura y mantenimiento

1. **No crear archivos binarios** en commits de trabajo normal (salvo pedido explícito y justificado).
2. **No subir secretos** ni credenciales (tokens, passwords, API keys, `.env` reales).
3. **No romper migraciones Flyway existentes**:
   - no editar migraciones ya aplicadas en entornos compartidos,
   - agregar nuevas migraciones para cambios evolutivos.
4. **Mantener Java 21**.
5. **Mantener Spring Boot 3.x**.
6. **No mezclar lógica de préstamos con controllers**.
7. **Mantener la lógica de cálculo en services** (totales, saldos, interés, recupero, etc.).
8. **Mantener cuotas, pagos e imputaciones como dominio separado**, con responsabilidades claras y bajo acoplamiento.

---

## Reglas para futura integración con HogarIA

Estas reglas preparan el código para una eventual absorción/integración del módulo:

1. **Documentar endpoints actuales** (entrada/salida, validaciones, errores relevantes).
2. **Identificar entidades candidatas a migrar a UUID** si el módulo se integra en un ecosistema mayor.
3. **Identificar campos requeridos para asociar préstamos a `profileId` / `accountId`**.
4. **No asumir que `Persona` equivale a usuario de HogarIA**:
   - `Persona` puede representar deudor/contacto operativo,
   - usuario autenticado y deudor pueden ser conceptos distintos.
5. **Separar explícitamente capital, interés, recupero y caja** en modelo, cálculos y reportes para facilitar integración contable.

---

## Reglas de seguridad (estado actual MVP)

1. La **Basic Auth actual** se considera válida **solo para MVP**.
2. Toda entrega que toque seguridad debe **documentar limitaciones vigentes** y riesgos.
3. **No agregar credenciales hardcodeadas** en código, tests, scripts o documentación.

---

## Definition of Done para PRs

Una PR se considera lista cuando cumple, como mínimo:

1. Cambios acotados al objetivo solicitado (sin refactors masivos no pedidos).
2. Arquitectura respetada (controllers livianos, negocio en services, dominio separado).
3. Migraciones Flyway consistentes (sin alterar historial aplicado).
4. Sin secretos ni credenciales hardcodeadas.
5. Validaciones ejecutadas e informadas (backend/frontend según aplique).
6. Documentación actualizada si cambian endpoints, reglas de negocio o supuestos de integración.
7. Estado final declarado con honestidad: **hecha**, **parcial** o **pendiente**.
8. Si la tarea impacta integración futura con HogarIA, dejar nota explícita de:
   - impacto en contratos API,
   - impacto en IDs (`profileId` / `accountId`),
   - impacto en separación capital/interés/recupero/caja.

---

## Criterio de decisión

Ante ambigüedad, priorizar siempre:
1. exactitud matemática,
2. claridad operativa,
3. simplicidad de mantenimiento,
4. menor acoplamiento.
