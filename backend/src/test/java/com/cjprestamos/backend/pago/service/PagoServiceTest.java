package com.cjprestamos.backend.pago.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.cjprestamos.backend.cuota.model.Cuota;
import com.cjprestamos.backend.cuota.model.enums.EstadoCuota;
import com.cjprestamos.backend.cuota.repository.CuotaRepository;
import com.cjprestamos.backend.evento.model.EventoPrestamo;
import com.cjprestamos.backend.evento.repository.EventoPrestamoRepository;
import com.cjprestamos.backend.pago.dto.PagoResponse;
import com.cjprestamos.backend.pago.dto.RegistroPagoRequest;
import com.cjprestamos.backend.pago.model.ImputacionPago;
import com.cjprestamos.backend.pago.model.Pago;
import com.cjprestamos.backend.pago.model.enums.EstadoPago;
import com.cjprestamos.backend.pago.repository.ImputacionPagoRepository;
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
    private CuotaRepository cuotaRepository;

    @Mock
    private ImputacionPagoRepository imputacionPagoRepository;

    @Mock
    private EventoPrestamoRepository eventoPrestamoRepository;

    private PagoService pagoService;

    @BeforeEach
    void setUp() {
        pagoService = new PagoService(
            pagoRepository,
            prestamoRepository,
            cuotaRepository,
            imputacionPagoRepository,
            eventoPrestamoRepository
        );
    }

    @Test
    void registrar_pagoExacto_deberiaDejarCuotaPagada() {
        Prestamo prestamo = crearPrestamo(10L);
        Cuota cuota1 = crearCuota(prestamo, 1, "100.00", "0.00", EstadoCuota.PENDIENTE);

        when(prestamoRepository.findById(10L)).thenReturn(Optional.of(prestamo));
        when(cuotaRepository.findByPrestamoIdOrderByNumeroCuotaAsc(10L)).thenReturn(List.of(cuota1));
        when(pagoRepository.save(org.mockito.ArgumentMatchers.any(Pago.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RegistroPagoRequest request = new RegistroPagoRequest(10L, LocalDate.of(2026, 4, 16), new BigDecimal("100.00"), null, null);

        PagoResponse response = pagoService.registrar(request);

        assertEquals(EstadoPago.REGISTRADO, response.estado());
        assertEquals(new BigDecimal("100.00"), cuota1.getMontoPagado());
        assertEquals(EstadoCuota.PAGADA, cuota1.getEstado());

        ArgumentCaptor<List<ImputacionPago>> captorImputaciones = ArgumentCaptor.forClass(List.class);
        verify(imputacionPagoRepository).saveAll(captorImputaciones.capture());
        assertEquals(1, captorImputaciones.getValue().size());
        assertEquals(new BigDecimal("100.00"), captorImputaciones.getValue().get(0).getMontoImputado());

        verify(cuotaRepository).saveAll(List.of(cuota1));
        verify(eventoPrestamoRepository).save(org.mockito.ArgumentMatchers.any(EventoPrestamo.class));
    }

    @Test
    void registrar_pagoParcial_deberiaDejarCuotaParcial() {
        Prestamo prestamo = crearPrestamo(11L);
        Cuota cuota1 = crearCuota(prestamo, 1, "150.00", "0.00", EstadoCuota.PENDIENTE);

        when(prestamoRepository.findById(11L)).thenReturn(Optional.of(prestamo));
        when(cuotaRepository.findByPrestamoIdOrderByNumeroCuotaAsc(11L)).thenReturn(List.of(cuota1));
        when(pagoRepository.save(org.mockito.ArgumentMatchers.any(Pago.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RegistroPagoRequest request = new RegistroPagoRequest(11L, LocalDate.of(2026, 4, 16), new BigDecimal("50.00"), null, null);

        pagoService.registrar(request);

        assertEquals(new BigDecimal("50.00"), cuota1.getMontoPagado());
        assertEquals(EstadoCuota.PARCIAL, cuota1.getEstado());

        ArgumentCaptor<List<ImputacionPago>> captorImputaciones = ArgumentCaptor.forClass(List.class);
        verify(imputacionPagoRepository).saveAll(captorImputaciones.capture());
        assertEquals(new BigDecimal("50.00"), captorImputaciones.getValue().get(0).getMontoImputado());
    }

    @Test
    void registrar_pagoMultiple_deberiaCubrirVariasCuotas() {
        Prestamo prestamo = crearPrestamo(12L);
        Cuota cuota1 = crearCuota(prestamo, 1, "100.00", "0.00", EstadoCuota.PENDIENTE);
        Cuota cuota2 = crearCuota(prestamo, 2, "80.00", "0.00", EstadoCuota.PENDIENTE);
        Cuota cuota3 = crearCuota(prestamo, 3, "70.00", "0.00", EstadoCuota.PENDIENTE);

        when(prestamoRepository.findById(12L)).thenReturn(Optional.of(prestamo));
        when(cuotaRepository.findByPrestamoIdOrderByNumeroCuotaAsc(12L)).thenReturn(List.of(cuota1, cuota2, cuota3));
        when(pagoRepository.save(org.mockito.ArgumentMatchers.any(Pago.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RegistroPagoRequest request = new RegistroPagoRequest(12L, LocalDate.of(2026, 4, 16), new BigDecimal("180.00"), null, null);

        pagoService.registrar(request);

        assertEquals(new BigDecimal("100.00"), cuota1.getMontoPagado());
        assertEquals(EstadoCuota.PAGADA, cuota1.getEstado());
        assertEquals(new BigDecimal("80.00"), cuota2.getMontoPagado());
        assertEquals(EstadoCuota.PAGADA, cuota2.getEstado());
        assertEquals(new BigDecimal("0.00"), cuota3.getMontoPagado());
        assertEquals(EstadoCuota.PENDIENTE, cuota3.getEstado());

        ArgumentCaptor<List<ImputacionPago>> captorImputaciones = ArgumentCaptor.forClass(List.class);
        verify(imputacionPagoRepository).saveAll(captorImputaciones.capture());
        assertEquals(2, captorImputaciones.getValue().size());
    }

    @Test
    void registrar_pagoAdelantado_deberiaImputarSobreCuotasFuturasEnOrden() {
        Prestamo prestamo = crearPrestamo(13L);
        Cuota cuota1 = crearCuota(prestamo, 1, "100.00", "100.00", EstadoCuota.PAGADA);
        Cuota cuota2 = crearCuota(prestamo, 2, "90.00", "40.00", EstadoCuota.PARCIAL);
        Cuota cuota3 = crearCuota(prestamo, 3, "120.00", "0.00", EstadoCuota.PENDIENTE);

        when(prestamoRepository.findById(13L)).thenReturn(Optional.of(prestamo));
        when(cuotaRepository.findByPrestamoIdOrderByNumeroCuotaAsc(13L)).thenReturn(List.of(cuota1, cuota2, cuota3));
        when(pagoRepository.save(org.mockito.ArgumentMatchers.any(Pago.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RegistroPagoRequest request = new RegistroPagoRequest(13L, LocalDate.of(2026, 4, 16), new BigDecimal("140.00"), null, null);

        pagoService.registrar(request);

        assertEquals(new BigDecimal("100.00"), cuota1.getMontoPagado());
        assertEquals(EstadoCuota.PAGADA, cuota1.getEstado());
        assertEquals(new BigDecimal("90.00"), cuota2.getMontoPagado());
        assertEquals(EstadoCuota.PAGADA, cuota2.getEstado());
        assertEquals(new BigDecimal("90.00"), cuota3.getMontoPagado());
        assertEquals(EstadoCuota.PARCIAL, cuota3.getEstado());

        ArgumentCaptor<List<ImputacionPago>> captorImputaciones = ArgumentCaptor.forClass(List.class);
        verify(imputacionPagoRepository).saveAll(captorImputaciones.capture());
        assertEquals(2, captorImputaciones.getValue().size());
        assertEquals(2, captorImputaciones.getValue().get(0).getCuota().getNumeroCuota());
        assertEquals(3, captorImputaciones.getValue().get(1).getCuota().getNumeroCuota());
    }

    @Test
    void registrar_cuandoPrestamoNoTieneCuotas_deberiaRetornar400() {
        Prestamo prestamo = crearPrestamo(14L);
        when(prestamoRepository.findById(14L)).thenReturn(Optional.of(prestamo));
        when(cuotaRepository.findByPrestamoIdOrderByNumeroCuotaAsc(14L)).thenReturn(List.of());

        RegistroPagoRequest request = new RegistroPagoRequest(14L, LocalDate.of(2026, 4, 16), new BigDecimal("30.00"), null, null);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> pagoService.registrar(request));

        assertEquals(400, exception.getStatusCode().value());
    }

    @Test
    void registrar_cuandoMontoExcedeTotalPendiente_deberiaRetornar400() {
        Prestamo prestamo = crearPrestamo(15L);
        Cuota cuota1 = crearCuota(prestamo, 1, "100.00", "20.00", EstadoCuota.PARCIAL);
        Cuota cuota2 = crearCuota(prestamo, 2, "100.00", "80.00", EstadoCuota.PARCIAL);

        when(prestamoRepository.findById(15L)).thenReturn(Optional.of(prestamo));
        when(cuotaRepository.findByPrestamoIdOrderByNumeroCuotaAsc(15L)).thenReturn(List.of(cuota1, cuota2));

        RegistroPagoRequest request = new RegistroPagoRequest(15L, LocalDate.of(2026, 4, 16), new BigDecimal("150.00"), null, null);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> pagoService.registrar(request));

        assertEquals(400, exception.getStatusCode().value());
    }

    @Test
    void registrar_cuandoPrestamoNoExiste_deberiaRetornar404() {
        when(prestamoRepository.findById(99L)).thenReturn(Optional.empty());

        RegistroPagoRequest request = new RegistroPagoRequest(99L, LocalDate.of(2026, 4, 16), new BigDecimal("200.00"), null, null);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> pagoService.registrar(request));

        assertEquals(404, exception.getStatusCode().value());
    }

    @Test
    void registrar_conMontoInvalido_deberiaRetornar400() {
        Prestamo prestamo = crearPrestamo(16L);
        when(prestamoRepository.findById(16L)).thenReturn(Optional.of(prestamo));

        RegistroPagoRequest request = new RegistroPagoRequest(16L, LocalDate.of(2026, 4, 16), BigDecimal.ZERO, null, null);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> pagoService.registrar(request));

        assertEquals(400, exception.getStatusCode().value());
    }

    @Test
    void listarPorPrestamo_deberiaRetornarPagos() {
        Prestamo prestamo = crearPrestamo(17L);
        when(prestamoRepository.findById(17L)).thenReturn(Optional.of(prestamo));

        Pago pago = new Pago();
        pago.setPrestamo(prestamo);
        pago.setFechaPago(LocalDate.of(2026, 4, 15));
        pago.setMonto(new BigDecimal("100.00"));
        pago.setEstado(EstadoPago.REGISTRADO);

        when(pagoRepository.findByPrestamoIdOrderByFechaPagoDescIdDesc(17L)).thenReturn(List.of(pago));

        List<PagoResponse> pagos = pagoService.listarPorPrestamo(17L);

        assertEquals(1, pagos.size());
        assertEquals(new BigDecimal("100.00"), pagos.get(0).monto());
    }

    private Prestamo crearPrestamo(Long id) {
        Prestamo prestamo = new Prestamo();
        Persona persona = new Persona();
        persona.setNombre("Persona test");
        prestamo.setPersona(persona);
        prestamo.setMontoInicial(new BigDecimal("1000.00"));
        return prestamo;
    }

    private Cuota crearCuota(
        Prestamo prestamo,
        Integer numeroCuota,
        String montoProgramado,
        String montoPagado,
        EstadoCuota estado
    ) {
        Cuota cuota = new Cuota();
        cuota.setPrestamo(prestamo);
        cuota.setNumeroCuota(numeroCuota);
        cuota.setMontoProgramado(new BigDecimal(montoProgramado));
        cuota.setMontoPagado(new BigDecimal(montoPagado));
        cuota.setEstado(estado);
        return cuota;
    }
}
