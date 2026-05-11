package com.cjprestamos.backend.config;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.cjprestamos.backend.auth.controller.AuthController;
import com.cjprestamos.backend.dashboard.controller.DashboardController;
import com.cjprestamos.backend.dashboard.service.DashboardService;
import com.cjprestamos.backend.integration.hogaria.controller.HogariaIntegrationController;
import com.cjprestamos.backend.integration.hogaria.service.HogariaIntegrationService;
import com.cjprestamos.backend.legajo.controller.LegajoAdjuntoController;
import com.cjprestamos.backend.legajo.service.LegajoAdjuntoService;
import com.cjprestamos.backend.persona.controller.PersonaController;
import com.cjprestamos.backend.persona.service.PersonaService;
import com.cjprestamos.backend.pago.controller.PagoController;
import com.cjprestamos.backend.pago.service.PagoService;
import com.cjprestamos.backend.prestamo.controller.PrestamoController;
import com.cjprestamos.backend.prestamo.service.PrestamoService;
import com.cjprestamos.backend.prestamo.service.SimuladorPrestamoService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.mock.web.MockMultipartFile;

@WebMvcTest({
    HogariaIntegrationController.class,
    PersonaController.class,
    PrestamoController.class,
    PagoController.class,
    LegajoAdjuntoController.class,
    DashboardController.class,
    AuthController.class
})
@Import(SecurityConfig.class)
class SecurityAuthorizationMatrixTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private HogariaIntegrationService hogariaIntegrationService;

    @MockBean
    private PersonaService personaService;

    @MockBean
    private PrestamoService prestamoService;

    @MockBean
    private SimuladorPrestamoService simuladorPrestamoService;

    @MockBean
    private DashboardService dashboardService;

    @MockBean
    private PagoService pagoService;

    @MockBean
    private LegajoAdjuntoService legajoAdjuntoService;

    @Test
    @WithMockUser(roles = "INTEGRATION")
    void integrationSoloPuedeAccederBridgeAliasActual() throws Exception {
        mockMvc.perform(get("/api/integration/hogaria/dashboard"))
            .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "INTEGRATION")
    void integrationSoloPuedeAccederBridgeAliasV1() throws Exception {
        mockMvc.perform(get("/api/v1/integration/hogaria/dashboard"))
            .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "INTEGRATION")
    void integrationNoPuedeAccederEndpointsOperativos() throws Exception {
        mockMvc.perform(get("/api/personas")).andExpect(status().isForbidden());
        mockMvc.perform(get("/api/prestamos")).andExpect(status().isForbidden());
        mockMvc.perform(post("/api/pagos").contentType("application/json").content("{}"))
            .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/prestamos/1/pagos")).andExpect(status().isForbidden());
        mockMvc.perform(get("/api/personas/1/legajo/adjuntos")).andExpect(status().isForbidden());
        mockMvc.perform(multipart("/api/personas/1/legajo/adjuntos")
                .file(new MockMultipartFile("archivo", "test.txt", "text/plain", "hola".getBytes())))
            .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/dashboard/resumen")).andExpect(status().isForbidden());
        mockMvc.perform(get("/api/dashboard/control-caja")).andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "OPERADORA")
    void operadoraMantieneAccesoOperativo() throws Exception {
        mockMvc.perform(get("/api/personas")).andExpect(status().isOk());
        mockMvc.perform(get("/api/prestamos")).andExpect(status().isOk());
        mockMvc.perform(get("/api/prestamos/1/pagos")).andExpect(status().isOk());
        mockMvc.perform(get("/api/personas/1/legajo/adjuntos")).andExpect(status().isOk());
        mockMvc.perform(get("/api/dashboard/resumen")).andExpect(status().isOk());
        mockMvc.perform(get("/api/dashboard/control-caja")).andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminMantieneAccesoOperativo() throws Exception {
        mockMvc.perform(get("/api/personas")).andExpect(status().isOk());
        mockMvc.perform(get("/api/prestamos")).andExpect(status().isOk());
        mockMvc.perform(get("/api/prestamos/1/pagos")).andExpect(status().isOk());
        mockMvc.perform(get("/api/personas/1/legajo/adjuntos")).andExpect(status().isOk());
        mockMvc.perform(get("/api/dashboard/resumen")).andExpect(status().isOk());
        mockMvc.perform(get("/api/dashboard/control-caja")).andExpect(status().isOk());
    }

    @Test
    void endpointsOperativosSinAuthDevuelven401() throws Exception {
        mockMvc.perform(post("/api/pagos").contentType("application/json").content("{}"))
            .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/prestamos/1/pagos")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/personas/1/legajo/adjuntos")).andExpect(status().isUnauthorized());
        mockMvc.perform(multipart("/api/personas/1/legajo/adjuntos")
                .file(new MockMultipartFile("archivo", "test.txt", "text/plain", "hola".getBytes())))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void bridgeSinAuthDevuelve401() throws Exception {
        mockMvc.perform(get("/api/integration/hogaria/dashboard"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void bridgeCredencialesInvalidasDevuelve401() throws Exception {
        mockMvc.perform(get("/api/integration/hogaria/dashboard").with(httpBasic("bad", "creds")))
            .andExpect(status().isUnauthorized());
    }
}
