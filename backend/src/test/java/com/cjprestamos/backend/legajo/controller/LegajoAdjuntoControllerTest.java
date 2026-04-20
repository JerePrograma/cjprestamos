package com.cjprestamos.backend.legajo.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.cjprestamos.backend.config.SecurityConfig;
import com.cjprestamos.backend.legajo.dto.LegajoAdjuntoResponse;
import com.cjprestamos.backend.legajo.service.LegajoAdjuntoDescarga;
import com.cjprestamos.backend.legajo.service.LegajoAdjuntoService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(LegajoAdjuntoController.class)
@Import(SecurityConfig.class)
class LegajoAdjuntoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private LegajoAdjuntoService legajoAdjuntoService;

    @Test
    @WithMockUser
    void listar_deberiaRetornarAdjuntos() throws Exception {
        when(legajoAdjuntoService.listarPorPersona(1L)).thenReturn(List.of(
            new LegajoAdjuntoResponse(9L, 1L, "dni.pdf", "application/pdf", 123L, null)
        ));

        mockMvc.perform(get("/api/personas/1/legajo/adjuntos"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].id").value(9L))
            .andExpect(jsonPath("$[0].nombreOriginal").value("dni.pdf"));
    }

    @Test
    @WithMockUser
    void subir_deberiaRetornar201() throws Exception {
        when(legajoAdjuntoService.subir(org.mockito.ArgumentMatchers.eq(1L), org.mockito.ArgumentMatchers.any()))
            .thenReturn(new LegajoAdjuntoResponse(3L, 1L, "recibo.pdf", "application/pdf", 100L, null));

        mockMvc.perform(multipart("/api/personas/1/legajo/adjuntos")
                .file("archivo", "contenido".getBytes())
                .contentType(MediaType.MULTIPART_FORM_DATA))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(3L));
    }

    @Test
    @WithMockUser
    void descargar_deberiaRetornarArchivo() throws Exception {
        when(legajoAdjuntoService.descargar(1L, 3L)).thenReturn(
            new LegajoAdjuntoDescarga("recibo.pdf", "application/pdf", new ByteArrayResource("hola".getBytes()))
        );

        mockMvc.perform(get("/api/personas/1/legajo/adjuntos/3/descargar"))
            .andExpect(status().isOk())
            .andExpect(header().string("Content-Disposition", org.hamcrest.Matchers.containsString("recibo.pdf")));
    }

    @Test
    @WithMockUser
    void eliminar_deberiaRetornar204() throws Exception {
        mockMvc.perform(delete("/api/personas/1/legajo/adjuntos/3"))
            .andExpect(status().isNoContent());
    }
}
