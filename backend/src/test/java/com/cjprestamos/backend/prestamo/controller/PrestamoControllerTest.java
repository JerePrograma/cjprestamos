package com.cjprestamos.backend.prestamo.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.cjprestamos.backend.config.SecurityConfig;
import com.cjprestamos.backend.prestamo.dto.CalculoPrestamoResultado;
import com.cjprestamos.backend.prestamo.dto.PrestamoResponse;
import com.cjprestamos.backend.prestamo.model.enums.EstadoPrestamo;
import com.cjprestamos.backend.prestamo.model.enums.FrecuenciaTipo;
import com.cjprestamos.backend.prestamo.service.PrestamoService;
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
class PrestamoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PrestamoService prestamoService;

    @Test
    @WithMockUser
    void crear_deberiaRetornar201() throws Exception {
        when(prestamoService.crear(org.mockito.ArgumentMatchers.any())).thenReturn(
            new PrestamoResponse(
                1L,
                10L,
                new BigDecimal("2000.00"),
                null,
                null,
                4,
                FrecuenciaTipo.MENSUAL,
                null,
                LocalDate.of(2026, 4, 20),
                false,
                "REF-7",
                "obs",
                EstadoPrestamo.ACTIVO,
                null,
                null
            )
        );

        String body = """
            {
              \"personaId\": 10,
              \"montoInicial\": 2000.00,
              \"cantidadCuotas\": 4,
              \"frecuenciaTipo\": \"MENSUAL\",
              \"fechaBase\": \"2026-04-20\",
              \"usarFechasManuales\": false,
              \"estado\": \"ACTIVO\"
            }
            """;

        mockMvc.perform(post("/api/prestamos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    @WithMockUser
    void crear_conPayloadInvalido_deberiaRetornar400() throws Exception {
        String body = """
            {
              \"montoInicial\": 0,
              \"porcentajeFijoSugerido\": -1,
              \"interesManualOpcional\": -5,
              \"cantidadCuotas\": 0,
              \"usarFechasManuales\": false
            }
            """;

        mockMvc.perform(post("/api/prestamos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void calcular_deberiaRetornar200() throws Exception {
        when(prestamoService.calcular(org.mockito.ArgumentMatchers.any())).thenReturn(
            new CalculoPrestamoResultado(
                new BigDecimal("200.00"),
                new BigDecimal("1200.00"),
                new BigDecimal("300.00"),
                new BigDecimal("1000.00"),
                new BigDecimal("200.00"),
                new BigDecimal("200.00")
            )
        );

        String body = """
            {
              "montoInicial": 1000.00,
              "porcentajeFijoSugerido": 20.0,
              "cantidadCuotas": 4
            }
            """;

        mockMvc.perform(post("/api/prestamos/calcular")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.totalADevolver").value(1200.00));
    }

    @Test
    @WithMockUser
    void actualizarReferencia_deberiaRetornar200() throws Exception {
        when(prestamoService.actualizarReferencia(org.mockito.ArgumentMatchers.eq(4L), org.mockito.ArgumentMatchers.any())).thenReturn(
            new PrestamoResponse(
                4L,
                10L,
                new BigDecimal("2000.00"),
                null,
                null,
                4,
                FrecuenciaTipo.MENSUAL,
                null,
                LocalDate.of(2026, 4, 20),
                false,
                "REF-NUEVA",
                "Obs nueva",
                EstadoPrestamo.ACTIVO,
                null,
                null
            )
        );

        String body = """
            {
              "referenciaCodigo": "REF-NUEVA",
              "observaciones": "Obs nueva"
            }
            """;

        mockMvc.perform(put("/api/prestamos/4/referencia")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.referenciaCodigo").value("REF-NUEVA"));
    }

    @Test
    @WithMockUser
    void obtenerPorId_deberiaRetornar200() throws Exception {
        when(prestamoService.obtenerPorId(5L)).thenReturn(
            new PrestamoResponse(
                5L,
                11L,
                new BigDecimal("3500.00"),
                null,
                null,
                5,
                FrecuenciaTipo.FECHAS_MANUALES,
                null,
                null,
                true,
                null,
                null,
                EstadoPrestamo.ACTIVO,
                null,
                null
            )
        );

        mockMvc.perform(get("/api/prestamos/5"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(5L));
    }

    @Test
    @WithMockUser
    void listar_deberiaRetornar200() throws Exception {
        when(prestamoService.listar()).thenReturn(List.of(
            new PrestamoResponse(1L, 2L, new BigDecimal("1000.00"), null, null, 2, FrecuenciaTipo.MENSUAL,
                null, LocalDate.of(2026, 4, 21), false, null, null, EstadoPrestamo.ACTIVO, null, null)
        ));

        mockMvc.perform(get("/api/prestamos"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].id").value(1L));
    }

    @Test
    @WithMockUser
    void listarActivos_deberiaRetornar200() throws Exception {
        when(prestamoService.listarActivos()).thenReturn(List.of(
            new PrestamoResponse(2L, 3L, new BigDecimal("900.00"), null, null, 3, FrecuenciaTipo.CADA_X_DIAS,
                7, LocalDate.of(2026, 4, 23), false, null, null, EstadoPrestamo.ACTIVO, null, null)
        ));

        mockMvc.perform(get("/api/prestamos/activos"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].estado").value("ACTIVO"));
    }
}
