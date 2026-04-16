package com.cjprestamos.backend.prestamo.repository;

import com.cjprestamos.backend.prestamo.model.Prestamo;
import com.cjprestamos.backend.prestamo.model.enums.EstadoPrestamo;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PrestamoRepository extends JpaRepository<Prestamo, Long> {

    List<Prestamo> findAllByOrderByCreatedAtDesc();

    List<Prestamo> findByEstadoOrderByCreatedAtDesc(EstadoPrestamo estado);
}
