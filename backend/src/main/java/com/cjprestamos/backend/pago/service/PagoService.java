package com.cjprestamos.backend.pago.service;

import com.cjprestamos.backend.common.model.MonedaUtils;
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
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
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

        validarEstadoPrestamo(prestamo);
        validarMonto(request.monto());

        BigDecimal montoPago = normalizarMoneda(request.monto());

        List<Cuota> cuotasObjetivo = obtenerCuotasParaImputacion(request);
        validarCuotasDisponibles(cuotasObjetivo);
        validarMontoNoExcedido(montoPago, cuotasObjetivo);

        Pago pago = crearPago(prestamo, request, montoPago);
        Pago pagoGuardado = pagoRepository.save(pago);

        List<ImputacionPago> imputaciones = imputarPagoEnCuotas(cuotasObjetivo, pagoGuardado);

        validarImputacionGenerada(imputaciones);

        cuotaRepository.saveAll(cuotasObjetivo);
        imputacionPagoRepository.saveAll(imputaciones);

        actualizarEstadoPrestamoSegunDeudaTotal(prestamo, request.prestamoId());
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

    private void validarEstadoPrestamo(Prestamo prestamo) {
        if (!esEstadoCobrable(prestamo.getEstado())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Solo se pueden registrar pagos sobre préstamos activos o renegociados"
            );
        }
    }

    private boolean esEstadoCobrable(EstadoPrestamo estado) {
        return estado == EstadoPrestamo.ACTIVO || estado == EstadoPrestamo.RENEGOCIADO;
    }

    private void validarMonto(BigDecimal monto) {
        if (monto == null || monto.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "monto debe ser mayor que 0");
        }
    }

    private List<Cuota> obtenerCuotasParaImputacion(RegistroPagoRequest request) {
        List<Long> cuotasSeleccionadas = request.cuotasSeleccionadas();

        if (cuotasSeleccionadas == null || cuotasSeleccionadas.isEmpty()) {
            return cuotaRepository.findByPrestamoIdOrderByNumeroCuotaAsc(request.prestamoId());
        }

        Set<Long> idsSinDuplicados = new LinkedHashSet<>(cuotasSeleccionadas);

        if (idsSinDuplicados.size() != cuotasSeleccionadas.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No se permite seleccionar cuotas repetidas");
        }

        List<Cuota> cuotasSeleccionadasDelPrestamo =
                cuotaRepository.findByPrestamoIdAndIdIn(request.prestamoId(), idsSinDuplicados);

        if (cuotasSeleccionadasDelPrestamo.size() != idsSinDuplicados.size()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Hay cuotas seleccionadas que no existen o no pertenecen al préstamo"
            );
        }

        return cuotasSeleccionadasDelPrestamo.stream()
                .sorted(Comparator.comparing(Cuota::getNumeroCuota))
                .toList();
    }

    private void validarCuotasDisponibles(List<Cuota> cuotasObjetivo) {
        if (cuotasObjetivo.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El préstamo no tiene cuotas generadas. No se puede imputar el pago"
            );
        }
    }

    private void validarMontoNoExcedido(BigDecimal montoPago, List<Cuota> cuotasObjetivo) {
        BigDecimal totalPendienteObjetivo = cuotasObjetivo.stream()
                .map(this::calcularSaldoPendiente)
                .reduce(MonedaUtils.cero(), BigDecimal::add);

        totalPendienteObjetivo = normalizarMoneda(totalPendienteObjetivo);

        if (totalPendienteObjetivo.compareTo(MonedaUtils.cero()) <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Las cuotas seleccionadas no tienen saldo pendiente para imputar"
            );
        }

        if (montoPago.compareTo(totalPendienteObjetivo) > 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El monto del pago supera el total pendiente imputable de las cuotas objetivo"
            );
        }
    }

    private Pago crearPago(Prestamo prestamo, RegistroPagoRequest request, BigDecimal montoPago) {
        Pago pago = new Pago();
        pago.setPrestamo(prestamo);
        pago.setFechaPago(request.fechaPago());
        pago.setMonto(montoPago);
        pago.setReferenciaManual(request.referencia());
        pago.setObservaciones(request.observacion());
        pago.setEstado(EstadoPago.REGISTRADO);
        return pago;
    }

    private List<ImputacionPago> imputarPagoEnCuotas(List<Cuota> cuotasObjetivo, Pago pagoGuardado) {
        BigDecimal montoRestante = normalizarMoneda(pagoGuardado.getMonto());
        List<ImputacionPago> imputaciones = new ArrayList<>();

        for (Cuota cuota : cuotasObjetivo) {
            if (montoRestante.compareTo(MonedaUtils.cero()) <= 0) {
                break;
            }

            BigDecimal saldoPendiente = calcularSaldoPendiente(cuota);

            if (saldoPendiente.compareTo(MonedaUtils.cero()) <= 0) {
                continue;
            }

            BigDecimal montoImputado = montoRestante.min(saldoPendiente);

            if (montoImputado.compareTo(MonedaUtils.cero()) <= 0) {
                continue;
            }

            BigDecimal montoPagadoActual = obtenerMontoPagado(cuota);
            cuota.setMontoPagado(normalizarMoneda(montoPagadoActual.add(montoImputado)));
            cuota.setEstado(calcularEstadoCuota(cuota));

            ImputacionPago imputacionPago = new ImputacionPago();
            imputacionPago.setPago(pagoGuardado);
            imputacionPago.setCuota(cuota);
            imputacionPago.setMontoImputado(normalizarMoneda(montoImputado));
            imputacionPago.setFechaImputacion(pagoGuardado.getFechaPago());

            imputaciones.add(imputacionPago);

            montoRestante = normalizarMoneda(montoRestante.subtract(montoImputado));
        }

        return imputaciones;
    }

    private void validarImputacionGenerada(List<ImputacionPago> imputaciones) {
        if (imputaciones.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "No se pudo imputar el pago sobre ninguna cuota"
            );
        }
    }

    private void actualizarEstadoPrestamoSegunDeudaTotal(Prestamo prestamo, Long prestamoId) {
        if (!esEstadoFinalizable(prestamo.getEstado())) {
            return;
        }

        List<Cuota> cuotasDelPrestamo = cuotaRepository.findByPrestamoIdOrderByNumeroCuotaAsc(prestamoId);

        if (cuotasDelPrestamo.isEmpty()) {
            return;
        }

        boolean deudaTotalSaldada = cuotasDelPrestamo.stream()
                .allMatch(cuota -> calcularSaldoPendiente(cuota).compareTo(MonedaUtils.cero()) == 0);

        if (deudaTotalSaldada) {
            prestamo.setEstado(EstadoPrestamo.FINALIZADO);
        }
    }

    private boolean esEstadoFinalizable(EstadoPrestamo estado) {
        return estado == EstadoPrestamo.ACTIVO || estado == EstadoPrestamo.RENEGOCIADO;
    }

    private BigDecimal calcularSaldoPendiente(Cuota cuota) {
        BigDecimal montoProgramado = obtenerMontoProgramado(cuota);
        BigDecimal montoPagado = obtenerMontoPagado(cuota);
        BigDecimal saldo = montoProgramado.subtract(montoPagado);

        if (saldo.compareTo(MonedaUtils.cero()) <= 0) {
            return MonedaUtils.cero();
        }

        return normalizarMoneda(saldo);
    }

    private EstadoCuota calcularEstadoCuota(Cuota cuota) {
        BigDecimal montoPagado = obtenerMontoPagado(cuota);
        BigDecimal montoProgramado = obtenerMontoProgramado(cuota);

        if (montoPagado.compareTo(MonedaUtils.cero()) == 0) {
            return EstadoCuota.PENDIENTE;
        }

        if (montoPagado.compareTo(montoProgramado) >= 0) {
            return EstadoCuota.PAGADA;
        }

        return EstadoCuota.PARCIAL;
    }

    private void registrarEvento(Prestamo prestamo, Pago pago) {
        EventoPrestamo eventoPrestamo = new EventoPrestamo();
        eventoPrestamo.setPrestamo(prestamo);
        eventoPrestamo.setTipoEvento(TipoEventoPrestamo.REGISTRO_PAGO);
        eventoPrestamo.setDescripcion(
                "Se registró pago de " + normalizarMoneda(pago.getMonto()) + " con fecha " + pago.getFechaPago()
        );
        eventoPrestamo.setFechaEvento(pago.getFechaPago().atStartOfDay());
        eventoPrestamoRepository.save(eventoPrestamo);
    }

    private PagoResponse mapearRespuesta(Pago pago) {
        return new PagoResponse(
                pago.getId(),
                pago.getPrestamo().getId(),
                pago.getFechaPago(),
                normalizarMoneda(pago.getMonto()),
                pago.getReferenciaManual(),
                pago.getObservaciones(),
                pago.getEstado(),
                pago.getCreatedAt(),
                pago.getUpdatedAt()
        );
    }

    private BigDecimal obtenerMontoPagado(Cuota cuota) {
        if (cuota.getMontoPagado() == null) {
            return MonedaUtils.cero();
        }

        return normalizarMoneda(cuota.getMontoPagado());
    }

    private BigDecimal obtenerMontoProgramado(Cuota cuota) {
        if (cuota.getMontoProgramado() == null) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "La cuota posee montoProgramado nulo"
            );
        }

        return normalizarMoneda(cuota.getMontoProgramado());
    }

    private BigDecimal normalizarMoneda(BigDecimal valor) {
        if (valor == null) {
            return MonedaUtils.cero();
        }

        return MonedaUtils.normalizar(valor);
    }
}