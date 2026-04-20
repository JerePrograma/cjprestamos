package com.cjprestamos.backend.prestamo.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.cjprestamos.backend.prestamo.dto.CalculoPrestamoEntrada;
import com.cjprestamos.backend.prestamo.dto.CalculoPrestamoResultado;
import java.math.BigDecimal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class CalculadoraPrestamoServiceTest {

    private CalculadoraPrestamoService calculadoraPrestamoService;

    @BeforeEach
    void setUp() {
        calculadoraPrestamoService = new CalculadoraPrestamoService();
    }

    @Test
    void calcular_conPorcentajeFijo_deberiaCalcularMontos() {
        CalculoPrestamoResultado resultado = calculadoraPrestamoService.calcular(new CalculoPrestamoEntrada(
            new BigDecimal("1000.00"),
            new BigDecimal("20"),
            null,
            4
        ));

        assertEquals(new BigDecimal("200.00"), resultado.interesAplicado());
        assertEquals(new BigDecimal("1200.00"), resultado.totalADevolver());
        assertEquals(new BigDecimal("300.00"), resultado.cuotaSugerida());
        assertEquals(new BigDecimal("1000.00"), resultado.montoInvertido());
        assertEquals(new BigDecimal("200.00"), resultado.montoGanadoEstimado());
        assertEquals(new BigDecimal("200.00"), resultado.montoPorGanar());
    }

    @Test
    void calcular_conInteresManual_deberiaUsarInteresManual() {
        CalculoPrestamoResultado resultado = calculadoraPrestamoService.calcular(new CalculoPrestamoEntrada(
            new BigDecimal("1000.00"),
            null,
            new BigDecimal("150.00"),
            5
        ));

        assertEquals(new BigDecimal("150.00"), resultado.interesAplicado());
        assertEquals(new BigDecimal("1150.00"), resultado.totalADevolver());
        assertEquals(new BigDecimal("230.00"), resultado.cuotaSugerida());
    }

    @Test
    void calcular_conInteresManualYPorcentajeFijo_deberiaPriorizarInteresManual() {
        CalculoPrestamoResultado resultado = calculadoraPrestamoService.calcular(new CalculoPrestamoEntrada(
            new BigDecimal("1000.00"),
            new BigDecimal("50"),
            new BigDecimal("100.00"),
            4
        ));

        assertEquals(new BigDecimal("100.00"), resultado.interesAplicado());
        assertEquals(new BigDecimal("1100.00"), resultado.totalADevolver());
    }

    @Test
    void calcular_sinPorcentajeNiInteresManual_deberiaTomarInteresCero() {
        CalculoPrestamoResultado resultado = calculadoraPrestamoService.calcular(new CalculoPrestamoEntrada(
            new BigDecimal("1000.00"),
            null,
            null,
            3
        ));

        assertEquals(new BigDecimal("0.00"), resultado.interesAplicado());
        assertEquals(new BigDecimal("1000.00"), resultado.totalADevolver());
        assertEquals(new BigDecimal("334.00"), resultado.cuotaSugerida());
    }

    @Test
    void calcular_conMontoInicialInvalido_deberiaLanzarError() {
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
            calculadoraPrestamoService.calcular(new CalculoPrestamoEntrada(BigDecimal.ZERO, null, null, 3))
        );

        assertEquals("montoInicial debe ser mayor que 0", exception.getMessage());
    }

    @Test
    void calcular_conCantidadCuotasInvalida_deberiaLanzarError() {
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
            calculadoraPrestamoService.calcular(new CalculoPrestamoEntrada(new BigDecimal("1000.00"), null, null, 0))
        );

        assertEquals("cantidadCuotas debe ser mayor que 0", exception.getMessage());
    }

    @Test
    void calcular_conPorcentajeNegativo_deberiaLanzarError() {
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
            calculadoraPrestamoService.calcular(new CalculoPrestamoEntrada(
                new BigDecimal("1000.00"),
                new BigDecimal("-1"),
                null,
                4
            ))
        );

        assertEquals("porcentajeFijoSugerido no puede ser negativo", exception.getMessage());
    }

    @Test
    void calcular_conInteresManualNegativo_deberiaLanzarError() {
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
            calculadoraPrestamoService.calcular(new CalculoPrestamoEntrada(
                new BigDecimal("1000.00"),
                null,
                new BigDecimal("-10.00"),
                4
            ))
        );

        assertEquals("interesManualOpcional no puede ser negativo", exception.getMessage());
    }

    @Test
    void calcular_deberiaRedondearHaciaArribaSinCentavos() {
        CalculoPrestamoResultado resultado = calculadoraPrestamoService.calcular(new CalculoPrestamoEntrada(
            new BigDecimal("1000.00"),
            new BigDecimal("10"),
            null,
            3
        ));

        assertEquals(new BigDecimal("367.00"), resultado.cuotaSugerida());
    }
}
