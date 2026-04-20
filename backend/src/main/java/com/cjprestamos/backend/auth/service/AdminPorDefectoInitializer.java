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

    public AdminPorDefectoInitializer(
        UsuarioSistemaRepository usuarioSistemaRepository,
        PasswordEncoder passwordEncoder,
        @Value("${app.auth.bootstrap-admin.enabled:true}") boolean habilitado
    ) {
        this.usuarioSistemaRepository = usuarioSistemaRepository;
        this.passwordEncoder = passwordEncoder;
        this.habilitado = habilitado;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!habilitado) {
            log.info("Bootstrap de usuario admin deshabilitado por configuración.");
            return;
        }

        if (usuarioSistemaRepository.existsByUsernameIgnoreCase("admin")) {
            return;
        }

        UsuarioSistema admin = new UsuarioSistema();
        admin.setUsername("admin");
        admin.setPassword(passwordEncoder.encode("admin"));
        admin.setRol("OPERADORA");
        admin.setActivo(true);

        usuarioSistemaRepository.save(admin);
        log.info("Usuario admin por defecto creado para ingreso inicial.");
    }
}
