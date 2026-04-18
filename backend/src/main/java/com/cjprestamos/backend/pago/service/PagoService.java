package com.cjprestamos.backend.pago.service;

import com.cjprestamos.backend.cuota.model.Cuota;
import com.cjprestamos.backend.cuota.model.enums.EstadoCuota;
import com.cjprestamos.backend.cuota.repository.CuotaRepository;
import com.cjprestamos.backend.evento.model.EventoPrestamo;
import com.cjprestamos.backend.evento.model.enums.TipoEventoPrestamo;
import com.cjprestamos.backend.evento.repository.EventoPrestamoRepository;
import com.cjprestamos.backend.pago.dto.PagoResponse;
import com.cjprestamos.backend.pago.dto.RegistroPagoRequest;
import com.cjprestamos.backend.pago.model.ImputacionPago;
import com.cjprestamos.backend.pago.model.Pago;
import com.cjprestamos.backend.pago.model.enums.EstadoPago;
import com.cjprestamos.backend.pago.repository.ImputacionPagoRepository;
import com.cjprestamos.backend.pago.repository.PagoRepository;
import com.cjprestamos.backend.prestamo.model.Prestamo;
import com.cjprestamos.backend.prestamo.model.enums.EstadoPrestamo;
import com.cjprestamos.backend.prestamo.repository.PrestamoRepository;
import java.math.BigDecimal;
import java.util.ArrayList;
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
    private final CuotaRepository cuotaRepository;
    private final ImputacionPagoRepository imputacionPagoRepository;
    private final EventoPrestamoRepository eventoPrestamoRepository;

    public PagoService(
        PagoRepository pagoRepository,
        PrestamoRepository prestamoRepository,
        CuotaRepository cuotaRepository,
        ImputacionPagoRepository imputacionPagoRepository,
        EventoPrestamoRepository eventoPrestamoRepository
    ) {
        this.pagoRepository = pagoRepository;
        this.prestamoRepository = prestamoRepository;
        this.cuotaRepository = cuotaRepository;
        this.imputacionPagoRepository = imputacionPagoRepository;
        this.eventoPrestamoRepository = eventoPrestamoRepository;
    }

    public PagoResponse registrar(RegistroPagoRequest request) {
        Prestamo prestamo = buscarPrestamo(request.prestamoId());
        validarMonto(request.monto());

        List<Cuota> cuotasOrdenadas = cuotaRepository.findByPrestamoIdOrderByNumeroCuotaAsc(request.prestamoId());
        validarCuotasDisponibles(cuotasOrdenadas);
        validarMontoNoExcedido(request.monto(), cuotasOrdenadas);

        Pago pago = new Pago();
        pago.setPrestamo(prestamo);
        pago.setFechaPago(request.fechaPago());
        pago.setMonto(request.monto().setScale(2));
        pago.setReferenciaManual(request.referencia());
        pago.setObservaciones(request.observacion());
        pago.setEstado(EstadoPago.REGISTRADO);

        Pago pagoGuardado = pagoRepository.save(pago);

        List<ImputacionPago> imputaciones = imputarPagoEnCuotas(cuotasOrdenadas, pagoGuardado);
        cuotaRepository.saveAll(cuotasOrdenadas);
        imputacionPagoRepository.saveAll(imputaciones);
        actualizarEstadoPrestamoSiCorresponde(prestamo, cuotasOrdenadas);

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

    private void validarCuotasDisponibles(List<Cuota> cuotasOrdenadas) {
        if (cuotasOrdenadas.isEmpty()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "El préstamo no tiene cuotas generadas. No se puede imputar el pago"
            );
        }
    }

    private void validarMontoNoExcedido(BigDecimal montoPago, List<Cuota> cuotasOrdenadas) {
        BigDecimal totalPendiente = cuotasOrdenadas.stream()
            .map(this::calcularSaldoPendiente)
            .reduce(BigDecimal.ZERO.setScale(2), BigDecimal::add);

        if (montoPago.setScale(2).compareTo(totalPendiente) > 0) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "El monto del pago supera el total pendiente imputable del préstamo"
            );
        }
    }

    private List<ImputacionPago> imputarPagoEnCuotas(List<Cuota> cuotasOrdenadas, Pago pagoGuardado) {
        BigDecimal montoRestante = pagoGuardado.getMonto().setScale(2);
        List<ImputacionPago> imputaciones = new ArrayList<>();

        for (Cuota cuota : cuotasOrdenadas) {
            if (montoRestante.compareTo(BigDecimal.ZERO) <= 0) {
                break;
            }

            BigDecimal saldoPendiente = calcularSaldoPendiente(cuota);
            if (saldoPendiente.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }

            BigDecimal montoImputado = montoRestante.min(saldoPendiente).setScale(2);
            if (montoImputado.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }

            cuota.setMontoPagado(cuota.getMontoPagado().add(montoImputado).setScale(2));
            cuota.setEstado(calcularEstadoCuota(cuota));

            ImputacionPago imputacionPago = new ImputacionPago();
            imputacionPago.setPago(pagoGuardado);
            imputacionPago.setCuota(cuota);
            imputacionPago.setMontoImputado(montoImputado);
            imputacionPago.setFechaImputacion(pagoGuardado.getFechaPago());
            imputaciones.add(imputacionPago);

            montoRestante = montoRestante.subtract(montoImputado).setScale(2);
        }

        return imputaciones;
    }

    private BigDecimal calcularSaldoPendiente(Cuota cuota) {
        BigDecimal montoPagado = cuota.getMontoPagado() == null ? BigDecimal.ZERO.setScale(2) : cuota.getMontoPagado().setScale(2);
        return cuota.getMontoProgramado().setScale(2).subtract(montoPagado).setScale(2);
    }

    private EstadoCuota calcularEstadoCuota(Cuota cuota) {
        BigDecimal montoPagado = cuota.getMontoPagado().setScale(2);
        BigDecimal montoProgramado = cuota.getMontoProgramado().setScale(2);

        if (montoPagado.compareTo(BigDecimal.ZERO) == 0) {
            return EstadoCuota.PENDIENTE;
        }

        if (montoPagado.compareTo(montoProgramado) == 0) {
            return EstadoCuota.PAGADA;
        }

        return EstadoCuota.PARCIAL;
    }

    private void actualizarEstadoPrestamoSiCorresponde(Prestamo prestamo, List<Cuota> cuotasOrdenadas) {
        if (prestamo.getEstado() != EstadoPrestamo.ACTIVO) {
            return;
        }

        // Regla MVP: si no queda saldo pendiente en cuotas, el préstamo activo pasa a finalizado.
        boolean deudaSaldada = cuotasOrdenadas.stream()
            .allMatch(cuota -> calcularSaldoPendiente(cuota).compareTo(BigDecimal.ZERO) == 0);
        if (deudaSaldada) {
            prestamo.setEstado(EstadoPrestamo.FINALIZADO);
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
