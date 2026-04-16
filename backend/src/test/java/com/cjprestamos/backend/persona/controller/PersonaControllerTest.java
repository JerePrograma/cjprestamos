package com.cjprestamos.backend.persona.controller;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.cjprestamos.backend.config.SecurityConfig;
import com.cjprestamos.backend.persona.dto.PersonaResponse;
import com.cjprestamos.backend.persona.service.PersonaService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(PersonaController.class)
@Import(SecurityConfig.class)
class PersonaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PersonaService personaService;

    @Test
    @WithMockUser
    void crear_deberiaRetornar201() throws Exception {
        PersonaResponse response = new PersonaResponse(1L, "Ana", "Ani", "123", "Obs", "verde", true, true, true, null, null);
        when(personaService.crear(org.mockito.ArgumentMatchers.any())).thenReturn(response);

        String body = """
            {
              \"nombre\": \"Ana\",
              \"alias\": \"Ani\",
              \"telefono\": \"123\",
              \"observacionRapida\": \"Obs\",
              \"colorReferencia\": \"verde\",
              \"cobraEnFecha\": true,
              \"tieneIngresoExtra\": true,
              \"activo\": true
            }
            """;

        mockMvc.perform(post("/api/personas")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(1L))
            .andExpect(jsonPath("$.nombre").value("Ana"));
    }

    @Test
    @WithMockUser
    void listar_deberiaRetornar200() throws Exception {
        when(personaService.listar()).thenReturn(List.of(
            new PersonaResponse(1L, "Ana", "Ani", "123", null, null, true, false, true, null, null)
        ));

        mockMvc.perform(get("/api/personas"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].id").value(1L));
    }

    @Test
    @WithMockUser
    void obtenerPorId_deberiaRetornar200() throws Exception {
        when(personaService.obtenerPorId(1L)).thenReturn(
            new PersonaResponse(1L, "Ana", "Ani", "123", null, null, true, false, true, null, null)
        );

        mockMvc.perform(get("/api/personas/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    @WithMockUser
    void actualizar_conPayloadInvalido_deberiaRetornar400() throws Exception {
        String bodyInvalido = """
            {
              \"nombre\": \"\",
              \"cobraEnFecha\": true,
              \"tieneIngresoExtra\": true,
              \"activo\": true
            }
            """;

        mockMvc.perform(put("/api/personas/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(bodyInvalido))
            .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void eliminar_deberiaRetornar204() throws Exception {
        mockMvc.perform(delete("/api/personas/1"))
            .andExpect(status().isNoContent());

        verify(personaService).eliminar(1L);
    }
}
