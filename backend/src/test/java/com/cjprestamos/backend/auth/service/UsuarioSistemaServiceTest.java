package com.cjprestamos.backend.auth.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.cjprestamos.backend.auth.dto.UsuarioRequest;
import com.cjprestamos.backend.auth.model.UsuarioSistema;
import com.cjprestamos.backend.auth.repository.UsuarioSistemaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class UsuarioSistemaServiceTest {

    @Mock
    private UsuarioSistemaRepository usuarioRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UsuarioSistemaService usuarioService;

    @Test
    void crear_guardaUsuarioNormalizado() {
        when(usuarioRepository.existsByUsernameIgnoreCase("ana")).thenReturn(false);
        when(passwordEncoder.encode("clave123")).thenReturn("{noop}clave123");
        when(usuarioRepository.save(any())).thenAnswer(invocation -> {
            UsuarioSistema usuario = invocation.getArgument(0);
            usuario.setActivo(true);
            return usuario;
        });

        var response = usuarioService.crear(new UsuarioRequest(" Ana ", "clave123", "operadora"));

        assertEquals("ana", response.username());
        assertEquals("OPERADORA", response.rol());
        verify(usuarioRepository).save(any());
    }

    @Test
    void crear_fallaSiUsuarioExiste() {
        when(usuarioRepository.existsByUsernameIgnoreCase("ana")).thenReturn(true);

        assertThrows(IllegalArgumentException.class,
            () -> usuarioService.crear(new UsuarioRequest("ana", "clave123", "OPERADORA")));
    }
}
