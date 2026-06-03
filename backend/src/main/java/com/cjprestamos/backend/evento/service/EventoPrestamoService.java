package com.cjprestamos.backend.evento.service;

import com.cjprestamos.backend.common.time.FechaOperativaService;
import com.cjprestamos.backend.evento.model.EventoPrestamo;
import com.cjprestamos.backend.evento.model.enums.TipoEventoPrestamo;
import com.cjprestamos.backend.evento.repository.EventoPrestamoRepository;
import com.cjprestamos.backend.pago.model.Pago;
import com.cjprestamos.backend.prestamo.model.Prestamo;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.springframework.stereotype.Service;

@Service
public class EventoPrestamoService {

    private final EventoPrestamoRepository eventoPrestamoRepository;
    private final FechaOperativaService fechaOperativaService;

    public EventoPrestamoService(
        EventoPrestamoRepository eventoPrestamoRepository,
        FechaOperativaService fechaOperativaService
    ) {
        this.eventoPrestamoRepository = eventoPrestamoRepository;
        this.fechaOperativaService = fechaOperativaService;
    }

    public EventoPrestamo registrarPago(Prestamo prestamo, Pago pago, BigDecimal montoNormalizado) {
        return registrar(
            prestamo,
            TipoEventoPrestamo.REGISTRO_PAGO,
            "Se registró pago de " + montoNormalizado + " con fecha " + pago.getFechaPago(),
            fechaOperativaService.inicioDeDia(pago.getFechaPago())
        );
    }

    public EventoPrestamo registrarAnulacionPago(Prestamo prestamo, Pago pago) {
        LocalDateTime ahora = fechaOperativaService.ahora();
        return registrar(
            prestamo,
            TipoEventoPrestamo.OBSERVACION,
            "Se anuló el pago #" + pago.getId() + " del " + pago.getFechaPago(),
            ahora,
            ahora
        );
    }

    public EventoPrestamo registrarRenegociacionCuotas(
        Prestamo prestamo,
        LocalDate fechaRenegociacion,
        String descripcion
    ) {
        return registrar(
            prestamo,
            TipoEventoPrestamo.REPROGRAMACION_CUOTAS,
            descripcion,
            fechaOperativaService.inicioDeDia(fechaRenegociacion)
        );
    }

    public EventoPrestamo registrar(
        Prestamo prestamo,
        TipoEventoPrestamo tipoEvento,
        String descripcion,
        LocalDateTime ocurridoEn
    ) {
        return registrar(prestamo, tipoEvento, descripcion, ocurridoEn, fechaOperativaService.ahora());
    }

    private EventoPrestamo registrar(
        Prestamo prestamo,
        TipoEventoPrestamo tipoEvento,
        String descripcion,
        LocalDateTime ocurridoEn,
        LocalDateTime registradoEn
    ) {
        EventoPrestamo eventoPrestamo = new EventoPrestamo();
        eventoPrestamo.setPrestamo(prestamo);
        eventoPrestamo.setTipoEvento(tipoEvento);
        eventoPrestamo.setDescripcion(descripcion);
        eventoPrestamo.setFechaEvento(ocurridoEn);
        eventoPrestamo.setOcurridoEn(ocurridoEn);
        eventoPrestamo.setRegistradoEn(registradoEn);
        return eventoPrestamoRepository.save(eventoPrestamo);
    }
}
