package com.cjprestamos.backend.cuota.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.cjprestamos.backend.cuota.dto.CuotaManualRequest;
import com.cjprestamos.backend.cuota.dto.CuotaResponse;
import com.cjprestamos.backend.cuota.dto.GenerarCuotasRequest;
import com.cjprestamos.backend.cuota.model.Cuota;
import com.cjprestamos.backend.cuota.model.enums.EstadoCuota;
import com.cjprestamos.backend.cuota.repository.CuotaRepository;
import com.cjprestamos.backend.persona.model.Persona;
import com.cjprestamos.backend.prestamo.dto.CalculoPrestamoResultado;
import com.cjprestamos.backend.prestamo.model.Prestamo;
import com.cjprestamos.backend.prestamo.model.enums.FrecuenciaTipo;
import com.cjprestamos.backend.prestamo.repository.PrestamoRepository;
import com.cjprestamos.backend.prestamo.service.CalculadoraPrestamoService;
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
class CuotaServiceTest {

    @Mock
    private CuotaRepository cuotaRepository;

    @Mock
    private PrestamoRepository prestamoRepository;

    @Mock
    private CalculadoraPrestamoService calculadoraPrestamoService;

    private CuotaService cuotaService;

    @BeforeEach
    void setUp() {
        cuotaService = new CuotaService(cuotaRepository, prestamoRepository, calculadoraPrestamoService);
    }

    @Test
    void generar_deberiaGenerarCuotasMensualesConCierreExacto() {
        Prestamo prestamo = crearPrestamoBase(FrecuenciaTipo.MENSUAL, LocalDate.of(2026, 4, 20), null, 3);
        when(prestamoRepository.findById(1L)).thenReturn(Optional.of(prestamo));
        when(cuotaRepository.existsByPrestamoId(1L)).thenReturn(false);
        when(calculadoraPrestamoService.calcular(org.mockito.ArgumentMatchers.any())).thenReturn(
            new CalculoPrestamoResultado(
                new BigDecimal("0.01"),
                new BigDecimal("1000.01"),
                new BigDecimal("333.34"),
                new BigDecimal("1000.00"),
                new BigDecimal("0.01"),
                new BigDecimal("0.01")
            )
        );
        when(cuotaRepository.saveAll(org.mockito.ArgumentMatchers.anyList())).thenAnswer(invocation -> invocation.getArgument(0));

        List<CuotaResponse> response = cuotaService.generar(1L, null);

        assertEquals(3, response.size());
        assertEquals(new BigDecimal("333.34"), response.get(0).montoProgramado());
        assertEquals(new BigDecimal("333.34"), response.get(1).montoProgramado());
        assertEquals(new BigDecimal("333.33"), response.get(2).montoProgramado());
        assertEquals(LocalDate.of(2026, 4, 20), response.get(0).fechaVencimiento());
        assertEquals(LocalDate.of(2026, 5, 20), response.get(1).fechaVencimiento());
        assertEquals(LocalDate.of(2026, 6, 20), response.get(2).fechaVencimiento());

        BigDecimal suma = response.stream().map(CuotaResponse::montoProgramado).reduce(BigDecimal.ZERO, BigDecimal::add);
        assertEquals(new BigDecimal("1000.01"), suma);
    }

    @Test
    void generar_deberiaGenerarCuotasCadaXDias() {
        Prestamo prestamo = crearPrestamoBase(FrecuenciaTipo.CADA_X_DIAS, LocalDate.of(2026, 4, 10), 10, 3);
        when(prestamoRepository.findById(2L)).thenReturn(Optional.of(prestamo));
        when(cuotaRepository.existsByPrestamoId(2L)).thenReturn(false);
        when(calculadoraPrestamoService.calcular(org.mockito.ArgumentMatchers.any())).thenReturn(
            new CalculoPrestamoResultado(
                new BigDecimal("200.00"),
                new BigDecimal("1200.00"),
                new BigDecimal("400.00"),
                new BigDecimal("1000.00"),
                new BigDecimal("200.00"),
                new BigDecimal("200.00")
            )
        );
        when(cuotaRepository.saveAll(org.mockito.ArgumentMatchers.anyList())).thenAnswer(invocation -> invocation.getArgument(0));

        List<CuotaResponse> response = cuotaService.generar(2L, null);

        assertEquals(LocalDate.of(2026, 4, 10), response.get(0).fechaVencimiento());
        assertEquals(LocalDate.of(2026, 4, 20), response.get(1).fechaVencimiento());
        assertEquals(LocalDate.of(2026, 4, 30), response.get(2).fechaVencimiento());
    }

