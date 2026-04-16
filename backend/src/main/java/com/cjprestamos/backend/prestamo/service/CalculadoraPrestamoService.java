package com.cjprestamos.backend.prestamo.service;

import com.cjprestamos.backend.prestamo.dto.CalculoPrestamoEntrada;
import com.cjprestamos.backend.prestamo.dto.CalculoPrestamoResultado;
import java.math.BigDecimal;
import java.math.RoundingMode;
import org.springframework.stereotype.Service;

@Service
public class CalculadoraPrestamoService {

    private static final BigDecimal CIEN = new BigDecimal("100");

    public CalculoPrestamoResultado calcular(CalculoPrestamoEntrada entrada) {
        validarEntrada(entrada);

        BigDecimal interesAplicado = calcularInteresAplicado(entrada);
        BigDecimal totalADevolver = entrada.montoInicial().add(interesAplicado);
        BigDecimal cuotaSugerida = totalADevolver.divide(BigDecimal.valueOf(entrada.cantidadCuotas()), 2, RoundingMode.HALF_UP);

        BigDecimal montoInvertido = entrada.montoInicial();
        BigDecimal montoGanadoEstimado = interesAplicado;
        BigDecimal montoPorGanar = montoGanadoEstimado;

        return new CalculoPrestamoResultado(
            escalar(interesAplicado),
            escalar(totalADevolver),
            escalar(cuotaSugerida),
            escalar(montoInvertido),
            escalar(montoGanadoEstimado),
            escalar(montoPorGanar)
        );
    }

    private BigDecimal calcularInteresAplicado(CalculoPrestamoEntrada entrada) {
        if (entrada.interesManualOpcional() != null) {
            return entrada.interesManualOpcional();
        }

        if (entrada.porcentajeFijoSugerido() != null) {
            return entrada.montoInicial().multiply(entrada.porcentajeFijoSugerido()).divide(CIEN, 2, RoundingMode.HALF_UP);
        }

        return BigDecimal.ZERO;
    }

    private void validarEntrada(CalculoPrestamoEntrada entrada) {
        if (entrada == null) {
            throw new IllegalArgumentException("La entrada de cálculo es obligatoria");
        }

        if (entrada.montoInicial() == null || entrada.montoInicial().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("montoInicial debe ser mayor que 0");
        }

        if (entrada.cantidadCuotas() == null || entrada.cantidadCuotas() <= 0) {
            throw new IllegalArgumentException("cantidadCuotas debe ser mayor que 0");
        }

        if (entrada.porcentajeFijoSugerido() != null && entrada.porcentajeFijoSugerido().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("porcentajeFijoSugerido no puede ser negativo");
        }

        if (entrada.interesManualOpcional() != null && entrada.interesManualOpcional().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("interesManualOpcional no puede ser negativo");
        }
    }

    private BigDecimal escalar(BigDecimal monto) {
        return monto.setScale(2, RoundingMode.HALF_UP);
    }
}
