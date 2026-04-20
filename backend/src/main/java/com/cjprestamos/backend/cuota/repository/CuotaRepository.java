package com.cjprestamos.backend.cuota.repository;

import com.cjprestamos.backend.cuota.model.Cuota;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CuotaRepository extends JpaRepository<Cuota, Long> {

    boolean existsByPrestamoId(Long prestamoId);

    List<Cuota> findByPrestamoIdOrderByNumeroCuotaAsc(Long prestamoId);

    List<Cuota> findByPrestamoIdIn(Collection<Long> prestamosIds);

    List<Cuota> findByPrestamoIdAndIdIn(Long prestamoId, Collection<Long> cuotaIds);
}
