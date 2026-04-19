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

### Núcleo operativo principal (MVP) — CERRADO
- Personas: CRUD backend y UI básica.
- Préstamos: alta, listado, detalle y cálculo sugerido.
- Cuotas: generación automática/manual disponible desde UI y backend.
- Pagos: registro, imputación y actualización de estados.
- Dashboard: métricas principales visibles.
- Referencias y colores: soporte inicial implementado.
- Detalle operativo del préstamo: estado de cuotas, total programado, total pagado y saldo pendiente.
- Navegación principal sin placeholders: pagos operativos dentro de préstamos y legajos fuera del menú principal.

### Pendientes post-MVP (reales hoy)
- completar módulo de legajos y adjuntos (hoy fuera del flujo principal),
- endurecer cobertura de integración backend con datasource/Flyway en tests automatizados,
- evaluar seguridad frontend adicional si la operación lo requiere.

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
ESTADO_REAL_MVP.md
CHECKLIST_CIERRE_MVP.md
DECISIONES_MVP.md
CHECKLIST_ENTREGA_CODEX.md
```

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

1. Consolidar calidad técnica de integración backend (DB/Flyway en test controlado).
2. Implementar legajos/adjuntos fuera del flujo operativo principal.
3. Evaluar seguridad frontend adicional solo si agrega valor operativo real.
