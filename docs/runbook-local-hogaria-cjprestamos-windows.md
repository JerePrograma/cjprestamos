# Runbook local (Windows): integración HogarIA ↔ cjprestamos

> Fecha: 2026-05-12.
> Objetivo: levantar ambos repos en local sin ejecutar sync real accidental.

## 1) Alcance y seguridad operativa

- Este runbook deja `CJP_SYNC_ENABLED=false` por defecto.
- **No** ejecutar `POST /sync` real mientras `CJP_SYNC_ENABLED=false`.
- Usar credenciales locales de prueba (nunca credenciales reales).
- Basic Auth de cjprestamos es válida para MVP, con limitaciones conocidas (sin mTLS/JWT entre servicios).

## 2) Puertos esperados

- HogarIA backend: `8080` (o el configurado en ese repo).
- cjprestamos backend: **`8081` recomendado para integración local**.
  - En este repo el default actual ya es `8081`.

## 3) PostgreSQL local

### 3.1 Bases de datos mínimas

- `hogaria` (en repo HogarIA; nombre exacto según su configuración).
- `cjprestamos` (confirmado por `application-dev.yml`).

### 3.2 Usuario/clave

Configurar variables de entorno locales (PowerShell), sin hardcodear secretos en git:

```powershell
# cjprestamos (ejemplo)
$env:DB_URL = "jdbc:postgresql://localhost:5432/cjprestamos"
$env:DB_USER = "<DB_USER_LOCAL>"
$env:DB_PASSWORD = "<LOCAL_PASSWORD>"
```

### 3.3 Bootstrap local cjprestamos

Configurar el usuario inicial de operación por entorno. El backend no crea usuario bootstrap si falta usuario o contraseña.

```powershell
$env:BOOTSTRAP_ADMIN_ENABLED = "true"
$env:BOOTSTRAP_ADMIN_USERNAME = "<ADMIN_LOCAL_USER>"
$env:BOOTSTRAP_ADMIN_PASSWORD = "<ADMIN_LOCAL_PASSWORD>"
$env:BOOTSTRAP_ADMIN_ROLE = "OPERADORA"
```

Para probar el bridge desde HogarIA, habilitar además un usuario técnico separado:

```powershell
$env:INTEGRATION_USER_ENABLED = "true"
$env:INTEGRATION_USER_USERNAME = "<CJP_INTEGRATION_USER>"
$env:INTEGRATION_USER_PASSWORD = "<CJP_INTEGRATION_PASSWORD>"
$env:INTEGRATION_USER_ROLE = "INTEGRATION"
```

## 4) Variables de integración en HogarIA

```powershell
$env:CJP_INTEGRATION_ENABLED = "true"
$env:CJP_SYNC_ENABLED = "false"
$env:CJP_BASE_URL = "http://localhost:8081"
$env:CJP_API_PREFIX = "/api/v1/integration/hogaria"
$env:CJP_USERNAME = $env:INTEGRATION_USER_USERNAME
$env:CJP_PASSWORD = $env:INTEGRATION_USER_PASSWORD
$env:CJP_CONNECT_TIMEOUT_MS = "3000"
$env:CJP_READ_TIMEOUT_MS = "5000"
```

## 5) Usuario INTEGRATION en cjprestamos

- En `dev`, cjprestamos permite bootstrap de usuario técnico por variables `INTEGRATION_USER_*`.
- Verificar que el usuario exista y tenga rol `INTEGRATION`.
- Verificar que el usuario de integración **no** tenga `OPERADORA` ni `ADMIN` (salvo usuario separado para pruebas manuales).

## 6) Orden exacto de arranque (PowerShell)

### 6.1 Compilar y testear cjprestamos

```powershell
cd C:\laburo\cjprestamos\backend
mvn test

cd C:\laburo\cjprestamos\frontend
npm install
npm run build
npm run test
```

### 6.2 Levantar cjprestamos backend en 8081

```powershell
cd C:\laburo\cjprestamos\backend
mvn spring-boot:run
```

### 6.3 Compilar/testear y levantar HogarIA backend

```powershell
cd C:\laburo\HogarIA
# Ajustar a la estructura real del repo
mvn test
mvn spring-boot:run
```

### 6.4 Build frontend(s)

```powershell
cd C:\laburo\HogarIA
npm install
npm run build

cd C:\laburo\cjprestamos\frontend
npm run build
```

## 7) Validaciones HTTP mínimas

> Reemplazar placeholders antes de ejecutar.

### 7.1 cjprestamos bridge (GET-only)

```powershell
$pair = "<integration_user>:<integration_password>"
$basic = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes($pair))
$headers = @{ Authorization = "Basic $basic" }

Invoke-RestMethod -Method GET -Uri "http://localhost:8081/api/v1/integration/hogaria/loans/active" -Headers $headers
Invoke-RestMethod -Method GET -Uri "http://localhost:8081/api/v1/integration/hogaria/dashboard" -Headers $headers
Invoke-RestMethod -Method GET -Uri "http://localhost:8081/api/v1/integration/hogaria/control-caja" -Headers $headers
Invoke-RestMethod -Method GET -Uri "http://localhost:8081/api/v1/integration/hogaria/loans/<loanId>/payments" -Headers $headers
```

### 7.2 Seguridad cjprestamos

```powershell
# Debe fallar (403) para INTEGRATION
Invoke-RestMethod -Method GET -Uri "http://localhost:8081/api/personas" -Headers $headers

# Debe fallar (403) para INTEGRATION, método no GET al bridge
Invoke-RestMethod -Method POST -Uri "http://localhost:8081/api/v1/integration/hogaria/health" -Headers $headers -ContentType "application/json" -Body "{}"
```

### 7.3 HogarIA external-loans

```powershell
$profileId = "<profileId>"

Invoke-RestMethod -Method GET -Uri "http://localhost:8080/api/profiles/$profileId/external-loans/health"
Invoke-RestMethod -Method GET -Uri "http://localhost:8080/api/profiles/$profileId/external-loans/summary"
Invoke-RestMethod -Method POST -Uri "http://localhost:8080/api/profiles/$profileId/external-loans/sync/dry-run" -ContentType "application/json" -Body "{}"

# Debe fallar con CJP_SYNC_ENABLED=false
Invoke-RestMethod -Method POST -Uri "http://localhost:8080/api/profiles/$profileId/external-loans/sync" -ContentType "application/json" -Body "{}"
```

## 8) Criterio de éxito

- Bridge v1 accesible en `/api/v1/integration/hogaria/**` con Basic Auth.
- Rol `INTEGRATION` solo puede GET del bridge.
- `summary` y `dry-run` funcionan desde HogarIA.
- `sync` real queda bloqueado con `CJP_SYNC_ENABLED=false`.
