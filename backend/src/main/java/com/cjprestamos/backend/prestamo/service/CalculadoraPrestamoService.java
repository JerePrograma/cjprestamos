package com.cjprestamos.backend.prestamo.service;

import com.cjprestamos.backend.common.model.MonedaUtils;
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

        BigDecimal montoInicial = MonedaUtils.normalizar(entrada.montoInicial());
        BigDecimal interesAplicado = calcularInteresAplicado(entrada, montoInicial);
        BigDecimal totalADevolver = MonedaUtils.normalizar(montoInicial.add(interesAplicado));
        BigDecimal cuotaSugerida = totalADevolver
            .divide(BigDecimal.valueOf(entrada.cantidadCuotas()), 0, RoundingMode.CEILING);

        BigDecimal montoGanadoEstimado = interesAplicado;

        return new CalculoPrestamoResultado(
            MonedaUtils.normalizar(interesAplicado),
            MonedaUtils.normalizar(totalADevolver),
            MonedaUtils.normalizar(cuotaSugerida),
            MonedaUtils.normalizar(montoInicial),
            MonedaUtils.normalizar(montoGanadoEstimado),
            MonedaUtils.normalizar(montoGanadoEstimado)
        );
    }

    private BigDecimal calcularInteresAplicado(CalculoPrestamoEntrada entrada, BigDecimal montoInicial) {
        if (entrada.interesManualOpcional() != null) {
            return MonedaUtils.normalizar(entrada.interesManualOpcional());
        }

        if (entrada.porcentajeFijoSugerido() != null) {
            BigDecimal interesCalculado = montoInicial.multiply(entrada.porcentajeFijoSugerido()).divide(CIEN, 8, RoundingMode.CEILING);
            return MonedaUtils.normalizar(interesCalculado);
        }

        return MonedaUtils.cero();
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
}
