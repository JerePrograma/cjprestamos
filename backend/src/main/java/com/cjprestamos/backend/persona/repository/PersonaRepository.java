package com.cjprestamos.backend.persona.repository;

import com.cjprestamos.backend.persona.model.Persona;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PersonaRepository extends JpaRepository<Persona, Long> {

    List<Persona> findByActivoTrueOrderByNombreAsc();

    List<Persona> findByActivoFalseOrderByNombreAsc();

    List<Persona> findAllByOrderByNombreAsc();
}
