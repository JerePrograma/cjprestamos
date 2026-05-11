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
    private final boolean integrationUserHabilitado;
    private final String integrationUserUsername;
    private final String integrationUserPassword;
    private final String integrationUserRole;

    public AdminPorDefectoInitializer(
        UsuarioSistemaRepository usuarioSistemaRepository,
        PasswordEncoder passwordEncoder,
        @Value("${app.auth.bootstrap-admin.enabled:true}") boolean habilitado,
        @Value("${app.auth.integration-user.enabled:false}") boolean integrationUserHabilitado,
        @Value("${app.auth.integration-user.username:}") String integrationUserUsername,
        @Value("${app.auth.integration-user.password:}") String integrationUserPassword,
        @Value("${app.auth.integration-user.role:INTEGRATION}") String integrationUserRole
    ) {
        this.usuarioSistemaRepository = usuarioSistemaRepository;
        this.passwordEncoder = passwordEncoder;
        this.habilitado = habilitado;
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

        if (!usuarioSistemaRepository.existsByUsernameIgnoreCase("admin")) {
            UsuarioSistema admin = new UsuarioSistema();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin"));
            admin.setRol("OPERADORA");
            admin.setActivo(true);

            usuarioSistemaRepository.save(admin);
            log.info("Usuario admin por defecto creado para ingreso inicial.");
        }

        crearUsuarioIntegracionSiCorresponde();
    }

    private void crearUsuarioIntegracionSiCorresponde() {
        if (!integrationUserHabilitado) {
            return;
        }

        String username = integrationUserUsername == null ? "" : integrationUserUsername.trim();
        String password = integrationUserPassword == null ? "" : integrationUserPassword.trim();
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
        integrationUser.setRol(normalizarRol(integrationUserRole));
        integrationUser.setActivo(true);

        usuarioSistemaRepository.save(integrationUser);
        log.info("Usuario técnico de integración creado: {}", username);
    }

    private String normalizarRol(String rol) {
        String valor = rol == null ? "INTEGRATION" : rol.trim().toUpperCase();
        return valor.isBlank() ? "INTEGRATION" : valor;
    }
}
