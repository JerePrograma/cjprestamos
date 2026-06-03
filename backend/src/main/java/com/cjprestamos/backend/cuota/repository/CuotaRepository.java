package com.cjprestamos.backend.cuota.repository;

import com.cjprestamos.backend.cuota.model.Cuota;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CuotaRepository extends JpaRepository<Cuota, Long> {

    boolean existsByPrestamoId(Long prestamoId);

    List<Cuota> findByPrestamoIdOrderByNumeroCuotaAsc(Long prestamoId);

    List<Cuota> findByPrestamoIdIn(Collection<Long> prestamosIds);

    List<Cuota> findByPrestamoIdAndIdIn(Long prestamoId, Collection<Long> cuotaIds);

    @Query("""
        select cuota
        from Cuota cuota
        join fetch cuota.prestamo prestamo
        join fetch prestamo.persona
        where cuota.fechaVencimiento between :desde and :hasta
        order by cuota.fechaVencimiento asc, cuota.id asc
        """)
    List<Cuota> findByFechaVencimientoBetweenConPrestamoYPersona(
        @Param("desde") LocalDate desde,
        @Param("hasta") LocalDate hasta
    );
}
