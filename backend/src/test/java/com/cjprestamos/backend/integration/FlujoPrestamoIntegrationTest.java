package com.cjprestamos.backend.integration;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

class FlujoPrestamoIntegrationTest extends IntegrationTestBase {

    @Test
    void flujoPersonaPrestamoCuotasPagos_debePersistirYResponderConsistente() throws Exception {
        String personaRequest = """
            {
              "nombre": "Carlos Flujo",
              "alias": "Car",
              "telefono": "333-444",
              "observacionRapida": "seguimiento semanal",
              "colorReferencia": "azul",
              "cobraEnFecha": true,
              "tieneIngresoExtra": true,
              "activo": true
            }
            """;

        mockMvc.perform(post("/api/personas")
                .with(authBasica())
                .contentType(MediaType.APPLICATION_JSON)
                .content(personaRequest))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(1));

        String prestamoRequest = """
            {
              "personaId": 1,
              "montoInicial": 1000.00,
              "porcentajeFijoSugerido": 20.00,
              "interesManualOpcional": null,
              "cantidadCuotas": 3,
              "frecuenciaTipo": "MENSUAL",
              "frecuenciaCadaDias": null,
              "fechaBase": "2026-04-01",
              "usarFechasManuales": false,
              "referenciaCodigo": "REF-001",
              "observaciones": "flujo principal",
              "estado": "ACTIVO"
            }
            """;

        mockMvc.perform(post("/api/prestamos")
                .with(authBasica())
                .contentType(MediaType.APPLICATION_JSON)
                .content(prestamoRequest))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.personaId").value(1));

        mockMvc.perform(post("/api/prestamos/1/cuotas/generar")
                .with(authBasica())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$[0].montoProgramado").value(400.00))
            .andExpect(jsonPath("$[1].montoProgramado").value(400.00))
            .andExpect(jsonPath("$[2].montoProgramado").value(400.00));

        String pagoRequest = """
            {
              "prestamoId": 1,
              "fechaPago": "2026-04-10",
              "monto": 450.00,
              "referencia": "pago parcial",
              "observacion": "primer cobro"
            }
            """;

        mockMvc.perform(post("/api/pagos")
                .with(authBasica())
                .contentType(MediaType.APPLICATION_JSON)
                .content(pagoRequest))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.prestamoId").value(1))
            .andExpect(jsonPath("$.monto").value(450.00));

        mockMvc.perform(get("/api/prestamos/1/cuotas")
                .with(authBasica()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].estado").value("PAGADA"))
            .andExpect(jsonPath("$[0].montoPagado").value(400.00))
            .andExpect(jsonPath("$[1].estado").value("PARCIAL"))
            .andExpect(jsonPath("$[1].montoPagado").value(50.00))
            .andExpect(jsonPath("$[2].estado").value("PENDIENTE"))
            .andExpect(jsonPath("$[2].montoPagado").value(0.00));

        mockMvc.perform(get("/api/prestamos/1/pagos")
                .with(authBasica()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].monto").value(450.00))
            .andExpect(jsonPath("$[0].referencia").value("pago parcial"));
    }
}
