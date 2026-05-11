# Integración HogarIA ↔ cjprestamos (estado real)

> Última actualización: 2026-05-11.
> Estado: **hecha (documentación)** / **integración técnica en fase read-only + sync fase 2 condicionada**.

## 1) Objetivo de la integración

La integración busca que **HogarIA** pueda visualizar y operar contexto de préstamos gestionados en **cjprestamos** sin acoplar ambos sistemas en una única base de datos.

En la práctica actual:
- HogarIA consume endpoints de integración de cjprestamos para traer información de préstamos y métricas.
- HogarIA ya expone endpoints propios del módulo `external-loans` para resumen y configuración/ejecución de sync.
- La prioridad operativa sigue siendo exactitud de datos y separación contable (capital, interés, recupero, caja).

## 2) Dueño de cada dominio (source of truth)

### HogarIA (dueño)
- perfiles,
- cuentas,
- categorías,
- movimientos,
- presupuesto.

### cjprestamos (dueño)
- personas,
- préstamos,
- cuotas,
- pagos,
- imputaciones,
- legajos.

## 3) Por qué **NO** se fusionan bases

No se fusionan bases porque:
1. Son dominios distintos con ritmos y reglas distintas.
2. Se reduce acoplamiento y riesgo operativo.
3. Facilita evolución independiente por etapas.
4. Evita contaminar modelo financiero personal (HogarIA) con modelo operativo manual-first de cobranza (cjprestamos).
5. Permite mantener trazabilidad contable explícita en cjprestamos (capital/interés/recupero/caja).

## 4) Endpoints que HogarIA expone (módulo `external-loans`)

- `GET /api/profiles/{profileId}/external-loans/summary`
- `GET|PUT /api/profiles/{profileId}/external-loans/sync-config`
- `POST /api/profiles/{profileId}/external-loans/sync`

> Nota: estos endpoints viven en HogarIA y representan la fachada de integración hacia clientes de HogarIA.

## 5) Endpoints remotos de cjprestamos consumidos por HogarIA

- `GET /api/integration/hogaria/loans/active`
- `GET /api/integration/hogaria/dashboard`
- `GET /api/integration/hogaria/control-caja`
- `GET /api/integration/hogaria/loans/{loanId}/installments`
- `GET /api/integration/hogaria/loans/{loanId}/payments`

Estos endpoints son de lectura y se usan para consolidar vista externa desde HogarIA.

## 6) Variables de entorno

Variables confirmadas para cliente a cjprestamos:
- `CJP_INTEGRATION_ENABLED`
- `CJP_BASE_URL`
- `CJP_USERNAME`
- `CJP_PASSWORD`
- `CJP_CONNECT_TIMEOUT_MS`
- `CJP_READ_TIMEOUT_MS`

Variable de sync:
- **Pendiente de confirmar nombre exacto en código de HogarIA** (si existe o si se agregó una nueva).
- Hasta confirmar implementación real, evitar documentar un nombre inventado.

## 7) Modo read-only (actual recomendado)

Estado recomendado hoy: **read-only**.

Qué implica:
- HogarIA consulta datos de cjprestamos.
- No se escribe estado de préstamos en cjprestamos desde HogarIA.
- Minimiza riesgo de inconsistencias cruzadas en una fase puente.

## 8) Modo sync fase 2 (no recomendado como default de producción)

El sync existe como capacidad en HogarIA (`sync-config` + `sync`), pero su uso productivo debe considerarse **condicionado**.

Condiciones mínimas antes de recomendarlo como default:
1. Autenticación/autorización robusta entre sistemas.
2. Reglas anti-duplicación/idempotencia verificadas.
3. Criterios contables cerrados para capital recuperado vs interés.
4. Estrategia de degradación cuando cjprestamos no responde.

Hasta que eso esté cerrado, sync debe tratarse como **fase 2 controlada**, no como baseline productivo.

## 9) Riesgos vigentes (no ocultar)

1. **`X-User-Id` spoofeable** si no hay auth real entre servicios.
2. **Duplicación de movimientos** si se reintentan syncs sin idempotencia fuerte.
3. **Diferencia entre capital recuperado e interés** al mapear datos contables entre sistemas.
4. **Caída de cjprestamos**: impacta summary/sync y puede degradar UX de HogarIA si no hay manejo resiliente.

## 10) Comandos de validación documental

Como este cambio es solo de documentación:

```bash
git diff -- README.md docs/integracion-hogaria-cjprestamos.md
```

Opcional (consistencia Markdown, si el entorno lo tiene):

```bash
npx markdownlint README.md docs/integracion-hogaria-cjprestamos.md
```

No se requiere build funcional para este entregable porque no se modificó código.

---

## Impacto en futura integración (HogarIA)

- **Impacto en contratos API**: se explicita contrato externo de HogarIA y contrato remoto consumido en cjprestamos.
- **Impacto en IDs (`profileId` / `accountId`)**: se mantiene ownership en HogarIA; la asociación con préstamos externos debe mapearse sin asumir equivalencia con `Persona`.
- **Impacto en separación capital/interés/recupero/caja**: se declara como condición central para avanzar sync fase 2.
