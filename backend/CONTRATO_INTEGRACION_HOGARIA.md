# Contrato de integración HogarIA

## Estado

Se mantiene compatibilidad total con el contrato existente y se agrega alias versionado.

## Endpoints soportados

### Compatibilidad (legacy)
Prefijo actual, **sin cambios**:

- `/api/integration/hogaria/loans/active`
- `/api/integration/hogaria/dashboard`
- `/api/integration/hogaria/control-caja`
- `/api/integration/hogaria/loans/{loanId}/installments`
- `/api/integration/hogaria/loans/{loanId}/payments`

### Contrato recomendado (v1)
Nuevo prefijo recomendado para consumo futuro:

- `/api/v1/integration/hogaria/loans/active`
- `/api/v1/integration/hogaria/dashboard`
- `/api/v1/integration/hogaria/control-caja`
- `/api/v1/integration/hogaria/loans/{loanId}/installments`
- `/api/v1/integration/hogaria/loans/{loanId}/payments`

## Notas de implementación

- Ambos prefijos delegan al mismo `HogariaIntegrationController` y al mismo `HogariaIntegrationService`.
- No se duplicó lógica de negocio.
- No se cambiaron DTOs del contrato.
- Seguridad Basic Auth MVP: ambos prefijos requieren los mismos roles (`INTEGRATION`, `OPERADORA`, `ADMIN`).

## Limitaciones de seguridad (MVP)

La autenticación actual basada en Basic Auth sigue siendo una medida temporal de MVP. Mantener controles de red, rotación de credenciales y canal TLS obligatorio en ambientes no locales.
