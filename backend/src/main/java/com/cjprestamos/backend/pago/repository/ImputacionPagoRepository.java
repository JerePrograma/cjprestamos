package com.cjprestamos.backend.pago.repository;

import com.cjprestamos.backend.pago.model.ImputacionPago;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ImputacionPagoRepository extends JpaRepository<ImputacionPago, Long> {
    List<ImputacionPago> findByPagoId(Long pagoId);
}
