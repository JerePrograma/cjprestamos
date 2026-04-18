# CHECKLIST_CIERRE_MVP.md

## Un cambio importante solo se considera cerrado si cumple esto

### Flujo
- [ ] El backend soporta el caso real
- [ ] La UI principal expone el caso real
- [ ] No quedan pasos técnicos manuales para completar la operación
- [ ] El flujo se entiende sin mirar código ni Postman

### Matemática
- [ ] Total a devolver correcto
- [ ] Cuotas correctas
- [ ] Saldo pendiente correcto
- [ ] Monto ganado correcto
- [ ] Monto por ganar correcto
- [ ] Deuda total correcta

### Usabilidad
- [ ] La pantalla principal no promete módulos vacíos
- [ ] Los errores son entendibles
- [ ] El estado del préstamo se entiende de un vistazo

### Validación técnica
- [ ] `mvn test`
- [ ] `npm run build`
- [ ] Sin imports rotos
- [ ] Sin TODO críticos ocultos
- [ ] Al menos una prueba con valor real de arranque/integración si el cambio lo amerita

### Documentación
- [ ] README alineado
- [ ] Backlog actualizado
- [ ] Estado real del MVP actualizado si cambió algo importante
