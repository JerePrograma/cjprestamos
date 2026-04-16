package com.cjprestamos.backend.evento.repository;

import com.cjprestamos.backend.evento.model.EventoPrestamo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventoPrestamoRepository extends JpaRepository<EventoPrestamo, Long> {
}
