package com.cjprestamos.backend.pago.repository;

import com.cjprestamos.backend.pago.model.Pago;
import com.cjprestamos.backend.pago.model.enums.EstadoPago;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PagoRepository extends JpaRepository<Pago, Long> {

    List<Pago> findByPrestamoIdOrderByFechaPagoDescIdDesc(Long prestamoId);
    Optional<Pago> findByPrestamoIdAndIdempotencyKey(Long prestamoId, String idempotencyKey);
    Optional<Pago> findByIdAndPrestamoId(Long pagoId, Long prestamoId);

    List<Pago> findByPrestamoIdInAndEstado(Collection<Long> prestamosIds, EstadoPago estado);

    @Query("""
        select pago
        from Pago pago
        join fetch pago.prestamo prestamo
        join fetch prestamo.persona
        where pago.estado = :estado
          and prestamo.eliminado = false
          and coalesce(pago.fechaContable, pago.fechaPago) between :desde and :hasta
        order by coalesce(pago.fechaContable, pago.fechaPago) asc, pago.id asc
        """)
    List<Pago> findRegistradosPorFechaContableOPagoEntre(
        @Param("estado") EstadoPago estado,
        @Param("desde") LocalDate desde,
        @Param("hasta") LocalDate hasta
    );
}
