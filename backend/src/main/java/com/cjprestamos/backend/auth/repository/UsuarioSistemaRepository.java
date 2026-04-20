package com.cjprestamos.backend.auth.repository;

import com.cjprestamos.backend.auth.model.UsuarioSistema;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioSistemaRepository extends JpaRepository<UsuarioSistema, Long> {

    Optional<UsuarioSistema> findByUsernameIgnoreCase(String username);

    boolean existsByUsernameIgnoreCase(String username);
}
