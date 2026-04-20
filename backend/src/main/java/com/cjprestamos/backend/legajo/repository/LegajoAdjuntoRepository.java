package com.cjprestamos.backend.legajo.repository;

import com.cjprestamos.backend.legajo.model.LegajoAdjunto;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LegajoAdjuntoRepository extends JpaRepository<LegajoAdjunto, Long> {

    List<LegajoAdjunto> findByLegajoPersonaPersonaIdOrderByCreatedAtDesc(Long personaId);

    Optional<LegajoAdjunto> findByIdAndLegajoPersonaPersonaId(Long id, Long personaId);
}
