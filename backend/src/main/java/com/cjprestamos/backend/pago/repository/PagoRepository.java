package com.cjprestamos.backend.pago.repository;

import com.cjprestamos.backend.pago.model.Pago;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PagoRepository extends JpaRepository<Pago, Long> {

    List<Pago> findByPrestamoIdOrderByFechaPagoDescIdDesc(Long prestamoId);
}
