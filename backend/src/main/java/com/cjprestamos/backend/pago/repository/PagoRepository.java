package com.cjprestamos.backend.pago.repository;

import com.cjprestamos.backend.pago.model.Pago;
import com.cjprestamos.backend.pago.model.enums.EstadoPago;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PagoRepository extends JpaRepository<Pago, Long> {

    List<Pago> findByPrestamoIdOrderByFechaPagoDescIdDesc(Long prestamoId);
    Optional<Pago> findByPrestamoIdAndIdempotencyKey(Long prestamoId, String idempotencyKey);
    Optional<Pago> findByIdAndPrestamoId(Long pagoId, Long prestamoId);

    List<Pago> findByPrestamoIdInAndEstado(Collection<Long> prestamosIds, EstadoPago estado);
}
