# AGENTS.md

## Propósito del repositorio

Este repositorio contiene un sistema web interno de préstamos para conocidos.

El objetivo principal del producto es:
- mejorar la organización,
- resolver cuentas matemáticas simples,
- registrar personas, préstamos, cuotas y pagos,
- mostrar métricas claras: monto invertido, monto ganado, monto por ganar y deuda total.

No es una fintech.  
No es un sistema bancario.  
No es una plataforma de cobranza automática.

El enfoque correcto es **manual-first**:
- el sistema asiste,
- la operadora decide,
- el sistema no debe imponer rigidez innecesaria.

---

## Regla más importante

Si hay duda entre:
- una solución más simple y usable
- o una solución más “elegante” pero más compleja

priorizar siempre la solución más simple y usable.

---

## Naturaleza real del MVP

El MVP no es el producto completo.

La primera versión debe resolver principalmente:
1. registrar personas,
2. registrar préstamos,
3. calcular montos por porcentaje fijo,
4. generar o cargar cuotas,
5. registrar pagos,
6. mostrar deuda total e indicadores básicos.

## Lo que puede esperar
- legajo completo,
- adjuntos,
- auth más elaborado,
- recordatorios,
- automatizaciones,
- portal cliente,
- PDF,
- scoring.

---

## Reglas de negocio clave

### 1. La matemática simple debe ser impecable
Errores no tolerables:
- suma incorrecta de cuotas,
- cálculo incorrecto del total a devolver,
- saldo pendiente incorrecto,
- monto ganado incorrecto,
- monto por ganar incorrecto,
- deuda total incorrecta.

### 2. El sistema debe soportar trabajo manual
Debe permitir:
- porcentaje fijo sugerido,
- ajuste manual de monto final,
- fechas manuales,
- cuotas manuales,
- referencias personales,
- renegociación conversada.

### 3. Una sola operadora principal modifica datos
No introducir complejidad multiusuario en esta etapa.

### 4. Separación conceptual obligatoria
Mantener separados:
- **Persona**: datos básicos y operativos
- **Prestamo**: operación económica
- **LegajoPersona**: información contextual/privada cuando se implemente

No mezclar legajo en la vista principal de préstamos activos.

---

## Prioridades reales del MVP

Orden de prioridad:
1. Personas
2. Préstamos
3. Cálculo simple por porcentaje fijo
4. Cuotas
5. Pagos
6. Dashboard de métricas
7. Referencias y colores
8. Legajo separado
9. Auth simple

Si una tarea compite con otra, priorizar siempre:
- exactitud matemática,
- claridad operativa,
- mantenimiento simple,
- bajo acoplamiento.

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
- JUnit 5 / Mockito

### Frontend
- React
- TypeScript
- Vite
- React Router
- TanStack Query
- Tailwind CSS
- Axios

---

## Convenciones generales

### Idioma
- Dominio, nombres funcionales, textos visibles y documentación: **en español**.
- Se aceptan nombres técnicos inevitables en inglés solo cuando son convenciones del framework o librería.

### Estilo
- Código claro, sobrio y mantenible.
- Evitar sobreingeniería.
- Evitar abstracciones prematuras.
- Evitar patrones innecesarios.
- Evitar clases “Dios”.
- Evitar DTOs ambiguos.

### Diseño
- Separar responsabilidades de forma razonable.
- No mezclar lógica de cálculo con persistencia.
- No mezclar lógica de negocio con detalles de UI.

### Comentarios
- Comentar solo cuando una regla de negocio no sea obvia.
- No llenar el código de comentarios redundantes.

---

## Qué NO hacer

No introducir sin pedido explícito:
- portal de clientes,
- recordatorios automáticos,
- integración con WhatsApp,
- punitorios automáticos,
- scoring complejo,
- recibos PDF,
- pagarés,
- microservicios,
- CQRS,
- event sourcing,
- colas,
- WebSockets,
- caches distribuidos,
- infra compleja.

No rediseñar todo el proyecto cuando la tarea es puntual.

No cambiar nombres funcionales del dominio a inglés si no es estrictamente necesario.

---

## Forma correcta de trabajar

Cuando recibas una tarea:
1. leer el contexto,
2. identificar el módulo afectado,
3. hacer el cambio mínimo correcto,
4. agregar o ajustar tests,
5. ejecutar validaciones razonables,
6. resumir lo que cambiaste.

Si hay ambigüedad:
- elegir la solución más simple,
- documentar brevemente la decisión,
- no inventar funcionalidades no pedidas.

---

## Validaciones antes de terminar

### Backend
Ejecutar, si aplica:
- `./mvnw test` o `mvn test`

### Frontend
Ejecutar, si aplica:
- `npm run build`

### General
- verificar que el proyecto siga compilando,
- verificar que no haya imports rotos,
- verificar que no queden TODO críticos sin mencionar.

Si no es posible ejecutar algo, explicarlo claramente.

---

## Formato esperado de la respuesta de entrega

Cada entrega debe incluir:
1. resumen breve de lo implementado,
2. archivos principales modificados,
3. validaciones ejecutadas,
4. riesgos o pendientes reales.

---

## Criterio de calidad

Una tarea está bien hecha si:
- respeta el dominio,
- no rompe el flujo manual-first,
- los cálculos son correctos,
- el cambio es simple de entender,
- tiene pruebas razonables,
- no introduce complejidad gratis.