package com.cjprestamos.backend.prestamo.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.cjprestamos.backend.config.SecurityConfig;
import com.cjprestamos.backend.prestamo.dto.SimulacionCuotaResponse;
import com.cjprestamos.backend.prestamo.dto.SimulacionPrestamoResponse;
import com.cjprestamos.backend.prestamo.service.PrestamoService;
import com.cjprestamos.backend.prestamo.service.SimuladorPrestamoService;
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

@WebMvcTest(PrestamoController.class)
@Import(SecurityConfig.class)
class SimuladorPrestamoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PrestamoService prestamoService;

    @MockBean
    private SimuladorPrestamoService simuladorPrestamoService;

    @Test
    @WithMockUser
    void simular_deberiaRetornar200() throws Exception {
        when(simuladorPrestamoService.simular(any())).thenReturn(new SimulacionPrestamoResponse(
            new BigDecimal("1000.00"),
            new BigDecimal("200.00"),
            new BigDecimal("1200.00"),
            new BigDecimal("300.00"),
            4,
            List.of(new SimulacionCuotaResponse(1, LocalDate.of(2026, 5, 10), new BigDecimal("300.00")))
        ));

        String body = """
            {
              "montoInicial": 1000,
              "porcentajeFijoSugerido": 20,
              "cantidadCuotas": 4,
              "frecuenciaTipo": "MENSUAL",
              "fechaPrimerVencimiento": "2026-05-10"
            }
            """;

        mockMvc.perform(post("/api/prestamos/simulador")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.totalADevolver").value(1200.00));
    }

    @Test
    @WithMockUser
    void generarPdf_deberiaRetornarPdf() throws Exception {
        when(simuladorPrestamoService.generarPdfSimulacion(any())).thenReturn("%PDF-sim".getBytes());

        String body = """
            {
              "montoInicial": 1000,
              "porcentajeFijoSugerido": 20,
              "cantidadCuotas": 4,
              "frecuenciaTipo": "MENSUAL",
              "fechaPrimerVencimiento": "2026-05-10"
            }
            """;

        mockMvc.perform(post("/api/prestamos/simulador/pdf")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isOk())
            .andExpect(header().string("Content-Type", MediaType.APPLICATION_PDF_VALUE));
    }
}
