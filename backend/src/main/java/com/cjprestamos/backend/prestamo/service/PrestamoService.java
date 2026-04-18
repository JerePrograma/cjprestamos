package com.cjprestamos.backend.prestamo.service;

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
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class PrestamoService {

    private final PrestamoRepository prestamoRepository;
    private final PersonaRepository personaRepository;
    private final CalculadoraPrestamoService calculadoraPrestamoService;

    public PrestamoService(
        PrestamoRepository prestamoRepository,
        PersonaRepository personaRepository,
        CalculadoraPrestamoService calculadoraPrestamoService
    ) {
        this.prestamoRepository = prestamoRepository;
        this.personaRepository = personaRepository;
        this.calculadoraPrestamoService = calculadoraPrestamoService;
    }

    public PrestamoResponse crear(PrestamoRequest request) {
        Persona persona = personaRepository.findById(request.personaId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "La persona indicada no existe"));

        validarReglas(request);

        Prestamo prestamo = new Prestamo();
        prestamo.setPersona(persona);
        aplicarCambios(prestamo, request);

        return mapearRespuesta(prestamoRepository.save(prestamo));
    }

    public CalculoPrestamoResultado calcular(CalculoPrestamoEntrada entrada) {
        return calculadoraPrestamoService.calcular(entrada);
    }

    public PrestamoResponse actualizarReferencia(Long id, ActualizacionReferenciaPrestamoRequest request) {
        Prestamo prestamo = buscarPrestamo(id);
        prestamo.setReferenciaCodigo(request.referenciaCodigo());
        prestamo.setObservaciones(request.observaciones());
        return mapearRespuesta(prestamoRepository.save(prestamo));
    }

    @Transactional(readOnly = true)
    public PrestamoResponse obtenerPorId(Long id) {
        return mapearRespuesta(buscarPrestamo(id));
    }

    @Transactional(readOnly = true)
    public List<PrestamoResponse> listar() {
        return prestamoRepository.findAllByOrderByCreatedAtDesc().stream()
            .map(this::mapearRespuesta)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<PrestamoResponse> listarActivos() {
        return prestamoRepository.findByEstadoOrderByCreatedAtDesc(EstadoPrestamo.ACTIVO).stream()
            .map(this::mapearRespuesta)
            .toList();
    }

    private Prestamo buscarPrestamo(Long id) {
        return prestamoRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Préstamo no encontrado"));
    }

    private void validarReglas(PrestamoRequest request) {
        if (request.frecuenciaTipo() == FrecuenciaTipo.CADA_X_DIAS
            && (request.frecuenciaCadaDias() == null || request.frecuenciaCadaDias() <= 0)) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Para frecuencia CADA_X_DIAS, frecuenciaCadaDias debe ser mayor que 0"
            );
        }

        if (request.frecuenciaTipo() != FrecuenciaTipo.CADA_X_DIAS && request.frecuenciaCadaDias() != null) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "frecuenciaCadaDias solo se permite cuando frecuenciaTipo es CADA_X_DIAS"
            );
        }

        if (!request.usarFechasManuales()
            && request.frecuenciaTipo() != FrecuenciaTipo.FECHAS_MANUALES
            && request.fechaBase() == null) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "fechaBase es obligatoria cuando no se usan fechas manuales"
            );
        }
    }

    private void aplicarCambios(Prestamo prestamo, PrestamoRequest request) {
        prestamo.setMontoInicial(request.montoInicial());
        prestamo.setPorcentajeFijoSugerido(request.porcentajeFijoSugerido());
        prestamo.setInteresManualOpcional(request.interesManualOpcional());
        prestamo.setCantidadCuotas(request.cantidadCuotas());
        prestamo.setFrecuenciaTipo(request.frecuenciaTipo());
        prestamo.setFrecuenciaCadaDias(request.frecuenciaCadaDias());
        prestamo.setFechaBase(request.fechaBase());
        prestamo.setUsarFechasManuales(request.usarFechasManuales());
        prestamo.setReferenciaCodigo(request.referenciaCodigo());
        prestamo.setObservaciones(request.observaciones());
        prestamo.setEstado(request.estado());
    }

    private PrestamoResponse mapearRespuesta(Prestamo prestamo) {
        return new PrestamoResponse(
            prestamo.getId(),
            prestamo.getPersona().getId(),
            prestamo.getMontoInicial(),
            prestamo.getPorcentajeFijoSugerido(),
            prestamo.getInteresManualOpcional(),
            prestamo.getCantidadCuotas(),
            prestamo.getFrecuenciaTipo(),
            prestamo.getFrecuenciaCadaDias(),
            prestamo.getFechaBase(),
            prestamo.isUsarFechasManuales(),
            prestamo.getReferenciaCodigo(),
            prestamo.getObservaciones(),
            prestamo.getEstado(),
            prestamo.getCreatedAt(),
            prestamo.getUpdatedAt()
        );
    }
}
