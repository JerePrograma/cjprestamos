package com.cjprestamos.backend.prestamo.repository;

import com.cjprestamos.backend.prestamo.model.Prestamo;
import com.cjprestamos.backend.prestamo.model.enums.EstadoPrestamo;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PrestamoRepository extends JpaRepository<Prestamo, Long> {

    List<Prestamo> findAllByOrderByCreatedAtDesc();

    List<Prestamo> findByEstadoOrderByCreatedAtDesc(EstadoPrestamo estado);

    List<Prestamo> findByEstadoInOrderByCreatedAtDesc(List<EstadoPrestamo> estados);

    @EntityGraph(attributePaths = "persona")
    List<Prestamo> findByFechaBaseBetweenOrderByFechaBaseAscIdAsc(LocalDate desde, LocalDate hasta);

    long countByEstadoIn(Collection<EstadoPrestamo> estados);
}
