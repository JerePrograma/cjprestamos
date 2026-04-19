package com.cjprestamos.backend.legajo.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.cjprestamos.backend.legajo.dto.LegajoPersonaRequest;
import com.cjprestamos.backend.legajo.dto.LegajoPersonaResponse;
import com.cjprestamos.backend.legajo.model.LegajoPersona;
import com.cjprestamos.backend.legajo.repository.LegajoPersonaRepository;
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
class LegajoPersonaServiceTest {

    @Mock
    private LegajoPersonaRepository legajoPersonaRepository;

    @Mock
    private PersonaRepository personaRepository;

    private LegajoPersonaService legajoPersonaService;

    @BeforeEach
    void setUp() {
        legajoPersonaService = new LegajoPersonaService(legajoPersonaRepository, personaRepository);
    }

    @Test
    void crear_deberiaGuardarLegajo() {
        Long personaId = 5L;
        Persona persona = new Persona();
        LegajoPersonaRequest request = new LegajoPersonaRequest(
            "Calle 123",
            "Comerciante",
            "Negocio",
            "Hermana 555-111",
            "DNI",
            "Nota interna",
            "Observación general"
        );

        when(personaRepository.findById(personaId)).thenReturn(Optional.of(persona));
        when(legajoPersonaRepository.existsByPersonaId(personaId)).thenReturn(false);

        LegajoPersona guardado = new LegajoPersona();
        guardado.setPersona(persona);
        guardado.setDireccion(request.direccion());
        guardado.setOcupacion(request.ocupacion());
        guardado.setFuenteIngreso(request.fuenteIngreso());
        guardado.setContactoAlternativo(request.contactoAlternativo());
        guardado.setDocumentacionPendiente(request.documentacionPendiente());
        guardado.setNotasInternas(request.notasInternas());
        guardado.setObservacionesGenerales(request.observacionesGenerales());

        when(legajoPersonaRepository.save(org.mockito.ArgumentMatchers.any(LegajoPersona.class))).thenReturn(guardado);

        LegajoPersonaResponse response = legajoPersonaService.crear(personaId, request);

        ArgumentCaptor<LegajoPersona> captor = ArgumentCaptor.forClass(LegajoPersona.class);
        verify(legajoPersonaRepository).save(captor.capture());
        assertEquals("Calle 123", captor.getValue().getDireccion());
        assertEquals("Comerciante", response.ocupacion());
    }

    @Test
    void obtenerPorPersonaId_siNoExisteLegajo_deberiaLanzar404() {
        when(personaRepository.existsById(9L)).thenReturn(true);
        when(legajoPersonaRepository.findByPersonaId(9L)).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(
            ResponseStatusException.class,
            () -> legajoPersonaService.obtenerPorPersonaId(9L)
        );

        assertEquals(404, exception.getStatusCode().value());
    }

    @Test
    void actualizar_deberiaModificarCampos() {
        Long personaId = 7L;
        Persona persona = new Persona();
        LegajoPersona existente = new LegajoPersona();
        existente.setPersona(persona);
        existente.setDireccion("Vieja");

        LegajoPersonaRequest request = new LegajoPersonaRequest(
            "Nueva",
            "Chofer",
            "Sueldo",
            null,
            null,
            null,
            "Actualizada"
        );

        when(personaRepository.existsById(personaId)).thenReturn(true);
        when(legajoPersonaRepository.findByPersonaId(personaId)).thenReturn(Optional.of(existente));
        when(legajoPersonaRepository.save(existente)).thenReturn(existente);

        LegajoPersonaResponse response = legajoPersonaService.actualizar(personaId, request);

        assertEquals("Nueva", existente.getDireccion());
        assertEquals("Chofer", response.ocupacion());
        assertEquals("Actualizada", response.observacionesGenerales());
    }
}
