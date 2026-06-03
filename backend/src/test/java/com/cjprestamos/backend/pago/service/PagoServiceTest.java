package com.cjprestamos.backend.pago.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.cjprestamos.backend.common.time.FechaOperativaService;
import com.cjprestamos.backend.common.time.RelojSistema;
import com.cjprestamos.backend.cuota.model.Cuota;
import com.cjprestamos.backend.cuota.model.enums.EstadoCuota;
import com.cjprestamos.backend.cuota.repository.CuotaRepository;
import com.cjprestamos.backend.evento.service.EventoPrestamoService;
import com.cjprestamos.backend.pago.dto.PagoResponse;
import com.cjprestamos.backend.pago.dto.RegistroPagoRequest;
import com.cjprestamos.backend.pago.model.ImputacionPago;
import com.cjprestamos.backend.pago.model.Pago;
import com.cjprestamos.backend.pago.model.enums.EstadoPago;
import com.cjprestamos.backend.pago.repository.ImputacionPagoRepository;
import com.cjprestamos.backend.pago.repository.PagoRepository;
import com.cjprestamos.backend.persona.model.Persona;
import com.cjprestamos.backend.prestamo.model.Prestamo;
import com.cjprestamos.backend.prestamo.model.enums.EstadoPrestamo;
import com.cjprestamos.backend.prestamo.repository.PrestamoRepository;
import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
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

    private static final LocalDateTime AHORA_OPERATIVO = LocalDateTime.of(2026, 4, 16, 10, 30);

    @Mock
    private PagoRepository pagoRepository;

    @Mock
    private PrestamoRepository prestamoRepository;

    @Mock
    private CuotaRepository cuotaRepository;

    @Mock
    private ImputacionPagoRepository imputacionPagoRepository;

    @Mock
    private EventoPrestamoService eventoPrestamoService;

    private PagoService pagoService;
    private FechaOperativaService fechaOperativaService;

    @BeforeEach
    void setUp() {
        Clock clock = Clock.fixed(AHORA_OPERATIVO.atZone(RelojSistema.ZONA_OPERATIVA).toInstant(), RelojSistema.ZONA_OPERATIVA);
        fechaOperativaService = new FechaOperativaService(clock);
        pagoService = new PagoService(
                pagoRepository,
                prestamoRepository,
                cuotaRepository,
                imputacionPagoRepository,
                eventoPrestamoService,
                fechaOperativaService
        );
    }

    @Test
    void registrar_pagoExactoSobreUnicaCuota_deberiaDejarCuotaPagadaYFinalizarPrestamo() {
        Prestamo prestamo = crearPrestamo(10L);
        Cuota cuota1 = crearCuota(prestamo, 1, "100.00", "0.00", EstadoCuota.PENDIENTE);

        when(prestamoRepository.findById(10L)).thenReturn(Optional.of(prestamo));
        when(cuotaRepository.findByPrestamoIdOrderByNumeroCuotaAsc(10L)).thenReturn(List.of(cuota1));
        when(pagoRepository.save(org.mockito.ArgumentMatchers.any(Pago.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        RegistroPagoRequest request = new RegistroPagoRequest(
                10L,
                LocalDate.of(2026, 4, 16),
                new BigDecimal("100.00"),
                null,
                null,
                null
        );

        PagoResponse response = pagoService.registrar(request, null);

        assertEquals(EstadoPago.REGISTRADO, response.estado());
        assertEquals(10L, response.prestamoId());
        assertEquals(new BigDecimal("100.00"), cuota1.getMontoPagado());
        assertEquals(EstadoCuota.PAGADA, cuota1.getEstado());
        assertEquals(EstadoPrestamo.FINALIZADO, prestamo.getEstado());

        ArgumentCaptor<List<ImputacionPago>> captorImputaciones = ArgumentCaptor.forClass(List.class);
        verify(imputacionPagoRepository).saveAll(captorImputaciones.capture());

        assertEquals(1, captorImputaciones.getValue().size());
        assertEquals(new BigDecimal("100.00"), captorImputaciones.getValue().get(0).getMontoImputado());

        verify(cuotaRepository).saveAll(List.of(cuota1));
        verify(eventoPrestamoService).registrarPago(
                org.mockito.ArgumentMatchers.eq(prestamo),
                org.mockito.ArgumentMatchers.any(Pago.class),
                org.mockito.ArgumentMatchers.eq(new BigDecimal("100.00"))
        );
    }

    @Test
    void registrar_pagoParcial_deberiaDejarCuotaParcialYMantenerPrestamoActivo() {
        Prestamo prestamo = crearPrestamo(11L);
        Cuota cuota1 = crearCuota(prestamo, 1, "150.00", "0.00", EstadoCuota.PENDIENTE);

        when(prestamoRepository.findById(11L)).thenReturn(Optional.of(prestamo));
        when(cuotaRepository.findByPrestamoIdOrderByNumeroCuotaAsc(11L)).thenReturn(List.of(cuota1));
        when(pagoRepository.save(org.mockito.ArgumentMatchers.any(Pago.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        RegistroPagoRequest request = new RegistroPagoRequest(
                11L,
                LocalDate.of(2026, 4, 16),
                new BigDecimal("50.00"),
                null,
                null,
                null
        );

        pagoService.registrar(request, null);

        assertEquals(new BigDecimal("50.00"), cuota1.getMontoPagado());
        assertEquals(EstadoCuota.PARCIAL, cuota1.getEstado());
        assertEquals(EstadoPrestamo.ACTIVO, prestamo.getEstado());

        ArgumentCaptor<List<ImputacionPago>> captorImputaciones = ArgumentCaptor.forClass(List.class);
        verify(imputacionPagoRepository).saveAll(captorImputaciones.capture());

        assertEquals(1, captorImputaciones.getValue().size());
        assertEquals(new BigDecimal("50.00"), captorImputaciones.getValue().get(0).getMontoImputado());
    }

    @Test
    void registrar_pagoMultiple_deberiaCubrirVariasCuotasYMantenerActivoSiQuedanPendientes() {
        Prestamo prestamo = crearPrestamo(12L);
        Cuota cuota1 = crearCuota(prestamo, 1, "100.00", "0.00", EstadoCuota.PENDIENTE);
        Cuota cuota2 = crearCuota(prestamo, 2, "80.00", "0.00", EstadoCuota.PENDIENTE);
        Cuota cuota3 = crearCuota(prestamo, 3, "70.00", "0.00", EstadoCuota.PENDIENTE);

        when(prestamoRepository.findById(12L)).thenReturn(Optional.of(prestamo));
        when(cuotaRepository.findByPrestamoIdOrderByNumeroCuotaAsc(12L))
                .thenReturn(List.of(cuota1, cuota2, cuota3));
        when(pagoRepository.save(org.mockito.ArgumentMatchers.any(Pago.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        RegistroPagoRequest request = new RegistroPagoRequest(
                12L,
                LocalDate.of(2026, 4, 16),
                new BigDecimal("180.00"),
                null,
                null,
                null
        );

        pagoService.registrar(request, null);

        assertEquals(new BigDecimal("100.00"), cuota1.getMontoPagado());
        assertEquals(EstadoCuota.PAGADA, cuota1.getEstado());

        assertEquals(new BigDecimal("80.00"), cuota2.getMontoPagado());
        assertEquals(EstadoCuota.PAGADA, cuota2.getEstado());

        assertEquals(new BigDecimal("0.00"), cuota3.getMontoPagado());
        assertEquals(EstadoCuota.PENDIENTE, cuota3.getEstado());

        assertEquals(EstadoPrestamo.ACTIVO, prestamo.getEstado());

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
        when(cuotaRepository.findByPrestamoIdOrderByNumeroCuotaAsc(13L))
                .thenReturn(List.of(cuota1, cuota2, cuota3));
        when(pagoRepository.save(org.mockito.ArgumentMatchers.any(Pago.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        RegistroPagoRequest request = new RegistroPagoRequest(
                13L,
                LocalDate.of(2026, 4, 16),
                new BigDecimal("140.00"),
                null,
                null,
                null
        );

        pagoService.registrar(request, null);

        assertEquals(new BigDecimal("100.00"), cuota1.getMontoPagado());
        assertEquals(EstadoCuota.PAGADA, cuota1.getEstado());

        assertEquals(new BigDecimal("90.00"), cuota2.getMontoPagado());
        assertEquals(EstadoCuota.PAGADA, cuota2.getEstado());

        assertEquals(new BigDecimal("90.00"), cuota3.getMontoPagado());
        assertEquals(EstadoCuota.PARCIAL, cuota3.getEstado());

        assertEquals(EstadoPrestamo.ACTIVO, prestamo.getEstado());

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

        RegistroPagoRequest request = new RegistroPagoRequest(
                14L,
                LocalDate.of(2026, 4, 16),
                new BigDecimal("30.00"),
                null,
                null,
                null
        );

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> pagoService.registrar(request, null)
        );

        assertEquals(400, exception.getStatusCode().value());
    }

    @Test
    void registrar_cuandoMontoExcedeTotalPendiente_deberiaRetornar400() {
        Prestamo prestamo = crearPrestamo(15L);
        Cuota cuota1 = crearCuota(prestamo, 1, "100.00", "20.00", EstadoCuota.PARCIAL);
        Cuota cuota2 = crearCuota(prestamo, 2, "100.00", "80.00", EstadoCuota.PARCIAL);

        when(prestamoRepository.findById(15L)).thenReturn(Optional.of(prestamo));
        when(cuotaRepository.findByPrestamoIdOrderByNumeroCuotaAsc(15L)).thenReturn(List.of(cuota1, cuota2));

        RegistroPagoRequest request = new RegistroPagoRequest(
                15L,
                LocalDate.of(2026, 4, 16),
                new BigDecimal("150.00"),
                null,
                null,
                null
        );

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> pagoService.registrar(request, null)
        );

        assertEquals(400, exception.getStatusCode().value());
    }

    @Test
    void registrar_cuandoPrestamoNoExiste_deberiaRetornar404() {
        when(prestamoRepository.findById(99L)).thenReturn(Optional.empty());

        RegistroPagoRequest request = new RegistroPagoRequest(
                99L,
                LocalDate.of(2026, 4, 16),
                new BigDecimal("200.00"),
                null,
                null,
                null
        );

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> pagoService.registrar(request, null)
        );

        assertEquals(404, exception.getStatusCode().value());
    }

    @Test
    void registrar_conMontoInvalido_deberiaRetornar400() {
        Prestamo prestamo = crearPrestamo(16L);

        when(prestamoRepository.findById(16L)).thenReturn(Optional.of(prestamo));

        RegistroPagoRequest request = new RegistroPagoRequest(
                16L,
                LocalDate.of(2026, 4, 16),
                BigDecimal.ZERO,
                null,
                null,
                null
        );

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> pagoService.registrar(request, null)
        );

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

    @Test
    void registrar_prestamoCancelado_deberiaRetornar400SinPersistirNiImputar() {
        Prestamo prestamo = crearPrestamo(18L);
        prestamo.setEstado(EstadoPrestamo.CANCELADO);

        when(prestamoRepository.findById(18L)).thenReturn(Optional.of(prestamo));

        RegistroPagoRequest request = new RegistroPagoRequest(
                18L,
                LocalDate.of(2026, 4, 16),
                new BigDecimal("100.00"),
                null,
                null,
                null
        );

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> pagoService.registrar(request, null)
        );

        assertEquals(400, exception.getStatusCode().value());
        assertEquals(EstadoPrestamo.CANCELADO, prestamo.getEstado());

        verify(pagoRepository, never()).save(org.mockito.ArgumentMatchers.any(Pago.class));
        verify(cuotaRepository, never()).findByPrestamoIdOrderByNumeroCuotaAsc(18L);
        verify(cuotaRepository, never()).saveAll(org.mockito.ArgumentMatchers.anyList());
        verify(imputacionPagoRepository, never()).saveAll(org.mockito.ArgumentMatchers.anyList());
        verify(eventoPrestamoService, never()).registrarPago(
                org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.any()
        );
    }

    @Test
    void registrar_conCuotasSeleccionadas_deberiaImputarSoloEnLasIndicadas() {
        Prestamo prestamo = crearPrestamo(19L);
        Cuota cuota1 = crearCuota(prestamo, 1, "100.00", "0.00", EstadoCuota.PENDIENTE);
        Cuota cuota2 = crearCuota(prestamo, 2, "100.00", "0.00", EstadoCuota.PENDIENTE);

        when(prestamoRepository.findById(19L)).thenReturn(Optional.of(prestamo));
        when(cuotaRepository.findByPrestamoIdAndIdIn(
                org.mockito.ArgumentMatchers.eq(19L),
                org.mockito.ArgumentMatchers.anyCollection()
        )).thenReturn(List.of(cuota2));
        when(cuotaRepository.findByPrestamoIdOrderByNumeroCuotaAsc(19L))
                .thenReturn(List.of(cuota1, cuota2));
        when(pagoRepository.save(org.mockito.ArgumentMatchers.any(Pago.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        RegistroPagoRequest request = new RegistroPagoRequest(
                19L,
                LocalDate.of(2026, 4, 16),
                new BigDecimal("60.00"),
                null,
                null,
                List.of(102L)
        );

        pagoService.registrar(request, null);

        assertEquals(new BigDecimal("0.00"), cuota1.getMontoPagado());
        assertEquals(EstadoCuota.PENDIENTE, cuota1.getEstado());

        assertEquals(new BigDecimal("60.00"), cuota2.getMontoPagado());
        assertEquals(EstadoCuota.PARCIAL, cuota2.getEstado());

        assertEquals(EstadoPrestamo.ACTIVO, prestamo.getEstado());

        verify(cuotaRepository).findByPrestamoIdOrderByNumeroCuotaAsc(19L);
    }

    @Test
    void registrar_conCuotaSeleccionadaPagadaPeroOtrasPendientes_noDebeFinalizarPrestamo() {
        Prestamo prestamo = crearPrestamo(21L);
        Cuota cuota1 = crearCuota(prestamo, 1, "100.00", "0.00", EstadoCuota.PENDIENTE);
        Cuota cuota2 = crearCuota(prestamo, 2, "100.00", "0.00", EstadoCuota.PENDIENTE);
        Cuota cuota3 = crearCuota(prestamo, 3, "100.00", "0.00", EstadoCuota.PENDIENTE);

        when(prestamoRepository.findById(21L)).thenReturn(Optional.of(prestamo));
        when(cuotaRepository.findByPrestamoIdAndIdIn(
                org.mockito.ArgumentMatchers.eq(21L),
                org.mockito.ArgumentMatchers.anyCollection()
        )).thenReturn(List.of(cuota1));
        when(cuotaRepository.findByPrestamoIdOrderByNumeroCuotaAsc(21L))
                .thenReturn(List.of(cuota1, cuota2, cuota3));
        when(pagoRepository.save(org.mockito.ArgumentMatchers.any(Pago.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        RegistroPagoRequest request = new RegistroPagoRequest(
                21L,
                LocalDate.of(2026, 5, 1),
                new BigDecimal("100.00"),
                null,
                null,
                List.of(101L)
        );

        pagoService.registrar(request, null);

        assertEquals(new BigDecimal("100.00"), cuota1.getMontoPagado());
        assertEquals(EstadoCuota.PAGADA, cuota1.getEstado());

        assertEquals(new BigDecimal("0.00"), cuota2.getMontoPagado());
        assertEquals(EstadoCuota.PENDIENTE, cuota2.getEstado());

        assertEquals(new BigDecimal("0.00"), cuota3.getMontoPagado());
        assertEquals(EstadoCuota.PENDIENTE, cuota3.getEstado());

        assertEquals(EstadoPrestamo.ACTIVO, prestamo.getEstado());
    }

    @Test
    void registrar_conCuotasSeleccionadasYDeudaTotalSaldada_deberiaFinalizarPrestamo() {
        Prestamo prestamo = crearPrestamo(22L);
        Cuota cuota1 = crearCuota(prestamo, 1, "100.00", "100.00", EstadoCuota.PAGADA);
        Cuota cuota2 = crearCuota(prestamo, 2, "100.00", "0.00", EstadoCuota.PENDIENTE);

        when(prestamoRepository.findById(22L)).thenReturn(Optional.of(prestamo));
        when(cuotaRepository.findByPrestamoIdAndIdIn(
                org.mockito.ArgumentMatchers.eq(22L),
                org.mockito.ArgumentMatchers.anyCollection()
        )).thenReturn(List.of(cuota2));
        when(cuotaRepository.findByPrestamoIdOrderByNumeroCuotaAsc(22L))
                .thenReturn(List.of(cuota1, cuota2));
        when(pagoRepository.save(org.mockito.ArgumentMatchers.any(Pago.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        RegistroPagoRequest request = new RegistroPagoRequest(
                22L,
                LocalDate.of(2026, 5, 1),
                new BigDecimal("100.00"),
                null,
                null,
                List.of(202L)
        );

        pagoService.registrar(request, null);

        assertEquals(new BigDecimal("100.00"), cuota1.getMontoPagado());
        assertEquals(EstadoCuota.PAGADA, cuota1.getEstado());

        assertEquals(new BigDecimal("100.00"), cuota2.getMontoPagado());
        assertEquals(EstadoCuota.PAGADA, cuota2.getEstado());

        assertEquals(EstadoPrestamo.FINALIZADO, prestamo.getEstado());
    }

    @Test
    void registrar_conCuotasSeleccionadasDeOtroPrestamo_deberiaRetornar400() {
        Prestamo prestamo = crearPrestamo(20L);

        when(prestamoRepository.findById(20L)).thenReturn(Optional.of(prestamo));
        when(cuotaRepository.findByPrestamoIdAndIdIn(
                org.mockito.ArgumentMatchers.eq(20L),
                org.mockito.ArgumentMatchers.anyCollection()
        )).thenReturn(List.of());

        RegistroPagoRequest request = new RegistroPagoRequest(
                20L,
                LocalDate.of(2026, 4, 16),
                new BigDecimal("50.00"),
                null,
                null,
                List.of(999L)
        );

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> pagoService.registrar(request, null)
        );

        assertEquals(400, exception.getStatusCode().value());
    }

    @Test
    void registrar_prestamoRenegociadoConDeudaSaldada_deberiaFinalizarPrestamo() {
        Prestamo prestamo = crearPrestamo(23L);
        prestamo.setEstado(EstadoPrestamo.RENEGOCIADO);

        Cuota cuota1 = crearCuota(prestamo, 1, "100.00", "0.00", EstadoCuota.PENDIENTE);

        when(prestamoRepository.findById(23L)).thenReturn(Optional.of(prestamo));
        when(cuotaRepository.findByPrestamoIdOrderByNumeroCuotaAsc(23L)).thenReturn(List.of(cuota1));
        when(pagoRepository.save(org.mockito.ArgumentMatchers.any(Pago.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        RegistroPagoRequest request = new RegistroPagoRequest(
                23L,
                LocalDate.of(2026, 5, 1),
                new BigDecimal("100.00"),
                null,
                null,
                null
        );

        pagoService.registrar(request, null);

        assertEquals(EstadoCuota.PAGADA, cuota1.getEstado());
        assertEquals(EstadoPrestamo.FINALIZADO, prestamo.getEstado());
    }

    @Test
    void registrar_conMismaIdempotencyKey_noDebeDuplicarImputaciones() {
        Prestamo prestamo = crearPrestamo(24L);
        Cuota cuota1 = crearCuota(prestamo, 1, "100.00", "0.00", EstadoCuota.PENDIENTE);
        RegistroPagoRequest request = new RegistroPagoRequest(24L, LocalDate.of(2026, 5, 3), new BigDecimal("100.00"), null, null, null);

        when(prestamoRepository.findById(24L)).thenReturn(Optional.of(prestamo));
        when(cuotaRepository.findByPrestamoIdOrderByNumeroCuotaAsc(24L)).thenReturn(List.of(cuota1));
        Pago existente = new Pago();
        existente.setPrestamo(prestamo);
        existente.setFechaPago(LocalDate.of(2026, 5, 3));
        existente.setMonto(new BigDecimal("100.00"));
        existente.setEstado(EstadoPago.REGISTRADO);
        when(pagoRepository.findByPrestamoIdAndIdempotencyKey(24L, "k-1")).thenReturn(Optional.empty(), Optional.of(existente));
        when(pagoRepository.save(org.mockito.ArgumentMatchers.any(Pago.class))).thenAnswer(invocation -> invocation.getArgument(0));

        pagoService.registrar(request, "k-1");
        pagoService.registrar(request, "k-1");

        verify(imputacionPagoRepository, times(1)).saveAll(org.mockito.ArgumentMatchers.anyList());
    }

    @Test
    void registrar_pagoConFechaPasada_deberiaSepararFechaDeNegocioYRegistroSistema() {
        Prestamo prestamo = crearPrestamo(25L);
        Cuota cuota = crearCuota(prestamo, 1, "100.00", "0.00", EstadoCuota.PENDIENTE);

        when(prestamoRepository.findById(25L)).thenReturn(Optional.of(prestamo));
        when(cuotaRepository.findByPrestamoIdOrderByNumeroCuotaAsc(25L)).thenReturn(List.of(cuota));
        when(pagoRepository.save(org.mockito.ArgumentMatchers.any(Pago.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        RegistroPagoRequest request = new RegistroPagoRequest(
                25L,
                LocalDate.of(2026, 4, 10),
                new BigDecimal("100.00"),
                null,
                null,
                null
        );

        PagoResponse response = pagoService.registrar(request, null);

        ArgumentCaptor<Pago> captorPago = ArgumentCaptor.forClass(Pago.class);
        verify(pagoRepository).save(captorPago.capture());

        Pago pagoGuardado = captorPago.getValue();
        assertEquals(LocalDate.of(2026, 4, 10), pagoGuardado.getFechaPago());
        assertEquals(LocalDate.of(2026, 4, 10), pagoGuardado.getFechaEfectivaCobro());
        assertEquals(LocalDate.of(2026, 4, 10), pagoGuardado.getFechaContable());
        assertEquals(AHORA_OPERATIVO, pagoGuardado.getRegistradoEn());
        assertEquals(AHORA_OPERATIVO, response.registradoEn());

        ArgumentCaptor<List<ImputacionPago>> captorImputaciones = ArgumentCaptor.forClass(List.class);
        verify(imputacionPagoRepository).saveAll(captorImputaciones.capture());
        ImputacionPago imputacion = captorImputaciones.getValue().getFirst();
        assertEquals(LocalDate.of(2026, 4, 10), imputacion.getFechaImputacion());
        assertEquals(AHORA_OPERATIVO, imputacion.getRegistradoEn());
    }

    @Test
    void registrar_pagoConFechaActual_deberiaUsarHoyOperativoComoFechaContable() {
        Prestamo prestamo = crearPrestamo(27L);
        Cuota cuota = crearCuota(prestamo, 1, "100.00", "0.00", EstadoCuota.PENDIENTE);

        when(prestamoRepository.findById(27L)).thenReturn(Optional.of(prestamo));
        when(cuotaRepository.findByPrestamoIdOrderByNumeroCuotaAsc(27L)).thenReturn(List.of(cuota));
        when(pagoRepository.save(org.mockito.ArgumentMatchers.any(Pago.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        RegistroPagoRequest request = new RegistroPagoRequest(
                27L,
                fechaOperativaService.hoy(),
                new BigDecimal("100.00"),
                null,
                null,
                null
        );

        PagoResponse response = pagoService.registrar(request, null);

        assertEquals(LocalDate.of(2026, 4, 16), response.fechaPago());
        assertEquals(LocalDate.of(2026, 4, 16), response.fechaEfectivaCobro());
        assertEquals(LocalDate.of(2026, 4, 16), response.fechaContable());
        assertEquals(AHORA_OPERATIVO, response.registradoEn());
    }

    @Test
    void anular_pagoRegistrado_deberiaRevertirCuotaYRegistrarFechaDeAnulacion() {
        Prestamo prestamo = crearPrestamo(26L);
        Cuota cuota = crearCuota(prestamo, 1, "100.00", "100.00", EstadoCuota.PAGADA);
        Pago pago = crearPago(prestamo, 501L, LocalDate.of(2026, 4, 10), "100.00", EstadoPago.REGISTRADO);
        ImputacionPago imputacion = new ImputacionPago();
        imputacion.setPago(pago);
        imputacion.setCuota(cuota);
        imputacion.setMontoImputado(new BigDecimal("100.00"));
        imputacion.setFechaImputacion(LocalDate.of(2026, 4, 10));

        when(prestamoRepository.findById(26L)).thenReturn(Optional.of(prestamo));
        when(pagoRepository.findByIdAndPrestamoId(501L, 26L)).thenReturn(Optional.of(pago));
        when(imputacionPagoRepository.findByPagoId(501L)).thenReturn(List.of(imputacion));
        when(cuotaRepository.findByPrestamoIdOrderByNumeroCuotaAsc(26L)).thenReturn(List.of(cuota));

        PagoResponse response = pagoService.anular(26L, 501L);

        assertEquals(EstadoPago.ANULADO, pago.getEstado());
        assertEquals(AHORA_OPERATIVO, pago.getAnuladoEn());
        assertEquals("Sin motivo informado", pago.getMotivoAnulacion());
        assertEquals(AHORA_OPERATIVO, response.anuladoEn());
        assertEquals(new BigDecimal("0.00"), cuota.getMontoPagado());
        assertEquals(EstadoCuota.PENDIENTE, cuota.getEstado());

        verify(imputacionPagoRepository).deleteAll(List.of(imputacion));
        verify(eventoPrestamoService).registrarAnulacionPago(prestamo, pago);
    }

    private Prestamo crearPrestamo(Long id) {
        Prestamo prestamo = new Prestamo();

        setId(prestamo, id);

        Persona persona = new Persona();
        persona.setNombre("Persona test");

        prestamo.setPersona(persona);
        prestamo.setMontoInicial(new BigDecimal("1000.00"));
        prestamo.setEstado(EstadoPrestamo.ACTIVO);

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

    private Pago crearPago(Prestamo prestamo, Long id, LocalDate fechaPago, String monto, EstadoPago estado) {
        Pago pago = new Pago();
        setId(pago, id);
        pago.setPrestamo(prestamo);
        pago.setFechaPago(fechaPago);
        pago.setMonto(new BigDecimal(monto));
        pago.setEstado(estado);
        return pago;
    }

    private void setId(Prestamo prestamo, Long id) {
        try {
            Field field = Prestamo.class.getDeclaredField("id");
            field.setAccessible(true);
            field.set(prestamo, id);
        } catch (ReflectiveOperationException e) {
            throw new IllegalStateException("No se pudo setear el id del préstamo en el test", e);
        }
    }

    private void setId(Pago pago, Long id) {
        try {
            Field field = Pago.class.getDeclaredField("id");
            field.setAccessible(true);
            field.set(pago, id);
        } catch (ReflectiveOperationException e) {
            throw new IllegalStateException("No se pudo setear el id del pago en el test", e);
        }
    }
}
