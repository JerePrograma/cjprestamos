package com.cjprestamos.backend.common.audit;

import com.cjprestamos.backend.common.time.RelojSistema;
import java.time.Clock;
import java.time.LocalDateTime;
import org.springframework.stereotype.Component;

@Component
public class AuditoriaProvider {

    private static volatile Clock clock = Clock.system(RelojSistema.ZONA_OPERATIVA);

    public AuditoriaProvider(Clock clock) {
        AuditoriaProvider.clock = clock;
    }

    public static LocalDateTime ahora() {
        return LocalDateTime.now(clock);
    }
}