    @Test
    void generar_deberiaAceptarCuotasManualesValidas() {
        Prestamo prestamo = crearPrestamoBase(FrecuenciaTipo.FECHAS_MANUALES, null, null, 2);
        when(prestamoRepository.findById(3L)).thenReturn(Optional.of(prestamo));
        when(cuotaRepository.existsByPrestamoId(3L)).thenReturn(false);
        when(calculadoraPrestamoService.calcular(org.mockito.ArgumentMatchers.any())).thenReturn(
            new CalculoPrestamoResultado(
                new BigDecimal("100.00"),
                new BigDecimal("1100.00"),
                new BigDecimal("550.00"),
                new BigDecimal("1000.00"),
                new BigDecimal("100.00"),
                new BigDecimal("100.00")
            )
        );
        when(cuotaRepository.saveAll(org.mockito.ArgumentMatchers.anyList())).thenAnswer(invocation -> invocation.getArgument(0));

        GenerarCuotasRequest request = new GenerarCuotasRequest(List.of(
            new CuotaManualRequest(2, LocalDate.of(2026, 6, 1), new BigDecimal("550.00")),
            new CuotaManualRequest(1, LocalDate.of(2026, 5, 1), new BigDecimal("550.00"))
        ));

        List<CuotaResponse> response = cuotaService.generar(3L, request);

        assertEquals(2, response.size());
        assertEquals(1, response.get(0).numeroCuota());
        assertEquals(2, response.get(1).numeroCuota());
        assertEquals(EstadoCuota.PENDIENTE, response.get(0).estado());
    }

    @Test
    void generar_cuandoSumaManualNoCoincide_deberiaRechazar() {
        Prestamo prestamo = crearPrestamoBase(FrecuenciaTipo.FECHAS_MANUALES, null, null, 2);
        when(prestamoRepository.findById(4L)).thenReturn(Optional.of(prestamo));
        when(cuotaRepository.existsByPrestamoId(4L)).thenReturn(false);
        when(calculadoraPrestamoService.calcular(org.mockito.ArgumentMatchers.any())).thenReturn(
            new CalculoPrestamoResultado(
                new BigDecimal("100.00"),
                new BigDecimal("1100.00"),
                new BigDecimal("550.00"),
                new BigDecimal("1000.00"),
                new BigDecimal("100.00"),
                new BigDecimal("100.00")
            )
        );

        GenerarCuotasRequest request = new GenerarCuotasRequest(List.of(
            new CuotaManualRequest(1, LocalDate.of(2026, 5, 1), new BigDecimal("500.00")),
            new CuotaManualRequest(2, LocalDate.of(2026, 6, 1), new BigDecimal("500.00"))
        ));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> cuotaService.generar(4L, request));

