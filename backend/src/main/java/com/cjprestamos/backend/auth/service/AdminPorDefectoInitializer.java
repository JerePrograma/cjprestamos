package com.cjprestamos.backend.auth.service;

import com.cjprestamos.backend.auth.model.UsuarioSistema;
import com.cjprestamos.backend.auth.repository.UsuarioSistemaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminPorDefectoInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminPorDefectoInitializer.class);

    private final UsuarioSistemaRepository usuarioSistemaRepository;
    private final PasswordEncoder passwordEncoder;
    private final boolean habilitado;
    private final String bootstrapAdminUsername;
    private final String bootstrapAdminPassword;
    private final String bootstrapAdminRole;
    private final boolean integrationUserHabilitado;
    private final String integrationUserUsername;
    private final String integrationUserPassword;
    private final String integrationUserRole;

    public AdminPorDefectoInitializer(
        UsuarioSistemaRepository usuarioSistemaRepository,
        PasswordEncoder passwordEncoder,
        @Value("${app.auth.bootstrap-admin.enabled:true}") boolean habilitado,
        @Value("${app.auth.bootstrap-admin.username:}") String bootstrapAdminUsername,
        @Value("${app.auth.bootstrap-admin.password:}") String bootstrapAdminPassword,
        @Value("${app.auth.bootstrap-admin.role:OPERADORA}") String bootstrapAdminRole,
        @Value("${app.auth.integration-user.enabled:false}") boolean integrationUserHabilitado,
        @Value("${app.auth.integration-user.username:}") String integrationUserUsername,
        @Value("${app.auth.integration-user.password:}") String integrationUserPassword,
        @Value("${app.auth.integration-user.role:INTEGRATION}") String integrationUserRole
    ) {
        this.usuarioSistemaRepository = usuarioSistemaRepository;
        this.passwordEncoder = passwordEncoder;
        this.habilitado = habilitado;
        this.bootstrapAdminUsername = bootstrapAdminUsername;
        this.bootstrapAdminPassword = bootstrapAdminPassword;
        this.bootstrapAdminRole = bootstrapAdminRole;
        this.integrationUserHabilitado = integrationUserHabilitado;
        this.integrationUserUsername = integrationUserUsername;
        this.integrationUserPassword = integrationUserPassword;
        this.integrationUserRole = integrationUserRole;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!habilitado) {
            log.info("Bootstrap de usuario admin deshabilitado por configuración.");
            return;
        }

        crearAdminSiCorresponde();
        crearUsuarioIntegracionSiCorresponde();
    }

    private void crearAdminSiCorresponde() {
        String username = limpiar(bootstrapAdminUsername);
        String password = limpiar(bootstrapAdminPassword);

        if (username.isBlank() || password.isBlank()) {
            log.warn("Bootstrap de usuario inicial habilitado pero incompleto: username/password requeridos.");
            return;
        }

        if (usuarioSistemaRepository.existsByUsernameIgnoreCase(username)) {
            return;
        }

        UsuarioSistema admin = new UsuarioSistema();
        admin.setUsername(username);
        admin.setPassword(passwordEncoder.encode(password));
        admin.setRol(normalizarRol(bootstrapAdminRole, "OPERADORA"));
        admin.setActivo(true);

        usuarioSistemaRepository.save(admin);
        log.info("Usuario inicial creado para ingreso local: {}", username);
    }

    private void crearUsuarioIntegracionSiCorresponde() {
        if (!integrationUserHabilitado) {
            return;
        }

        String username = limpiar(integrationUserUsername);
        String password = limpiar(integrationUserPassword);
        if (username.isBlank() || password.isBlank()) {
            log.warn("Usuario técnico de integración habilitado pero incompleto: username/password requeridos.");
            return;
        }

        if (usuarioSistemaRepository.existsByUsernameIgnoreCase(username)) {
            return;
        }

        UsuarioSistema integrationUser = new UsuarioSistema();
        integrationUser.setUsername(username);
        integrationUser.setPassword(passwordEncoder.encode(password));
        integrationUser.setRol(normalizarRol(integrationUserRole, "INTEGRATION"));
        integrationUser.setActivo(true);

        usuarioSistemaRepository.save(integrationUser);
        log.info("Usuario técnico de integración creado: {}", username);
    }

    private String limpiar(String valor) {
        return valor == null ? "" : valor.trim();
    }

    private String normalizarRol(String rol, String predeterminado) {
        String valor = rol == null ? predeterminado : rol.trim().toUpperCase();
        return valor.isBlank() ? predeterminado : valor;
    }
}
