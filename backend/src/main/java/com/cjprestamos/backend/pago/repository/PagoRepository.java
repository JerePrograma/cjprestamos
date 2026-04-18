package com.cjprestamos.backend.pago.repository;

import com.cjprestamos.backend.pago.model.Pago;
import com.cjprestamos.backend.pago.model.enums.EstadoPago;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PagoRepository extends JpaRepository<Pago, Long> {

    List<Pago> findByPrestamoIdOrderByFechaPagoDescIdDesc(Long prestamoId);

    List<Pago> findByPrestamoIdInAndEstado(Collection<Long> prestamosIds, EstadoPago estado);
}
