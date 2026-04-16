package com.cjprestamos.backend.pago.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.cjprestamos.backend.evento.model.EventoPrestamo;
import com.cjprestamos.backend.evento.repository.EventoPrestamoRepository;
import com.cjprestamos.backend.pago.dto.PagoResponse;
import com.cjprestamos.backend.pago.dto.RegistroPagoRequest;
import com.cjprestamos.backend.pago.model.Pago;
import com.cjprestamos.backend.pago.model.enums.EstadoPago;
import com.cjprestamos.backend.pago.repository.PagoRepository;
import com.cjprestamos.backend.persona.model.Persona;
import com.cjprestamos.backend.prestamo.model.Prestamo;
import com.cjprestamos.backend.prestamo.repository.PrestamoRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class PagoServiceTest {

    @Mock
    private PagoRepository pagoRepository;

    @Mock
    private PrestamoRepository prestamoRepository;

    @Mock
    private EventoPrestamoRepository eventoPrestamoRepository;

    private PagoService pagoService;

    @BeforeEach
    void setUp() {
        pagoService = new PagoService(pagoRepository, prestamoRepository, eventoPrestamoRepository);
    }

    @Test
    void registrar_deberiaGuardarPagoYGenerarEvento() {
        Prestamo prestamo = crearPrestamo(10L);
        when(prestamoRepository.findById(10L)).thenReturn(Optional.of(prestamo));

        when(pagoRepository.save(org.mockito.ArgumentMatchers.any(Pago.class))).thenAnswer(invocation -> {
            Pago pago = invocation.getArgument(0);
            return pago;
        });

        RegistroPagoRequest request = new RegistroPagoRequest(
            10L,
            LocalDate.of(2026, 4, 16),
            new BigDecimal("350.00"),
            "Transferencia",
            "Pago parcial"
        );

        PagoResponse response = pagoService.registrar(request);

        assertEquals(EstadoPago.REGISTRADO, response.estado());
        assertEquals(new BigDecimal("350.00"), response.monto());
        verify(pagoRepository).save(org.mockito.ArgumentMatchers.any(Pago.class));

        ArgumentCaptor<EventoPrestamo> captorEvento = ArgumentCaptor.forClass(EventoPrestamo.class);
        verify(eventoPrestamoRepository).save(captorEvento.capture());
        assertEquals(prestamo, captorEvento.getValue().getPrestamo());
        assertEquals(LocalDate.of(2026, 4, 16).atStartOfDay(), captorEvento.getValue().getFechaEvento());
    }

    @Test
    void registrar_cuandoPrestamoNoExiste_deberiaRetornar404() {
        when(prestamoRepository.findById(99L)).thenReturn(Optional.empty());

        RegistroPagoRequest request = new RegistroPagoRequest(
            99L,
            LocalDate.of(2026, 4, 16),
            new BigDecimal("200.00"),
            null,
            null
        );

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> pagoService.registrar(request));

        assertEquals(404, exception.getStatusCode().value());
    }

    @Test
    void registrar_conMontoInvalido_deberiaRetornar400() {
        Prestamo prestamo = crearPrestamo(11L);
        when(prestamoRepository.findById(11L)).thenReturn(Optional.of(prestamo));

        RegistroPagoRequest request = new RegistroPagoRequest(
            11L,
            LocalDate.of(2026, 4, 16),
            BigDecimal.ZERO,
            null,
            null
        );

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> pagoService.registrar(request));

        assertEquals(400, exception.getStatusCode().value());
    }

    @Test
    void listarPorPrestamo_deberiaRetornarPagos() {
        Prestamo prestamo = crearPrestamo(12L);
        when(prestamoRepository.findById(12L)).thenReturn(Optional.of(prestamo));

        Pago pago = new Pago();
        pago.setPrestamo(prestamo);
        pago.setFechaPago(LocalDate.of(2026, 4, 15));
        pago.setMonto(new BigDecimal("100.00"));
        pago.setEstado(EstadoPago.REGISTRADO);

        when(pagoRepository.findByPrestamoIdOrderByFechaPagoDescIdDesc(12L)).thenReturn(List.of(pago));

        List<PagoResponse> pagos = pagoService.listarPorPrestamo(12L);

        assertEquals(1, pagos.size());
        assertEquals(new BigDecimal("100.00"), pagos.get(0).monto());
    }

    @Test
    void listarPorPrestamo_cuandoPrestamoNoExiste_deberiaRetornar404() {
        when(prestamoRepository.findById(13L)).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> pagoService.listarPorPrestamo(13L));

        assertEquals(404, exception.getStatusCode().value());
    }

    private Prestamo crearPrestamo(Long id) {
        Prestamo prestamo = new Prestamo();
        Persona persona = new Persona();
        persona.setNombre("Persona test");
        prestamo.setPersona(persona);
        prestamo.setMontoInicial(new BigDecimal("1000.00"));
        return prestamo;
    }
}
