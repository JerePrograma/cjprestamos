package com.cjprestamos.backend.integration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

class PersonaIntegrationTest extends IntegrationTestBase {

    @Test
    void crearYListarPersona_persisteEnPostgreSqlConFlyway() throws Exception {
        String request = """
            {
              "nombre": "Ana Integracion",
              "alias": "Ani",
              "telefono": "111-222",
              "observacionRapida": "cliente activa",
              "colorReferencia": "verde",
              "cobraEnFecha": true,
              "tieneIngresoExtra": false,
              "activo": true
            }
            """;

        mockMvc.perform(post("/api/personas")
                .with(authBasica())
                .contentType(MediaType.APPLICATION_JSON)
                .content(request))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.nombre").value("Ana Integracion"));

        mockMvc.perform(get("/api/personas")
                .with(authBasica()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].id").value(1))
            .andExpect(jsonPath("$[0].nombre").value("Ana Integracion"));

        assertThat(contarMigracionV1Aplicada()).isEqualTo(1);
    }
}
