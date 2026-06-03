package com.cjprestamos.backend.persona.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.cjprestamos.backend.persona.dto.PersonaRequest;
import com.cjprestamos.backend.persona.dto.PersonaResponse;
import com.cjprestamos.backend.persona.model.Persona;
import com.cjprestamos.backend.persona.repository.PersonaRepository;
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
class PersonaServiceTest {

    @Mock
    private PersonaRepository personaRepository;

    private PersonaService personaService;

    @BeforeEach
    void setUp() {
        personaService = new PersonaService(personaRepository);
    }

    @Test
    void crear_deberiaGuardarYRetornarRespuesta() {
        PersonaRequest request = new PersonaRequest(
            "Ana",
            "Ani",
            "123",
            "Observación",
            "verde",
            true,
            true,
            true
        );

        Persona guardada = new Persona();
        guardada.setNombre("Ana");
        guardada.setAlias("Ani");
        guardada.setTelefono("123");
        guardada.setObservacionRapida("Observación");
        guardada.setColorReferencia("verde");
        guardada.setCobraEnFecha(true);
        guardada.setTieneIngresoExtra(true);
        guardada.setActivo(true);

        when(personaRepository.save(org.mockito.ArgumentMatchers.any(Persona.class))).thenReturn(guardada);

        PersonaResponse response = personaService.crear(request);

        ArgumentCaptor<Persona> captor = ArgumentCaptor.forClass(Persona.class);
        verify(personaRepository).save(captor.capture());
        assertEquals("Ana", captor.getValue().getNombre());
        assertEquals("Ana", response.nombre());
        assertEquals(true, response.cobraEnFecha());
    }

    @Test
    void obtenerPorId_cuandoNoExiste_deberiaLanzarNotFound() {
        when(personaRepository.findById(1L)).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(
            ResponseStatusException.class,
            () -> personaService.obtenerPorId(1L)
        );

        assertEquals(404, exception.getStatusCode().value());
    }

    @Test
    void listar_sinEstado_deberiaRetornarSoloActivas() {
        Persona activa = new Persona();
        activa.setNombre("Ana");
        activa.setActivo(true);
        when(personaRepository.findByActivoTrueOrderByNombreAsc()).thenReturn(List.of(activa));

        List<PersonaResponse> response = personaService.listar();

        assertEquals(1, response.size());
        assertEquals(true, response.getFirst().activo());
        verify(personaRepository).findByActivoTrueOrderByNombreAsc();
    }

    @Test
    void listar_conEstadoBajas_deberiaRetornarSoloInactivas() {
        Persona baja = new Persona();
        baja.setNombre("Beto");
        baja.setActivo(false);
        when(personaRepository.findByActivoFalseOrderByNombreAsc()).thenReturn(List.of(baja));

        List<PersonaResponse> response = personaService.listar("bajas");

        assertEquals(1, response.size());
        assertEquals(false, response.getFirst().activo());
        verify(personaRepository).findByActivoFalseOrderByNombreAsc();
    }

    @Test
    void listar_conEstadoTodas_deberiaRetornarActivasEInactivas() {
        Persona activa = new Persona();
        activa.setNombre("Ana");
        activa.setActivo(true);
        Persona baja = new Persona();
        baja.setNombre("Beto");
        baja.setActivo(false);
        when(personaRepository.findAllByOrderByNombreAsc()).thenReturn(List.of(activa, baja));

        List<PersonaResponse> response = personaService.listar("todas");

        assertEquals(2, response.size());
        verify(personaRepository).findAllByOrderByNombreAsc();
    }

    @Test
    void eliminar_deberiaRealizarBajaLogica() {
        Persona persona = new Persona();
        persona.setActivo(true);
        when(personaRepository.findById(10L)).thenReturn(Optional.of(persona));

        personaService.eliminar(10L);

        assertFalse(persona.isActivo());
        verify(personaRepository).save(persona);
    }
}
