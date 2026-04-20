package com.cjprestamos.backend.auth.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.cjprestamos.backend.auth.dto.UsuarioResponse;
import com.cjprestamos.backend.auth.service.UsuarioSistemaService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(UsuarioSistemaController.class)
@Import(com.cjprestamos.backend.config.SecurityConfig.class)
class UsuarioSistemaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UsuarioSistemaService usuarioService;

    @Test
    @WithMockUser
    void listar_devuelveUsuarios() throws Exception {
        when(usuarioService.listar()).thenReturn(List.of(new UsuarioResponse(1L, "operadora", "OPERADORA", true)));

        mockMvc.perform(get("/api/usuarios"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].username").value("operadora"));
    }

    @Test
    @WithMockUser
    void crear_devuelveCreado() throws Exception {
        when(usuarioService.crear(any())).thenReturn(new UsuarioResponse(2L, "ana", "OPERADORA", true));

        mockMvc.perform(post("/api/usuarios")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "username": "ana",
                      "password": "clave123",
                      "rol": "OPERADORA"
                    }
                    """))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(2L));
    }
}
