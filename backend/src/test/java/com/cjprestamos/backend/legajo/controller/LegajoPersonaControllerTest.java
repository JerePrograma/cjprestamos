package com.cjprestamos.backend.legajo.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.cjprestamos.backend.config.SecurityConfig;
import com.cjprestamos.backend.legajo.dto.LegajoPersonaResponse;
import com.cjprestamos.backend.legajo.service.LegajoPersonaService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

@WebMvcTest(LegajoPersonaController.class)
@Import(SecurityConfig.class)
class LegajoPersonaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private LegajoPersonaService legajoPersonaService;

    @Test
    @WithMockUser
    void crear_deberiaRetornar201() throws Exception {
        LegajoPersonaResponse response = new LegajoPersonaResponse(
            1L,
            1L,
            "Calle 123",
            "Comerciante",
            "Negocio",
            "Hermana",
            "Recibo de sueldo",
            "Nota",
            "Obs",
            null,
            null
        );
        when(legajoPersonaService.crear(org.mockito.ArgumentMatchers.eq(1L), org.mockito.ArgumentMatchers.any())).thenReturn(response);

        String body = """
            {
              \"direccion\": \"Calle 123\",
              \"ocupacion\": \"Comerciante\"
            }
            """;

        mockMvc.perform(post("/api/personas/1/legajo")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.personaId").value(1L));
    }

    @Test
    @WithMockUser
    void obtener_cuandoNoExiste_deberiaRetornar404() throws Exception {
        when(legajoPersonaService.obtenerPorPersonaId(5L))
            .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "Legajo no encontrado para la persona"));

        mockMvc.perform(get("/api/personas/5/legajo"))
            .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    void crear_conPayloadInvalido_deberiaRetornar400() throws Exception {
        String bodyInvalido = """
            {
              \"direccion\": \"%s\"
            }
            """.formatted("x".repeat(301));

        mockMvc.perform(post("/api/personas/1/legajo")
                .contentType(MediaType.APPLICATION_JSON)
                .content(bodyInvalido))
            .andExpect(status().isBadRequest());
    }
}
