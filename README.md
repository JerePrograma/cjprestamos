# cjprestamos

Sistema web interno de préstamos para conocidos, con enfoque manual-first.

## Objetivo del producto

El objetivo principal del sistema es:

- mejorar la organización,
- resolver cuentas matemáticas simples,
- registrar personas, préstamos, cuotas y pagos,
- mostrar métricas claras:
  - monto invertido,
  - monto ganado,
  - monto por ganar,
  - deuda total.

## Qué NO es este sistema

Este sistema:

- no es una fintech,
- no es un sistema bancario,
- no es una plataforma de cobranza automática.

La operadora decide.  
El sistema asiste.  
El criterio humano sigue mandando.

---

## Estado actual del MVP

### Núcleo ya encaminado
- Personas: CRUD backend y UI básica.
- Préstamos: alta, listado, detalle y cálculo sugerido.
- Cuotas: backend de generación automática/manual ya implementado.
- Pagos: registro, imputación y actualización de estados.
- Dashboard: métricas principales visibles.
- Referencias y colores: soporte inicial implementado.

### Pendiente crítico para considerar “MVP operativo cerrado”
- cerrar desde la UI el flujo de generación/carga de cuotas,
- alinear navegación con el estado real del producto,
- reforzar pruebas de arranque/integración para no depender solo de tests livianos.

### Estado real recomendado
Para seguimiento de producto y priorización:
- ver `ESTADO_REAL_MVP.md`
- ver `BACKLOG_CODEX.md`

---

## Stack actual

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

## Estructura confirmada del repositorio

```text
/backend
/frontend
AGENTS.md
BACKLOG_CODEX.md
DECISIONES_MVP.md
CHECKLIST_ENTREGA_CODEX.md
```

## Estructura sugerida a futuro, pero no obligatoria hoy

```text
/docs
/infra
ESTADO_REAL_MVP.md
```

No listar archivos o carpetas como parte del repo estable si todavía no existen o no se usan realmente.

---

## Desarrollo local

### 1) Backend

Requisitos:
- Java 21
- PostgreSQL activo en `localhost:5432`
- base de datos `cjprestamos`
- usuario/clave por defecto: `postgres/postgres`

Credenciales Basic Auth de desarrollo:
- usuario: `operadora`
- contraseña: `operadora123`

Se pueden sobreescribir con variables de entorno:
- `APP_BASIC_USER`
- `APP_BASIC_PASSWORD`

Arranque:

```bash
cd backend
mvn spring-boot:run
```

La API queda en `http://localhost:8080/api`.

### 2) Frontend

Crear entorno local desde el ejemplo:

```bash
cd frontend
cp .env.example .env
```

Instalar dependencias y levantar:

```bash
npm install
npm run dev
```

El frontend usa por defecto `VITE_API_BASE_URL=/api` y Vite proxyea `/api` a `http://localhost:8080`.

### 3) Verificación rápida

- backend: `GET http://localhost:8080/api/health`
- frontend: abrir `http://localhost:5173`

---

## Criterio práctico de cierre

No considerar “cerrada” una funcionalidad si:
- existe solo en backend pero no en la UI operativa principal,
- existe en el menú pero la pantalla es placeholder,
- los cálculos están probados solo de manera superficial.

Una entrega queda realmente cerrada cuando el flujo principal se puede usar de punta a punta sin depender de pasos manuales técnicos.

---

## Prioridad inmediata recomendada

1. UI de generación/carga de cuotas.
2. Visualización más clara del saldo real por préstamo.
3. Honestidad de navegación: ocultar o marcar placeholders.
4. Reforzar tests de arranque/integración.
5. Recién después: legajos y adjuntos.
