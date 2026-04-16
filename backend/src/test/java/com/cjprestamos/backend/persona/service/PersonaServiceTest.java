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
    void eliminar_deberiaRealizarBajaLogica() {
        Persona persona = new Persona();
        persona.setActivo(true);
        when(personaRepository.findById(10L)).thenReturn(Optional.of(persona));

        personaService.eliminar(10L);

        assertFalse(persona.isActivo());
        verify(personaRepository).save(persona);
    }
}
