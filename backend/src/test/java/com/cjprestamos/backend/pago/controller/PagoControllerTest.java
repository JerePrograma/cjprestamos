package com.cjprestamos.backend.pago.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.cjprestamos.backend.config.SecurityConfig;
import com.cjprestamos.backend.pago.dto.PagoResponse;
import com.cjprestamos.backend.pago.model.enums.EstadoPago;
import com.cjprestamos.backend.pago.service.PagoService;
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

@WebMvcTest(PagoController.class)
@Import(SecurityConfig.class)
class PagoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PagoService pagoService;

    @Test
    @WithMockUser
    void registrar_deberiaRetornar201() throws Exception {
        when(pagoService.registrar(org.mockito.ArgumentMatchers.any())).thenReturn(
            new PagoResponse(
                1L,
                15L,
                LocalDate.of(2026, 4, 16),
                new BigDecimal("200.00"),
                "Transferencia",
                "Pago registrado",
                EstadoPago.REGISTRADO,
                null,
                null
            )
        );

        String body = """
            {
              "prestamoId": 15,
              "fechaPago": "2026-04-16",
              "monto": 200.00,
              "referencia": "Transferencia",
              "observacion": "Pago registrado"
            }
            """;

        mockMvc.perform(post("/api/pagos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.estado").value("REGISTRADO"));
    }

    @Test
    @WithMockUser
    void registrar_conPayloadInvalido_deberiaRetornar400() throws Exception {
        String body = """
            {
              "prestamoId": 15,
              "monto": 0
            }
            """;

        mockMvc.perform(post("/api/pagos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void listarPorPrestamo_deberiaRetornar200() throws Exception {
        when(pagoService.listarPorPrestamo(7L)).thenReturn(List.of(
            new PagoResponse(
                2L,
                7L,
                LocalDate.of(2026, 4, 14),
                new BigDecimal("120.00"),
                null,
                null,
                EstadoPago.REGISTRADO,
                null,
                null
            )
        ));

        mockMvc.perform(get("/api/prestamos/7/pagos"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].monto").value(120.00));
    }
}
