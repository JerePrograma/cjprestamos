package com.cjprestamos.backend.integration;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;

class FlujoPrestamoPagoIntegrationTest extends IntegrationTestBase {

    @Test
    void flujoPrincipal_personaPrestamoCuotasPago_deberiaPersistirYReflejarImputacion() throws Exception {
        String bodyPersona = """
            {
              "nombre": "Carlos Flujo",
              "alias": "Carl",
              "telefono": "555-100",
              "observacionRapida": "flujo principal",
              "colorReferencia": "azul",
              "cobraEnFecha": true,
              "tieneIngresoExtra": true,
              "activo": true
            }
            """;

        mockMvc.perform(autenticar(post("/api/personas")).content(bodyPersona))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(1L));

        String bodyPrestamo = """
            {
              "personaId": 1,
              "montoInicial": 1000.00,
              "porcentajeFijoSugerido": 20.0,
              "cantidadCuotas": 4,
              "frecuenciaTipo": "MENSUAL",
              "fechaBase": "2026-04-20",
              "usarFechasManuales": false,
              "estado": "ACTIVO"
            }
            """;

        mockMvc.perform(autenticar(post("/api/prestamos")).content(bodyPrestamo))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(1L))
            .andExpect(jsonPath("$.estado").value("ACTIVO"));

        mockMvc.perform(autenticar(post("/api/prestamos/1/cuotas/generar")).content("{}"))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$", hasSize(4)))
            .andExpect(jsonPath("$[0].montoProgramado").value(300.00))
            .andExpect(jsonPath("$[0].estado").value("PENDIENTE"));

        String bodyPago = """
            {
              "prestamoId": 1,
              "fechaPago": "2026-04-21",
              "monto": 300.00,
              "referencia": "transferencia test",
              "observacion": "primer pago"
            }
            """;

        mockMvc.perform(autenticar(post("/api/pagos")).content(bodyPago))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.estado").value("REGISTRADO"))
            .andExpect(jsonPath("$.monto").value(300.00));

        mockMvc.perform(autenticar(get("/api/prestamos/1/cuotas")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(4)))
            .andExpect(jsonPath("$[0].montoPagado").value(300.00))
            .andExpect(jsonPath("$[0].estado").value("PAGADA"))
            .andExpect(jsonPath("$[1].montoPagado").value(0.00))
            .andExpect(jsonPath("$[1].estado").value("PENDIENTE"));

        mockMvc.perform(autenticar(get("/api/prestamos/1/pagos")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].prestamoId").value(1))
            .andExpect(jsonPath("$[0].monto").value(300.00));
    }
}
