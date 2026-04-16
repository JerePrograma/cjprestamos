package com.cjprestamos.backend.cuota.service;

import com.cjprestamos.backend.cuota.dto.CuotaManualRequest;
import com.cjprestamos.backend.cuota.dto.CuotaResponse;
import com.cjprestamos.backend.cuota.dto.GenerarCuotasRequest;
import com.cjprestamos.backend.cuota.model.Cuota;
import com.cjprestamos.backend.cuota.model.enums.EstadoCuota;
import com.cjprestamos.backend.cuota.repository.CuotaRepository;
import com.cjprestamos.backend.prestamo.dto.CalculoPrestamoEntrada;
import com.cjprestamos.backend.prestamo.dto.CalculoPrestamoResultado;
import com.cjprestamos.backend.prestamo.model.Prestamo;
import com.cjprestamos.backend.prestamo.repository.PrestamoRepository;
import com.cjprestamos.backend.prestamo.service.CalculadoraPrestamoService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.IntStream;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class CuotaService {

    private final CuotaRepository cuotaRepository;
    private final PrestamoRepository prestamoRepository;
    private final CalculadoraPrestamoService calculadoraPrestamoService;

    public CuotaService(
        CuotaRepository cuotaRepository,
        PrestamoRepository prestamoRepository,
        CalculadoraPrestamoService calculadoraPrestamoService
    ) {
        this.cuotaRepository = cuotaRepository;
        this.prestamoRepository = prestamoRepository;
        this.calculadoraPrestamoService = calculadoraPrestamoService;
    }

    public List<CuotaResponse> generar(Long prestamoId, GenerarCuotasRequest request) {
        Prestamo prestamo = buscarPrestamo(prestamoId);
        validarNoRegeneracion(prestamoId);

        CalculoPrestamoResultado calculo = calculadoraPrestamoService.calcular(new CalculoPrestamoEntrada(
            prestamo.getMontoInicial(),
            prestamo.getPorcentajeFijoSugerido(),
            prestamo.getInteresManualOpcional(),
            prestamo.getCantidadCuotas()
        ));

        List<Cuota> cuotas = switch (prestamo.getFrecuenciaTipo()) {
            case MENSUAL -> generarAutomaticasMensuales(prestamo, calculo.totalADevolver());
            case CADA_X_DIAS -> generarAutomaticasCadaXDias(prestamo, calculo.totalADevolver());
            case FECHAS_MANUALES -> generarManuales(prestamo, calculo.totalADevolver(), request);
        };

        return cuotaRepository.saveAll(cuotas).stream()
            .map(this::mapearRespuesta)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<CuotaResponse> listarPorPrestamo(Long prestamoId) {
        buscarPrestamo(prestamoId);

        return cuotaRepository.findByPrestamoIdOrderByNumeroCuotaAsc(prestamoId).stream()
            .map(this::mapearRespuesta)
            .toList();
    }

    private Prestamo buscarPrestamo(Long prestamoId) {
        return prestamoRepository.findById(prestamoId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Préstamo no encontrado"));
    }

    private void validarNoRegeneracion(Long prestamoId) {
        if (cuotaRepository.existsByPrestamoId(prestamoId)) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "El préstamo ya tiene cuotas generadas. No se permite regeneración en esta etapa"
            );
        }
    }

    private List<Cuota> generarAutomaticasMensuales(Prestamo prestamo, BigDecimal totalADevolver) {
        if (prestamo.getFechaBase() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "fechaBase es obligatoria para cuotas mensuales");
        }

        List<BigDecimal> montosDistribuidos = distribuirMontos(prestamo.getCantidadCuotas(), totalADevolver);

        return construirCuotasAutomaticas(prestamo, montosDistribuidos, numero -> prestamo.getFechaBase().plusMonths(numero - 1L));
    }

    private List<Cuota> generarAutomaticasCadaXDias(Prestamo prestamo, BigDecimal totalADevolver) {
        if (prestamo.getFechaBase() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "fechaBase es obligatoria para cuotas cada X días");
        }

        if (prestamo.getFrecuenciaCadaDias() == null || prestamo.getFrecuenciaCadaDias() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "frecuenciaCadaDias debe ser mayor que 0");
        }

        List<BigDecimal> montosDistribuidos = distribuirMontos(prestamo.getCantidadCuotas(), totalADevolver);

        return construirCuotasAutomaticas(
            prestamo,
            montosDistribuidos,
            numero -> prestamo.getFechaBase().plusDays((long) (numero - 1) * prestamo.getFrecuenciaCadaDias())
        );
    }

    private List<Cuota> construirCuotasAutomaticas(
        Prestamo prestamo,
        List<BigDecimal> montosDistribuidos,
        Function<Integer, LocalDate> fechaPorNumero
    ) {
        return IntStream.rangeClosed(1, prestamo.getCantidadCuotas())
            .mapToObj(numero -> {
                Cuota cuota = new Cuota();
                cuota.setPrestamo(prestamo);
                cuota.setNumeroCuota(numero);
                cuota.setFechaVencimiento(fechaPorNumero.apply(numero));
                cuota.setMontoProgramado(montosDistribuidos.get(numero - 1));
                cuota.setMontoPagado(BigDecimal.ZERO.setScale(2));
                cuota.setEstado(EstadoCuota.PENDIENTE);
                return cuota;
            })
            .toList();
    }

    private List<Cuota> generarManuales(Prestamo prestamo, BigDecimal totalADevolver, GenerarCuotasRequest request) {
        if (request == null || request.cuotasManuales() == null || request.cuotasManuales().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "cuotasManuales es obligatorio para FECHAS_MANUALES");
        }

        List<CuotaManualRequest> cuotasManuales = request.cuotasManuales();

        if (cuotasManuales.size() != prestamo.getCantidadCuotas()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "La cantidad de cuotas manuales debe coincidir con cantidadCuotas del préstamo"
            );
        }

        validarCuotasManuales(cuotasManuales, prestamo.getCantidadCuotas(), totalADevolver);

        return cuotasManuales.stream()
            .sorted(java.util.Comparator.comparing(CuotaManualRequest::numeroCuota))
            .map(cuotaManual -> {
                Cuota cuota = new Cuota();
                cuota.setPrestamo(prestamo);
                cuota.setNumeroCuota(cuotaManual.numeroCuota());
                cuota.setFechaVencimiento(cuotaManual.fechaVencimiento());
                cuota.setMontoProgramado(cuotaManual.montoProgramado().setScale(2));
                cuota.setMontoPagado(BigDecimal.ZERO.setScale(2));
                cuota.setEstado(EstadoCuota.PENDIENTE);
                return cuota;
            })
            .toList();
    }

    private void validarCuotasManuales(List<CuotaManualRequest> cuotasManuales, Integer cantidadCuotas, BigDecimal totalADevolver) {
        Set<Integer> numeros = new HashSet<>();
        BigDecimal sumaMontos = BigDecimal.ZERO.setScale(2);

        for (CuotaManualRequest cuotaManual : cuotasManuales) {
            if (cuotaManual.numeroCuota() == null || cuotaManual.numeroCuota() <= 0 || cuotaManual.numeroCuota() > cantidadCuotas) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "numeroCuota manual inválido");
            }

            if (!numeros.add(cuotaManual.numeroCuota())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No puede haber números de cuota repetidos");
            }

            if (cuotaManual.fechaVencimiento() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "fechaVencimiento es obligatoria en cuota manual");
            }

            if (cuotaManual.montoProgramado() == null || cuotaManual.montoProgramado().compareTo(BigDecimal.ZERO) <= 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "montoProgramado debe ser mayor que 0");
            }

            sumaMontos = sumaMontos.add(cuotaManual.montoProgramado().setScale(2));
        }

        if (sumaMontos.compareTo(totalADevolver.setScale(2)) != 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La suma manual de montos no coincide con totalADevolver");
        }
    }

    private List<BigDecimal> distribuirMontos(Integer cantidadCuotas, BigDecimal totalADevolver) {
        long totalCentavos = totalADevolver.movePointRight(2).longValueExact();
        long montoBaseCentavos = totalCentavos / cantidadCuotas;
        long resto = totalCentavos % cantidadCuotas;

        return IntStream.range(0, cantidadCuotas)
            .mapToObj(indice -> BigDecimal.valueOf(montoBaseCentavos + (indice < resto ? 1 : 0), 2))
            .toList();
    }

    private CuotaResponse mapearRespuesta(Cuota cuota) {
        return new CuotaResponse(
            cuota.getId(),
            cuota.getNumeroCuota(),
            cuota.getFechaVencimiento(),
            cuota.getMontoProgramado().setScale(2),
            cuota.getMontoPagado().setScale(2),
            cuota.getEstado()
        );
    }
}