        assertEquals(400, exception.getStatusCode().value());
    }

    @Test
    void generar_cuandoCantidadManualNoCoincide_deberiaRechazar() {
        Prestamo prestamo = crearPrestamoBase(FrecuenciaTipo.FECHAS_MANUALES, null, null, 3);
        when(prestamoRepository.findById(5L)).thenReturn(Optional.of(prestamo));
        when(cuotaRepository.existsByPrestamoId(5L)).thenReturn(false);
        when(calculadoraPrestamoService.calcular(org.mockito.ArgumentMatchers.any())).thenReturn(
            new CalculoPrestamoResultado(
                new BigDecimal("100.00"),
                new BigDecimal("1100.00"),
                new BigDecimal("366.67"),
                new BigDecimal("1000.00"),
                new BigDecimal("100.00"),
                new BigDecimal("100.00")
            )
        );

        GenerarCuotasRequest request = new GenerarCuotasRequest(List.of(
            new CuotaManualRequest(1, LocalDate.of(2026, 5, 1), new BigDecimal("550.00")),
            new CuotaManualRequest(2, LocalDate.of(2026, 6, 1), new BigDecimal("550.00"))
        ));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> cuotaService.generar(5L, request));

        assertEquals(400, exception.getStatusCode().value());
    }

    @Test
    void listarPorPrestamo_deberiaRetornarOrdenadasPorNumeroCuota() {
        Prestamo prestamo = crearPrestamoBase(FrecuenciaTipo.MENSUAL, LocalDate.of(2026, 4, 1), null, 2);
        when(prestamoRepository.findById(6L)).thenReturn(Optional.of(prestamo));

        Cuota cuota1 = new Cuota();
        cuota1.setPrestamo(prestamo);
        cuota1.setNumeroCuota(1);
        cuota1.setFechaVencimiento(LocalDate.of(2026, 4, 1));
        cuota1.setMontoProgramado(new BigDecimal("500.00"));
        cuota1.setMontoPagado(BigDecimal.ZERO.setScale(2));
        cuota1.setEstado(EstadoCuota.PENDIENTE);

        Cuota cuota2 = new Cuota();
        cuota2.setPrestamo(prestamo);
        cuota2.setNumeroCuota(2);
        cuota2.setFechaVencimiento(LocalDate.of(2026, 5, 1));
        cuota2.setMontoProgramado(new BigDecimal("500.00"));
        cuota2.setMontoPagado(BigDecimal.ZERO.setScale(2));
        cuota2.setEstado(EstadoCuota.PENDIENTE);

        when(cuotaRepository.findByPrestamoIdOrderByNumeroCuotaAsc(6L)).thenReturn(List.of(cuota1, cuota2));

        List<CuotaResponse> response = cuotaService.listarPorPrestamo(6L);

        assertEquals(2, response.size());
        assertEquals(1, response.get(0).numeroCuota());
        assertEquals(2, response.get(1).numeroCuota());
        verify(cuotaRepository).findByPrestamoIdOrderByNumeroCuotaAsc(6L);
    }

    @Test
    void generar_cuandoPrestamoNoExiste_deberiaRetornar404() {
        when(prestamoRepository.findById(99L)).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> cuotaService.generar(99L, null));

        assertEquals(404, exception.getStatusCode().value());
    }

    @Test
    void listarPorPrestamo_cuandoPrestamoNoExiste_deberiaRetornar404() {
        when(prestamoRepository.findById(98L)).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> cuotaService.listarPorPrestamo(98L));

        assertEquals(404, exception.getStatusCode().value());
    }

    @Test
    void generar_cuandoYaTieneCuotas_deberiaRechazarRegeneracion() {
        Prestamo prestamo = crearPrestamoBase(FrecuenciaTipo.MENSUAL, LocalDate.of(2026, 4, 20), null, 2);
        when(prestamoRepository.findById(7L)).thenReturn(Optional.of(prestamo));
        when(cuotaRepository.existsByPrestamoId(7L)).thenReturn(true);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> cuotaService.generar(7L, null));

        assertEquals(400, exception.getStatusCode().value());
    }

    @Test
    void generar_deberiaPersistirEstadoInicialYMontoPagadoEnCero() {
        Prestamo prestamo = crearPrestamoBase(FrecuenciaTipo.MENSUAL, LocalDate.of(2026, 4, 20), null, 2);
        when(prestamoRepository.findById(8L)).thenReturn(Optional.of(prestamo));
        when(cuotaRepository.existsByPrestamoId(8L)).thenReturn(false);
        when(calculadoraPrestamoService.calcular(org.mockito.ArgumentMatchers.any())).thenReturn(
            new CalculoPrestamoResultado(
                new BigDecimal("200.00"),
                new BigDecimal("1200.00"),
                new BigDecimal("600.00"),
                new BigDecimal("1000.00"),
                new BigDecimal("200.00"),
                new BigDecimal("200.00")
            )
        );
        when(cuotaRepository.saveAll(org.mockito.ArgumentMatchers.anyList())).thenAnswer(invocation -> invocation.getArgument(0));

        cuotaService.generar(8L, null);

        ArgumentCaptor<List<Cuota>> captor = ArgumentCaptor.forClass(List.class);
        verify(cuotaRepository).saveAll(captor.capture());
        assertEquals(BigDecimal.ZERO.setScale(2), captor.getValue().get(0).getMontoPagado());
        assertEquals(EstadoCuota.PENDIENTE, captor.getValue().get(0).getEstado());
    }

    private Prestamo crearPrestamoBase(FrecuenciaTipo frecuenciaTipo, LocalDate fechaBase, Integer frecuenciaCadaDias, Integer cantidadCuotas) {
        Prestamo prestamo = new Prestamo();
        Persona persona = new Persona();
        prestamo.setPersona(persona);
        prestamo.setMontoInicial(new BigDecimal("1000.00"));
        prestamo.setPorcentajeFijoSugerido(new BigDecimal("20"));
        prestamo.setInteresManualOpcional(null);
        prestamo.setCantidadCuotas(cantidadCuotas);
        prestamo.setFrecuenciaTipo(frecuenciaTipo);
        prestamo.setFrecuenciaCadaDias(frecuenciaCadaDias);
        prestamo.setFechaBase(fechaBase);
        return prestamo;
    }
}
