package com.cjprestamos.backend.integration;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;

class PersonaIntegrationTest extends IntegrationTestBase {

    @Test
    void crearYListarPersona_deberiaPersistirEnPostgreSQLConFlyway() throws Exception {
        String body = """
            {
              "nombre": "Ana Integracion",
              "alias": "Ani",
              "telefono": "123456",
              "observacionRapida": "cliente test",
              "colorReferencia": "verde",
              "cobraEnFecha": true,
              "tieneIngresoExtra": false,
              "activo": true
            }
            """;

        mockMvc.perform(autenticar(post("/api/personas")).content(body))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(1L))
            .andExpect(jsonPath("$.nombre").value("Ana Integracion"));

        mockMvc.perform(autenticar(get("/api/personas")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].nombre").value("Ana Integracion"));
    }
}
