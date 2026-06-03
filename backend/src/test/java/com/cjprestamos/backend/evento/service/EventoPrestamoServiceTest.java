package com.cjprestamos.backend.evento.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

import com.cjprestamos.backend.common.time.FechaOperativaService;
import com.cjprestamos.backend.common.time.RelojSistema;
import com.cjprestamos.backend.evento.model.EventoPrestamo;
import com.cjprestamos.backend.evento.model.enums.TipoEventoPrestamo;
import com.cjprestamos.backend.evento.repository.EventoPrestamoRepository;
import com.cjprestamos.backend.pago.model.Pago;
import com.cjprestamos.backend.prestamo.model.Prestamo;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class EventoPrestamoServiceTest {

    private static final LocalDateTime AHORA_OPERATIVO = LocalDateTime.of(2026, 4, 16, 10, 30);

    @Mock
    private EventoPrestamoRepository eventoPrestamoRepository;

    private EventoPrestamoService eventoPrestamoService;

    @BeforeEach
    void setUp() {
        Clock clock = Clock.fixed(AHORA_OPERATIVO.atZone(RelojSistema.ZONA_OPERATIVA).toInstant(), RelojSistema.ZONA_OPERATIVA);
        eventoPrestamoService = new EventoPrestamoService(eventoPrestamoRepository, new FechaOperativaService(clock));
        when(eventoPrestamoRepository.save(org.mockito.ArgumentMatchers.any(EventoPrestamo.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void registrarPago_deberiaSepararFechaDePagoYFechaDeRegistro() {
        Prestamo prestamo = new Prestamo();
        Pago pago = new Pago();
        pago.setPrestamo(prestamo);
        pago.setFechaPago(LocalDate.of(2026, 4, 10));
        pago.setMonto(new BigDecimal("100.00"));

        eventoPrestamoService.registrarPago(prestamo, pago, new BigDecimal("100.00"));

        ArgumentCaptor<EventoPrestamo> captor = ArgumentCaptor.forClass(EventoPrestamo.class);
        org.mockito.Mockito.verify(eventoPrestamoRepository).save(captor.capture());
        EventoPrestamo evento = captor.getValue();

        assertEquals(TipoEventoPrestamo.REGISTRO_PAGO, evento.getTipoEvento());
        assertEquals(LocalDateTime.of(2026, 4, 10, 0, 0), evento.getFechaEvento());
        assertEquals(LocalDateTime.of(2026, 4, 10, 0, 0), evento.getOcurridoEn());
        assertEquals(AHORA_OPERATIVO, evento.getRegistradoEn());
    }

    @Test
    void registrarAnulacionPago_deberiaUsarAhoraOperativoComoOcurrenciaYRegistro() {
        Prestamo prestamo = new Prestamo();
        Pago pago = new Pago();
        pago.setPrestamo(prestamo);
        pago.setFechaPago(LocalDate.of(2026, 4, 10));

        eventoPrestamoService.registrarAnulacionPago(prestamo, pago);

        ArgumentCaptor<EventoPrestamo> captor = ArgumentCaptor.forClass(EventoPrestamo.class);
        org.mockito.Mockito.verify(eventoPrestamoRepository).save(captor.capture());
        EventoPrestamo evento = captor.getValue();

        assertEquals(TipoEventoPrestamo.OBSERVACION, evento.getTipoEvento());
        assertEquals(AHORA_OPERATIVO, evento.getFechaEvento());
        assertEquals(AHORA_OPERATIVO, evento.getOcurridoEn());
        assertEquals(AHORA_OPERATIVO, evento.getRegistradoEn());
    }
}
