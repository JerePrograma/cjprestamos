package com.cjprestamos.backend.common.model;

import java.math.BigDecimal;
import java.math.RoundingMode;

public final class MonedaUtils {

    private static final int ESCALA_PERSISTENCIA = 2;
    private static final int ESCALA_OPERATIVA = 0;

    private MonedaUtils() {
    }

    public static BigDecimal cero() {
        return BigDecimal.ZERO.setScale(ESCALA_PERSISTENCIA, RoundingMode.UNNECESSARY);
    }

    public static BigDecimal normalizar(BigDecimal valor) {
        if (valor == null) {
            return cero();
        }

        BigDecimal redondeado = valor.setScale(ESCALA_OPERATIVA, RoundingMode.CEILING);
        return redondeado.setScale(ESCALA_PERSISTENCIA, RoundingMode.UNNECESSARY);
    }
}
