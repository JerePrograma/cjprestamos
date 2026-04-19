package com.cjprestamos.backend.legajo.service;

import com.cjprestamos.backend.legajo.dto.LegajoPersonaRequest;
import com.cjprestamos.backend.legajo.dto.LegajoPersonaResponse;
import com.cjprestamos.backend.legajo.model.LegajoPersona;
import com.cjprestamos.backend.legajo.repository.LegajoPersonaRepository;
import com.cjprestamos.backend.persona.model.Persona;
import com.cjprestamos.backend.persona.repository.PersonaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class LegajoPersonaService {

    private final LegajoPersonaRepository legajoPersonaRepository;
    private final PersonaRepository personaRepository;

    public LegajoPersonaService(LegajoPersonaRepository legajoPersonaRepository, PersonaRepository personaRepository) {
        this.legajoPersonaRepository = legajoPersonaRepository;
        this.personaRepository = personaRepository;
    }

    @Transactional(readOnly = true)
    public LegajoPersonaResponse obtenerPorPersonaId(Long personaId) {
        validarPersonaExiste(personaId);
        LegajoPersona legajoPersona = legajoPersonaRepository.findByPersonaId(personaId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Legajo no encontrado para la persona"));
        return mapearRespuesta(legajoPersona);
    }

    public LegajoPersonaResponse crear(Long personaId, LegajoPersonaRequest request) {
        Persona persona = buscarPersona(personaId);

        if (legajoPersonaRepository.existsByPersonaId(personaId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La persona ya tiene un legajo creado");
        }

        LegajoPersona legajoPersona = new LegajoPersona();
        legajoPersona.setPersona(persona);
        aplicarCambios(legajoPersona, request);

        LegajoPersona guardado = legajoPersonaRepository.save(legajoPersona);
        return mapearRespuesta(guardado);
    }

    public LegajoPersonaResponse actualizar(Long personaId, LegajoPersonaRequest request) {
        validarPersonaExiste(personaId);
        LegajoPersona legajoPersona = legajoPersonaRepository.findByPersonaId(personaId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Legajo no encontrado para la persona"));

        aplicarCambios(legajoPersona, request);

        LegajoPersona guardado = legajoPersonaRepository.save(legajoPersona);
        return mapearRespuesta(guardado);
    }

    private Persona buscarPersona(Long personaId) {
        return personaRepository.findById(personaId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Persona no encontrada"));
    }

    private void validarPersonaExiste(Long personaId) {
        if (!personaRepository.existsById(personaId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Persona no encontrada");
        }
    }

    private void aplicarCambios(LegajoPersona legajoPersona, LegajoPersonaRequest request) {
        legajoPersona.setDireccion(request.direccion());
        legajoPersona.setOcupacion(request.ocupacion());
        legajoPersona.setFuenteIngreso(request.fuenteIngreso());
        legajoPersona.setContactoAlternativo(request.contactoAlternativo());
        legajoPersona.setDocumentacionPendiente(request.documentacionPendiente());
        legajoPersona.setNotasInternas(request.notasInternas());
        legajoPersona.setObservacionesGenerales(request.observacionesGenerales());
    }

    private LegajoPersonaResponse mapearRespuesta(LegajoPersona legajoPersona) {
        return new LegajoPersonaResponse(
            legajoPersona.getId(),
            legajoPersona.getPersona().getId(),
            legajoPersona.getDireccion(),
            legajoPersona.getOcupacion(),
            legajoPersona.getFuenteIngreso(),
            legajoPersona.getContactoAlternativo(),
            legajoPersona.getDocumentacionPendiente(),
            legajoPersona.getNotasInternas(),
            legajoPersona.getObservacionesGenerales(),
            legajoPersona.getCreatedAt(),
            legajoPersona.getUpdatedAt()
        );
    }
}
