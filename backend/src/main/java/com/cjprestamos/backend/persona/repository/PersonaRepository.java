package com.cjprestamos.backend.persona.repository;

import com.cjprestamos.backend.persona.model.Persona;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PersonaRepository extends JpaRepository<Persona, Long> {
}
