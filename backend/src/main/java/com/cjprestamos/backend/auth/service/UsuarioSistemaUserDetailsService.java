package com.cjprestamos.backend.auth.service;

import com.cjprestamos.backend.auth.model.UsuarioSistema;
import com.cjprestamos.backend.auth.repository.UsuarioSistemaRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UsuarioSistemaUserDetailsService implements UserDetailsService {

    private final UsuarioSistemaRepository usuarioRepository;

    public UsuarioSistemaUserDetailsService(UsuarioSistemaRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UsuarioSistema usuario = usuarioRepository.findByUsernameIgnoreCase(username)
            .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado."));

        if (!usuario.isActivo()) {
            throw new UsernameNotFoundException("Usuario inactivo.");
        }

        return User.withUsername(usuario.getUsername())
            .password(usuario.getPassword())
            .authorities(new SimpleGrantedAuthority("ROLE_" + usuario.getRol()))
            .build();
    }
}
