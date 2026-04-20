package com.cjprestamos.backend.integration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;

class LegajoAdjuntoIntegrationTest extends IntegrationTestBase {

    @Test
    void subirListarDescargarYEliminarAdjunto() throws Exception {
        String crearPersona = """
            {
              "nombre": "Persona Adjuntos",
              "alias": "PA",
              "telefono": "1234",
              "observacionRapida": "",
              "colorReferencia": "gris",
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

        String crearLegajo = """
            {
              "direccion": "Calle 123",
              "ocupacion": "Comerciante"
            }
            """;

        mockMvc.perform(post("/api/personas/1/legajo")
                .with(authBasica())
                .contentType(MediaType.APPLICATION_JSON)
                .content(crearLegajo))
            .andExpect(status().isCreated());

        MockMultipartFile archivo = new MockMultipartFile(
            "archivo",
            "dni.txt",
            "text/plain",
            "contenido-prueba".getBytes()
        );

        mockMvc.perform(multipart("/api/personas/1/legajo/adjuntos")
                .file(archivo)
                .with(authBasica()))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.nombreOriginal").value("dni.txt"));

        mockMvc.perform(get("/api/personas/1/legajo/adjuntos")
                .with(authBasica()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].id").value(1));

        mockMvc.perform(get("/api/personas/1/legajo/adjuntos/1/descargar")
                .with(authBasica()))
            .andExpect(status().isOk())
            .andExpect(header().string("Content-Disposition", org.hamcrest.Matchers.containsString("dni.txt")));

        mockMvc.perform(delete("/api/personas/1/legajo/adjuntos/1")
                .with(authBasica()))
            .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/personas/1/legajo/adjuntos")
                .with(authBasica()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isEmpty());

        assertThat(contarMigracionV4Aplicada()).isEqualTo(1);
    }
}
