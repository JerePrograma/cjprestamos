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
```

---

## Desarrollo local (integración frontend/backend)

### 1) Backend

Requisitos:
- Java 21
- PostgreSQL activo en `localhost:5432`
- base de datos `cjprestamos`
- usuario/clave por defecto: `postgres/postgres`

Credenciales Basic Auth de desarrollo (perfil `dev`):
- usuario: `operadora`
- contraseña: `operadora123`

Se pueden sobreescribir con variables de entorno:
- `APP_BASIC_USER`
- `APP_BASIC_PASSWORD`

Ejemplo de arranque:

```bash
cd backend
mvn spring-boot:run
```

La API queda en `http://localhost:8080/api`.

### 2) Frontend

Crear archivo de entorno desde el ejemplo:

```bash
cd frontend
cp .env.example .env
```

Luego iniciar:

```bash
npm install
npm run dev
```

El frontend usa por defecto `VITE_API_BASE_URL=/api` y Vite proxyea `/api` hacia `http://localhost:8080`, evitando problemas de CORS en desarrollo local.

### 3) Verificación rápida

- backend: `GET http://localhost:8080/api/health`
- frontend: abrir `http://localhost:5173`
- las llamadas API desde navegador se resuelven por proxy en `/api` y se autentican con Basic Auth.
