package com.cjprestamos.backend.prestamo.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.cjprestamos.backend.persona.model.Persona;
import com.cjprestamos.backend.persona.repository.PersonaRepository;
import com.cjprestamos.backend.prestamo.dto.ActualizacionReferenciaPrestamoRequest;
import com.cjprestamos.backend.prestamo.dto.CalculoPrestamoEntrada;
import com.cjprestamos.backend.prestamo.dto.CalculoPrestamoResultado;
import com.cjprestamos.backend.prestamo.dto.PrestamoRequest;
import com.cjprestamos.backend.prestamo.dto.PrestamoResponse;
import com.cjprestamos.backend.prestamo.model.Prestamo;
import com.cjprestamos.backend.prestamo.model.enums.EstadoPrestamo;
import com.cjprestamos.backend.prestamo.model.enums.FrecuenciaTipo;
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
class PrestamoServiceTest {

    @Mock
    private PrestamoRepository prestamoRepository;

    @Mock
    private PersonaRepository personaRepository;

    @Mock
    private CalculadoraPrestamoService calculadoraPrestamoService;

    private PrestamoService prestamoService;

    @BeforeEach
    void setUp() {
        prestamoService = new PrestamoService(prestamoRepository, personaRepository, calculadoraPrestamoService);
    }

    @Test
    void crear_deberiaGuardarPrestamoCuandoEsValido() {
        PrestamoRequest request = new PrestamoRequest(
            10L,
            new BigDecimal("100000.00"),
            new BigDecimal("20.0000"),
            null,
            6,
            FrecuenciaTipo.MENSUAL,
            null,
            LocalDate.of(2026, 4, 20),
            false,
            "REF-1",
            "Observación",
            EstadoPrestamo.ACTIVO
        );

        Persona persona = new Persona();
        persona.setNombre("Ana");
        when(personaRepository.findById(10L)).thenReturn(Optional.of(persona));

        Prestamo guardado = new Prestamo();
        guardado.setPersona(persona);
        guardado.setMontoInicial(new BigDecimal("100000.00"));
        guardado.setPorcentajeFijoSugerido(new BigDecimal("20.0000"));
        guardado.setCantidadCuotas(6);
        guardado.setFrecuenciaTipo(FrecuenciaTipo.MENSUAL);
        guardado.setFechaBase(LocalDate.of(2026, 4, 20));
        guardado.setUsarFechasManuales(false);
        guardado.setReferenciaCodigo("REF-1");
        guardado.setObservaciones("Observación");
        guardado.setEstado(EstadoPrestamo.ACTIVO);

        when(prestamoRepository.save(org.mockito.ArgumentMatchers.any(Prestamo.class))).thenReturn(guardado);

        PrestamoResponse response = prestamoService.crear(request);

        ArgumentCaptor<Prestamo> captor = ArgumentCaptor.forClass(Prestamo.class);
        verify(prestamoRepository).save(captor.capture());
        assertEquals(new BigDecimal("100000.00"), captor.getValue().getMontoInicial());
        assertEquals(FrecuenciaTipo.MENSUAL, captor.getValue().getFrecuenciaTipo());
        assertEquals(EstadoPrestamo.ACTIVO, response.estado());
    }

    @Test
    void crear_cuandoPersonaNoExiste_deberiaLanzarBadRequest() {
        PrestamoRequest request = new PrestamoRequest(
            99L,
            new BigDecimal("1000.00"),
            null,
            null,
            3,
            FrecuenciaTipo.MENSUAL,
            null,
            LocalDate.now(),
            false,
            null,
            null,
            EstadoPrestamo.ACTIVO
        );

        when(personaRepository.findById(99L)).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> prestamoService.crear(request));

