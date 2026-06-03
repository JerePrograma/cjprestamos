package com.cjprestamos.backend.common.time;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import org.junit.jupiter.api.Test;

class FechaOperativaServiceTest {

    @Test
    void hoy_deberiaResolverCambioDeDiaConZonaOperativa() {
        Clock clock = Clock.fixed(Instant.parse("2026-04-16T02:30:00Z"), RelojSistema.ZONA_OPERATIVA);
        FechaOperativaService service = new FechaOperativaService(clock);

        assertEquals(LocalDate.of(2026, 4, 15), service.hoy());
        assertEquals(LocalDateTime.of(2026, 4, 15, 23, 30), service.ahora());
        assertEquals(YearMonth.of(2026, 4), service.mesActual());
    }
}
