package com.cjprestamos.backend.pago.service;

import com.cjprestamos.backend.evento.model.EventoPrestamo;
import com.cjprestamos.backend.evento.model.enums.TipoEventoPrestamo;
import com.cjprestamos.backend.evento.repository.EventoPrestamoRepository;
import com.cjprestamos.backend.pago.dto.PagoResponse;
import com.cjprestamos.backend.pago.dto.RegistroPagoRequest;
import com.cjprestamos.backend.pago.model.Pago;
import com.cjprestamos.backend.pago.model.enums.EstadoPago;
import com.cjprestamos.backend.pago.repository.PagoRepository;
import com.cjprestamos.backend.prestamo.model.Prestamo;
import com.cjprestamos.backend.prestamo.repository.PrestamoRepository;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class PagoService {

    private final PagoRepository pagoRepository;
    private final PrestamoRepository prestamoRepository;
    private final EventoPrestamoRepository eventoPrestamoRepository;

    public PagoService(
        PagoRepository pagoRepository,
        PrestamoRepository prestamoRepository,
        EventoPrestamoRepository eventoPrestamoRepository
    ) {
        this.pagoRepository = pagoRepository;
        this.prestamoRepository = prestamoRepository;
        this.eventoPrestamoRepository = eventoPrestamoRepository;
    }

    public PagoResponse registrar(RegistroPagoRequest request) {
        Prestamo prestamo = buscarPrestamo(request.prestamoId());
        validarMonto(request.monto());

        Pago pago = new Pago();
        pago.setPrestamo(prestamo);
        pago.setFechaPago(request.fechaPago());
        pago.setMonto(request.monto().setScale(2));
        pago.setReferenciaManual(request.referencia());
        pago.setObservaciones(request.observacion());
        pago.setEstado(EstadoPago.REGISTRADO);

        Pago pagoGuardado = pagoRepository.save(pago);
        registrarEvento(prestamo, pagoGuardado);

        return mapearRespuesta(pagoGuardado);
    }

    @Transactional(readOnly = true)
    public List<PagoResponse> listarPorPrestamo(Long prestamoId) {
        buscarPrestamo(prestamoId);

        return pagoRepository.findByPrestamoIdOrderByFechaPagoDescIdDesc(prestamoId).stream()
            .map(this::mapearRespuesta)
            .toList();
    }

    private Prestamo buscarPrestamo(Long prestamoId) {
        return prestamoRepository.findById(prestamoId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Préstamo no encontrado"));
    }

    private void validarMonto(BigDecimal monto) {
        if (monto == null || monto.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "monto debe ser mayor que 0");
        }
    }

    private void registrarEvento(Prestamo prestamo, Pago pago) {
        EventoPrestamo eventoPrestamo = new EventoPrestamo();
        eventoPrestamo.setPrestamo(prestamo);
        eventoPrestamo.setTipoEvento(TipoEventoPrestamo.REGISTRO_PAGO);
        eventoPrestamo.setDescripcion(
            "Se registró pago de " + pago.getMonto().setScale(2) + " con fecha " + pago.getFechaPago()
        );
        eventoPrestamo.setFechaEvento(pago.getFechaPago().atStartOfDay());
        eventoPrestamoRepository.save(eventoPrestamo);
    }

    private PagoResponse mapearRespuesta(Pago pago) {
        return new PagoResponse(
            pago.getId(),
            pago.getPrestamo().getId(),
            pago.getFechaPago(),
            pago.getMonto().setScale(2),
            pago.getReferenciaManual(),
            pago.getObservaciones(),
            pago.getEstado(),
            pago.getCreatedAt(),
            pago.getUpdatedAt()
        );
    }
}
