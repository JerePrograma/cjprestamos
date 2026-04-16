package com.cjprestamos.backend.persona.service;

import com.cjprestamos.backend.persona.dto.PersonaRequest;
import com.cjprestamos.backend.persona.dto.PersonaResponse;
import com.cjprestamos.backend.persona.model.Persona;
import com.cjprestamos.backend.persona.repository.PersonaRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class PersonaService {

    private final PersonaRepository personaRepository;

    public PersonaService(PersonaRepository personaRepository) {
        this.personaRepository = personaRepository;
    }

    public PersonaResponse crear(PersonaRequest request) {
        Persona persona = new Persona();
        aplicarCambios(persona, request);
        Persona guardada = personaRepository.save(persona);
        return mapearRespuesta(guardada);
    }

    @Transactional(readOnly = true)
    public List<PersonaResponse> listar() {
        return personaRepository.findAll().stream()
            .map(this::mapearRespuesta)
            .toList();
    }

    @Transactional(readOnly = true)
    public PersonaResponse obtenerPorId(Long id) {
        return mapearRespuesta(buscarPorId(id));
    }

    public PersonaResponse actualizar(Long id, PersonaRequest request) {
        Persona persona = buscarPorId(id);
        aplicarCambios(persona, request);
        Persona guardada = personaRepository.save(persona);
        return mapearRespuesta(guardada);
    }

    public void eliminar(Long id) {
        Persona persona = buscarPorId(id);
        persona.setActivo(false);
        personaRepository.save(persona);
    }

    private Persona buscarPorId(Long id) {
        return personaRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Persona no encontrada"));
    }

    private void aplicarCambios(Persona persona, PersonaRequest request) {
        persona.setNombre(request.nombre());
        persona.setAlias(request.alias());
        persona.setTelefono(request.telefono());
        persona.setObservacionRapida(request.observacionRapida());
        persona.setColorReferencia(request.colorReferencia());
        persona.setCobraEnFecha(request.cobraEnFecha());
        persona.setTieneIngresoExtra(request.tieneIngresoExtra());
        persona.setActivo(request.activo());
    }

    private PersonaResponse mapearRespuesta(Persona persona) {
        return new PersonaResponse(
            persona.getId(),
            persona.getNombre(),
            persona.getAlias(),
            persona.getTelefono(),
            persona.getObservacionRapida(),
            persona.getColorReferencia(),
            persona.getCobraEnFecha(),
            persona.isTieneIngresoExtra(),
            persona.isActivo(),
            persona.getCreatedAt(),
            persona.getUpdatedAt()
        );
    }
}
