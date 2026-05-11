package com.cjprestamos.backend.config;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.cjprestamos.backend.auth.controller.AuthController;
import com.cjprestamos.backend.dashboard.controller.DashboardController;
import com.cjprestamos.backend.dashboard.service.DashboardService;
import com.cjprestamos.backend.integration.hogaria.controller.HogariaIntegrationController;
import com.cjprestamos.backend.integration.hogaria.service.HogariaIntegrationService;
import com.cjprestamos.backend.persona.controller.PersonaController;
import com.cjprestamos.backend.persona.service.PersonaService;
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

@WebMvcTest({
    HogariaIntegrationController.class,
    PersonaController.class,
    PrestamoController.class,
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
        mockMvc.perform(get("/api/dashboard/resumen")).andExpect(status().isForbidden());
        mockMvc.perform(get("/api/dashboard/control-caja")).andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "OPERADORA")
    void operadoraMantieneAccesoOperativo() throws Exception {
        mockMvc.perform(get("/api/personas")).andExpect(status().isOk());
        mockMvc.perform(get("/api/prestamos")).andExpect(status().isOk());
        mockMvc.perform(get("/api/dashboard/resumen")).andExpect(status().isOk());
        mockMvc.perform(get("/api/dashboard/control-caja")).andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminMantieneAccesoOperativo() throws Exception {
        mockMvc.perform(get("/api/personas")).andExpect(status().isOk());
        mockMvc.perform(get("/api/prestamos")).andExpect(status().isOk());
        mockMvc.perform(get("/api/dashboard/resumen")).andExpect(status().isOk());
        mockMvc.perform(get("/api/dashboard/control-caja")).andExpect(status().isOk());
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
