package com.cjprestamos.backend.auth.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.cjprestamos.backend.auth.model.UsuarioSistema;
import com.cjprestamos.backend.auth.repository.UsuarioSistemaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AdminPorDefectoInitializerTest {

    @Mock
    private UsuarioSistemaRepository usuarioSistemaRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Test
    void run_deberiaCrearAdminSiNoExiste() throws Exception {
        when(usuarioSistemaRepository.existsByUsernameIgnoreCase("admin")).thenReturn(false);
        when(passwordEncoder.encode("admin")).thenReturn("{bcrypt}hash");

        AdminPorDefectoInitializer initializer = new AdminPorDefectoInitializer(
            usuarioSistemaRepository,
            passwordEncoder,
            true
        );

        initializer.run(new DefaultApplicationArguments(new String[0]));

        ArgumentCaptor<UsuarioSistema> captor = ArgumentCaptor.forClass(UsuarioSistema.class);
        verify(usuarioSistemaRepository).save(captor.capture());
        assertEquals("admin", captor.getValue().getUsername());
        assertEquals("{bcrypt}hash", captor.getValue().getPassword());
        assertEquals("OPERADORA", captor.getValue().getRol());
        assertTrue(captor.getValue().isActivo());
    }

    @Test
    void run_noDeberiaCrearSiYaExiste() throws Exception {
        when(usuarioSistemaRepository.existsByUsernameIgnoreCase("admin")).thenReturn(true);

        AdminPorDefectoInitializer initializer = new AdminPorDefectoInitializer(
            usuarioSistemaRepository,
            passwordEncoder,
            true
        );

        initializer.run(new DefaultApplicationArguments(new String[0]));

        verify(usuarioSistemaRepository, never()).save(any());
    }
}
