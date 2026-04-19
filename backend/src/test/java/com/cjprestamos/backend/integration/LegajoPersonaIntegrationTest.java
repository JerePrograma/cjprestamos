package com.cjprestamos.backend.integration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

class LegajoPersonaIntegrationTest extends IntegrationTestBase {

    @Test
    void crearConsultarYActualizarLegajo_porPersonaId() throws Exception {
        String crearPersona = """
            {
              "nombre": "Persona Legajo",
              "alias": "P1",
              "telefono": "1234",
              "observacionRapida": "",
              "colorReferencia": "azul",
              "cobraEnFecha": true,
              "tieneIngresoExtra": false,
              "activo": true
            }
            """;

        mockMvc.perform(post("/api/personas")
                .with(authBasica())
                .contentType(MediaType.APPLICATION_JSON)
                .content(crearPersona))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(1));

        mockMvc.perform(get("/api/personas/1/legajo")
                .with(authBasica()))
            .andExpect(status().isNotFound());

        String crearLegajo = """
            {
              "direccion": "Calle 123",
              "ocupacion": "Comerciante",
              "fuenteIngreso": "Negocio propio",
              "contactoAlternativo": "Hermana 555",
              "documentacionPendiente": "Recibo",
              "notasInternas": "Revisar en visita",
              "observacionesGenerales": "Sin novedades"
            }
            """;

        mockMvc.perform(post("/api/personas/1/legajo")
                .with(authBasica())
                .contentType(MediaType.APPLICATION_JSON)
                .content(crearLegajo))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.personaId").value(1))
            .andExpect(jsonPath("$.direccion").value("Calle 123"));

        mockMvc.perform(get("/api/personas/1/legajo")
                .with(authBasica()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.ocupacion").value("Comerciante"));

        String actualizarLegajo = """
            {
              "direccion": "Calle 999",
              "ocupacion": "Vendedora",
              "fuenteIngreso": "Comercio",
              "contactoAlternativo": "Tía 111",
              "documentacionPendiente": "",
              "notasInternas": "",
              "observacionesGenerales": "Actualizado"
            }
            """;

        mockMvc.perform(put("/api/personas/1/legajo")
                .with(authBasica())
                .contentType(MediaType.APPLICATION_JSON)
                .content(actualizarLegajo))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.direccion").value("Calle 999"))
            .andExpect(jsonPath("$.ocupacion").value("Vendedora"));

        assertThat(contarMigracionV2Aplicada()).isEqualTo(1);
    }
}
