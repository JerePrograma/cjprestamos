package com.cjprestamos.backend.common.time;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import org.springframework.stereotype.Service;

@Service
public class FechaOperativaService {

    private final Clock clock;

    public FechaOperativaService(Clock clock) {
        this.clock = clock;
    }

    public LocalDate hoy() {
        return LocalDate.now(clock);
    }

    public LocalDateTime ahora() {
        return LocalDateTime.now(clock);
    }

    public YearMonth mesActual() {
        return YearMonth.now(clock);
    }

    public LocalDate inicioMesActual() {
        return mesActual().atDay(1);
    }

    public LocalDateTime inicioDeDia(LocalDate fecha) {
        return fecha.atStartOfDay();
    }
}
