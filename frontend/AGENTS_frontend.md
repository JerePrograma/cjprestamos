# AGENTS.md — Frontend

## Alcance
Estas instrucciones aplican a todo el código dentro de `/frontend`.

## Objetivo del frontend
Construir una interfaz web clara, operativa y sobria para una herramienta interna de préstamos.

La UI debe sentirse como una **libreta digital ordenada con cálculos asistidos**, no como:
- una fintech,
- una billetera virtual,
- una app de cobranzas agresiva,
- ni un dashboard recargado.

## Prioridades de la experiencia de usuario
Priorizar siempre este orden:
1. Claridad visual
2. Rapidez de uso
3. Confianza en los números
4. Separación mental entre datos operativos y legajo
5. Consistencia entre pantallas

## Reglas funcionales de UI
- La pantalla principal debe destacar:
  - monto invertido,
  - monto ganado,
  - monto por ganar,
  - deuda total,
  - préstamos activos.
- No priorizar recordatorios, vencimientos ni alertas complejas en el MVP.
- La vista de `Persona` debe diferenciar claramente:
  - datos básicos,
  - préstamos actuales,
  - legajo.
- `Legajo` debe verse como un espacio más privado y descriptivo.
- La referencia visual por color debe ser simple y legible.
- La carga de préstamos debe permitir cálculo sugerido y ajuste manual.
- La carga de pagos debe ser rápida, con la menor fricción posible.

## Principios de implementación
- Usar componentes reutilizables, pero sin abstraer de más.
- Preferir formularios claros antes que interfaces “inteligentes” pero ambiguas.
- Evitar modales innecesarios si una página o panel resuelve mejor.
- Mostrar siempre resúmenes económicos de forma comprensible.
- No esconder información importante detrás de demasiados clics.
- Si una pantalla empieza a tener demasiadas responsabilidades, dividirla.

## Stack y librerías esperadas
- React
- TypeScript
- Vite
- React Router
- TanStack Query
- Axios
- Tailwind CSS
- React Hook Form o Formik
- Zod o Yup

## Estructura sugerida
Organizar por módulos:
- `modules/personas`
- `modules/legajos`
- `modules/prestamos`
- `modules/pagos`
- `modules/dashboard`
- `components`
- `hooks`
- `services`
- `types`
- `app`

Cada módulo debería contener, cuando aplique:
- componentes
- páginas
- schemas de validación
- hooks de queries/mutations
- mappers UI si hacen falta

## Estilo visual
- Sobrio, limpio, profesional.
- Nada de estética fintech brillante o “marketingera”.
- Evitar exceso de colores.
- Usar color principalmente para:
  - referencia de persona,
  - estados de préstamo,
  - estados de cuota.
- Las cards del dashboard deben ser simples y legibles.
- Las tablas deben ser fáciles de escanear.

## Convenciones de frontend
- Textos visibles en español.
- Tipos claros y explícitos.
- No usar `any` salvo justificación fuerte.
- Mantener hooks pequeños.
- Separar lógica de fetching de la lógica visual.
- No mezclar transformación de datos compleja dentro del JSX.

## Formularios
- Validar del lado cliente, pero asumir que la validación real vive en backend.
- Los formularios deben tolerar edición manual de condiciones.
- No bloquear al usuario con UX excesivamente rígida.
- Mostrar errores de forma clara y breve.

## Manejo de datos
- Consumir API vía servicios centralizados.
- Usar TanStack Query para cache y sincronización.
- Invalidar queries de forma explícita y razonable.
- No duplicar estado remoto innecesariamente.

## Qué NO hacer
- No diseñar la UI como si la usaran miles de clientes.
- No agregar chats, notificaciones, asistentes, toasts excesivos ni automatizaciones no pedidas.
- No meter gráficos complejos si una card o tabla resuelve mejor.
- No esconder datos económicos clave.
- No introducir formularios multipaso si no agregan claridad real.
- No rehacer todo el layout por una tarea puntual.

## Accesibilidad y responsive
- Debe funcionar bien en desktop.
- Debe ser usable en celular.
- No hace falta optimización extrema mobile-first, pero sí que no se rompa ni quede incómodo.
- Cuidar contraste, tamaño de texto y targets clickeables.

## Testing
Si se agrega testing de frontend, priorizar:
- componentes críticos,
- formularios clave,
- comportamiento básico del dashboard,
- flujos de alta de préstamo y registro de pago.

Si no se agregan tests, al menos dejar código fácilmente testeable.

## Antes de cerrar una tarea
Verificar:
- compila,
- no rompe rutas existentes,
- formularios funcionan,
- queries/mutations invalidan correctamente,
- los textos están en español,
- el diseño sigue sobrio y consistente,
- la pantalla resuelve la necesidad operativa real.

## Formato esperado de entrega de Codex
Cuando cierres una tarea frontend, informar brevemente:
1. qué cambiaste,
2. qué rutas/componentes tocaste,
3. cómo validar el flujo manualmente,
4. qué decisiones visuales o estructurales tomaste,
5. qué quedó fuera del alcance.
