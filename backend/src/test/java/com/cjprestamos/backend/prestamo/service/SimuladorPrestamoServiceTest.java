package com.cjprestamos.backend.prestamo.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.cjprestamos.backend.prestamo.dto.SimulacionPrestamoRequest;
import com.cjprestamos.backend.prestamo.dto.SimulacionPrestamoResponse;
import com.cjprestamos.backend.prestamo.model.enums.FrecuenciaTipo;
import java.math.BigDecimal;
import java.time.LocalDate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

class SimuladorPrestamoServiceTest {

    private SimuladorPrestamoService simuladorPrestamoService;

    @BeforeEach
    void setUp() {
        simuladorPrestamoService = new SimuladorPrestamoService(new CalculadoraPrestamoService());
    }

    @Test
    void simular_conFrecuenciaMensual_deberiaGenerarCronograma() {
        SimulacionPrestamoResponse response = simuladorPrestamoService.simular(new SimulacionPrestamoRequest(
            new BigDecimal("1000"),
            new BigDecimal("20"),
            null,
            4,
            FrecuenciaTipo.MENSUAL,
            null,
            LocalDate.of(2026, 5, 10)
        ));

        assertEquals(new BigDecimal("1200.00"), response.totalADevolver());
        assertEquals(4, response.cuotas().size());
        assertEquals(LocalDate.of(2026, 6, 10), response.cuotas().get(1).fechaVencimiento());
        assertEquals(new BigDecimal("300.00"), response.cuotas().get(0).montoProgramado());
    }

    @Test
    void simular_sinFechaEnAutomaticas_deberiaFallar() {
        ResponseStatusException error = assertThrows(ResponseStatusException.class, () ->
            simuladorPrestamoService.simular(new SimulacionPrestamoRequest(
                new BigDecimal("1000"),
                new BigDecimal("20"),
                null,
                4,
                FrecuenciaTipo.MENSUAL,
                null,
                null
            ))
        );

        assertEquals("400 BAD_REQUEST \"fechaPrimerVencimiento es obligatoria para simulaciones automáticas\"", error.getMessage());
    }

    @Test
    void generarPdfSimulacion_deberiaRetornarBytes() {
        byte[] pdf = simuladorPrestamoService.generarPdfSimulacion(new SimulacionPrestamoRequest(
            new BigDecimal("1000"),
            new BigDecimal("10"),
            null,
            3,
            FrecuenciaTipo.CADA_X_DIAS,
            7,
            LocalDate.of(2026, 5, 1)
        ));

        assertNotNull(pdf);
        assertEquals("%PDF", new String(pdf, 0, 4));
    }
}