        assertEquals(400, exception.getStatusCode().value());
    }

    @Test
    void crear_conCadaXDiasSinFrecuenciaDias_deberiaLanzarBadRequest() {
        PrestamoRequest request = new PrestamoRequest(
            1L,
            new BigDecimal("5000.00"),
            null,
            null,
            4,
            FrecuenciaTipo.CADA_X_DIAS,
            null,
            LocalDate.now(),
            false,
            null,
            null,
            EstadoPrestamo.ACTIVO
        );

        Persona persona = new Persona();
        when(personaRepository.findById(1L)).thenReturn(Optional.of(persona));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> prestamoService.crear(request));

        assertEquals(400, exception.getStatusCode().value());
    }

    @Test
    void calcular_deberiaDelegarEnCalculadoraPrestamoService() {
        CalculoPrestamoEntrada entrada = new CalculoPrestamoEntrada(
            new BigDecimal("1000.00"),
            new BigDecimal("20"),
            null,
            4
        );

        CalculoPrestamoResultado esperado = new CalculoPrestamoResultado(
            new BigDecimal("200.00"),
            new BigDecimal("1200.00"),
            new BigDecimal("300.00"),
            new BigDecimal("1000.00"),
            new BigDecimal("200.00"),
            new BigDecimal("200.00")
        );

        when(calculadoraPrestamoService.calcular(entrada)).thenReturn(esperado);

        CalculoPrestamoResultado resultado = prestamoService.calcular(entrada);

        assertEquals(esperado, resultado);
    }

    @Test
    void obtenerPorId_deberiaRetornarPrestamo() {
        Prestamo prestamo = new Prestamo();
        Persona persona = new Persona();
        prestamo.setPersona(persona);
        prestamo.setMontoInicial(new BigDecimal("8000.00"));
        prestamo.setCantidadCuotas(8);
        prestamo.setFrecuenciaTipo(FrecuenciaTipo.FECHAS_MANUALES);
        prestamo.setUsarFechasManuales(true);
        prestamo.setEstado(EstadoPrestamo.ACTIVO);

        when(prestamoRepository.findById(3L)).thenReturn(Optional.of(prestamo));

        PrestamoResponse response = prestamoService.obtenerPorId(3L);

        assertEquals(new BigDecimal("8000.00"), response.montoInicial());
        assertEquals(FrecuenciaTipo.FECHAS_MANUALES, response.frecuenciaTipo());
    }

    @Test
    void listar_deberiaUsarOrdenPorCreatedAtDesc() {
        Prestamo prestamo = new Prestamo();
        Persona persona = new Persona();
        prestamo.setPersona(persona);
        prestamo.setMontoInicial(new BigDecimal("1000.00"));
        prestamo.setCantidadCuotas(1);
        prestamo.setFrecuenciaTipo(FrecuenciaTipo.MENSUAL);
        prestamo.setUsarFechasManuales(false);
        prestamo.setEstado(EstadoPrestamo.ACTIVO);

        when(prestamoRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(prestamo));

        List<PrestamoResponse> response = prestamoService.listar();

        assertEquals(1, response.size());
        verify(prestamoRepository).findAllByOrderByCreatedAtDesc();
    }

    @Test
    void actualizarReferencia_deberiaActualizarReferenciaYObservaciones() {
        Prestamo prestamo = new Prestamo();
        Persona persona = new Persona();
        prestamo.setPersona(persona);
        prestamo.setMontoInicial(new BigDecimal("1000.00"));
        prestamo.setCantidadCuotas(2);
        prestamo.setFrecuenciaTipo(FrecuenciaTipo.MENSUAL);
        prestamo.setUsarFechasManuales(false);
        prestamo.setEstado(EstadoPrestamo.ACTIVO);

        when(prestamoRepository.findById(8L)).thenReturn(Optional.of(prestamo));
        when(prestamoRepository.save(org.mockito.ArgumentMatchers.any(Prestamo.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PrestamoResponse response = prestamoService.actualizarReferencia(
            8L,
            new ActualizacionReferenciaPrestamoRequest("REF-AJUSTADA", "Observación ajustada")
        );

        assertEquals("REF-AJUSTADA", response.referenciaCodigo());
        assertEquals("Observación ajustada", response.observaciones());
    }

    @Test
    void listarActivos_deberiaFiltrarPorEstadoActivo() {
        Prestamo prestamo = new Prestamo();
        Persona persona = new Persona();
        prestamo.setPersona(persona);
        prestamo.setMontoInicial(new BigDecimal("1200.00"));
        prestamo.setCantidadCuotas(2);
        prestamo.setFrecuenciaTipo(FrecuenciaTipo.MENSUAL);
        prestamo.setUsarFechasManuales(false);
        prestamo.setEstado(EstadoPrestamo.ACTIVO);

        when(prestamoRepository.findByEstadoOrderByCreatedAtDesc(EstadoPrestamo.ACTIVO)).thenReturn(List.of(prestamo));

        List<PrestamoResponse> response = prestamoService.listarActivos();

        assertEquals(1, response.size());
        verify(prestamoRepository).findByEstadoOrderByCreatedAtDesc(EstadoPrestamo.ACTIVO);
    }
}
