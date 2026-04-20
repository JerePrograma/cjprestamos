package com.cjprestamos.backend.cuota.controller;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.cjprestamos.backend.config.SecurityConfig;
import com.cjprestamos.backend.cuota.dto.CuotaResponse;
import com.cjprestamos.backend.cuota.model.enums.EstadoCuota;
import com.cjprestamos.backend.cuota.service.CuotaService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(CuotaController.class)
@Import(SecurityConfig.class)
class CuotaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CuotaService cuotaService;

    @Test
    @WithMockUser
    void generar_deberiaRetornar201() throws Exception {
        when(cuotaService.generar(org.mockito.ArgumentMatchers.eq(1L), org.mockito.ArgumentMatchers.any())).thenReturn(List.of(
            new CuotaResponse(1L, 1, LocalDate.of(2026, 4, 20), new BigDecimal("600.00"), BigDecimal.ZERO.setScale(2), EstadoCuota.PENDIENTE)
        ));

        mockMvc.perform(post("/api/prestamos/1/cuotas/generar")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$[0].numeroCuota").value(1));
    }

    @Test
    @WithMockUser
    void listar_deberiaRetornar200() throws Exception {
        when(cuotaService.listarPorPrestamo(2L)).thenReturn(List.of(
            new CuotaResponse(2L, 1, LocalDate.of(2026, 4, 10), new BigDecimal("400.00"), BigDecimal.ZERO.setScale(2), EstadoCuota.PENDIENTE)
        ));

        mockMvc.perform(get("/api/prestamos/2/cuotas"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].estado").value("PENDIENTE"));

        verify(cuotaService).listarPorPrestamo(2L);
    }

    @Test
    @WithMockUser
    void ajustarFuturas_deberiaRetornar200() throws Exception {
        when(cuotaService.ajustarFuturas(org.mockito.ArgumentMatchers.eq(2L), org.mockito.ArgumentMatchers.any())).thenReturn(List.of(
            new CuotaResponse(2L, 1, LocalDate.of(2026, 5, 10), new BigDecimal("450.00"), BigDecimal.ZERO.setScale(2), EstadoCuota.PENDIENTE)
        ));

        String body = """
            {
              "fechaRenegociacion": "2026-04-20",
              "observacionGeneral": "Ajuste acordado",
              "cuotas": [
                {
                  "cuotaId": 2,
                  "fechaVencimiento": "2026-05-10",
                  "montoProgramado": 450.00
                }
              ]
            }
            """;

        mockMvc.perform(put("/api/prestamos/2/cuotas/ajustes-futuros")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].montoProgramado").value(450.00));
    }
}
