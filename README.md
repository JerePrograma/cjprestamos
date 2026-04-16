# cjprestamos

Sistema web interno de préstamos para conocidos.

## Objetivo del producto

El objetivo principal del sistema es:
- mejorar la organización,
- resolver cuentas matemáticas simples,
- registrar personas, préstamos, cuotas y pagos,
- mostrar métricas claras como:
  - monto invertido,
  - monto ganado,
  - monto por ganar,
  - deuda total.

## Qué NO es este sistema

Este sistema:
- no es una fintech,
- no es un sistema bancario,
- no es una plataforma de cobranza automática.

El enfoque es **manual-first**:
- el sistema asiste,
- la operadora decide,
- el criterio humano sigue mandando.

---

## Stack objetivo

### Backend
- Java 21
- Spring Boot 3.x
- Maven
- Spring Web
- Spring Data JPA
- PostgreSQL
- Flyway
- Bean Validation
- Spring Security simple
- JUnit 5 + Mockito

### Frontend
- React
- TypeScript
- Vite
- React Router
- TanStack Query
- Axios
- Tailwind CSS

---

## Estructura del repositorio

```text
/backend
/frontend
/docs
/infra
AGENTS.md
BACKLOG_CODEX.md
DECISIONES_MVP.md
CHECKLIST_ENTREGA_CODEX.md
PROMPT_MAESTRO_CODEX.txt