package com.cjprestamos.backend.integration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
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

    @Test
    void listarPersonas_debeFiltrarActivasBajasYTodas() throws Exception {
        String personaActiva = """
            {
              "nombre": "Activa Integracion",
              "alias": "Act",
              "telefono": "111-222",
              "observacionRapida": "activa",
              "colorReferencia": "verde",
              "cobraEnFecha": true,
              "tieneIngresoExtra": false,
              "activo": true
            }
            """;
        String personaBaja = """
            {
              "nombre": "Baja Integracion",
              "alias": "Baja",
              "telefono": "333-444",
              "observacionRapida": "baja",
              "colorReferencia": "gris",
              "cobraEnFecha": false,
              "tieneIngresoExtra": false,
              "activo": true
            }
            """;

        mockMvc.perform(post("/api/personas")
                .with(authBasica())
                .contentType(MediaType.APPLICATION_JSON)
                .content(personaActiva))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(1));

        mockMvc.perform(post("/api/personas")
                .with(authBasica())
                .contentType(MediaType.APPLICATION_JSON)
                .content(personaBaja))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(2));

        mockMvc.perform(delete("/api/personas/2")
                .with(authBasica()))
            .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/personas")
                .with(authBasica()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].nombre").value("Activa Integracion"));

        mockMvc.perform(get("/api/personas")
                .param("estado", "bajas")
                .with(authBasica()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].nombre").value("Baja Integracion"));

        mockMvc.perform(get("/api/personas")
                .param("estado", "todas")
                .with(authBasica()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(2));

        mockMvc.perform(get("/api/personas/2")
                .with(authBasica()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.activo").value(false));
    }
}
