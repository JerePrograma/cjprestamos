# DECISIONES_MVP.md

## 1. Naturaleza del producto
El sistema NO se diseña como una fintech.  
Se diseña como una herramienta interna de gestión de préstamos para conocidos.

## 2. Enfoque operativo
El enfoque es manual-first.  
El sistema asiste el cálculo y el registro, pero no reemplaza el criterio humano.

## 3. Objetivo principal
Resolver organización y cuentas matemáticas simples.

## 4. Usuario principal
Una sola operadora interna carga y modifica la información.

## 5. Prioridad real del MVP
La primera versión debe enfocarse en:
- personas,
- préstamos,
- cuotas,
- pagos,
- dashboard básico.

## 6. Métricas principales
Al entrar al sistema se prioriza mostrar:
- monto invertido,
- monto ganado,
- monto por ganar,
- deuda total,
- préstamos activos.

## 7. Separación funcional clave
Debe haber separación clara entre:
- Persona
- Prestamo
- LegajoPersona

Pero `LegajoPersona` puede implementarse después del núcleo operativo si hace falta acelerar el MVP.

## 8. Cálculo inicial del MVP
El sistema debe sugerir cálculo por porcentaje fijo, pero permitir ajuste manual.

## 9. Frecuencia y cuotas
Deben soportarse:
- mensual,
- cada X días,
- fechas manuales.

## 10. Pagos
Deben soportarse:
- pago parcial,
- pago múltiple,
- pago adelantado,
- referencia manual.

## 11. Recordatorios
No son prioridad del MVP.  
No automatizar recordatorios.

## 12. Mora y punitorios
No automatizar punitorios en el MVP.  
Si aparece mora, se trata manualmente.

## 13. Seguridad
La seguridad es simple y puede entrar después del núcleo funcional si la etapa lo permite.

## 14. Legajo
El legajo es valioso, pero no debe bloquear la entrega del núcleo operativo.

## 15. Lo que queda fuera del MVP
- recordatorios automáticos
- mensajes automáticos
- punitorios automáticos
- portal cliente
- PDF/recibos formales
- scoring complejo
- notificaciones