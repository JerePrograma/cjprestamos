package com.cjprestamos.backend.legajo.repository;

import com.cjprestamos.backend.legajo.model.LegajoPersona;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LegajoPersonaRepository extends JpaRepository<LegajoPersona, Long> {

    Optional<LegajoPersona> findByPersonaId(Long personaId);

    boolean existsByPersonaId(Long personaId);
}
