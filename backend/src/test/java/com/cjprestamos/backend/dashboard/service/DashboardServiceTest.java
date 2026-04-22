package com.cjprestamos.backend.dashboard.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

import com.cjprestamos.backend.cuota.model.Cuota;
import com.cjprestamos.backend.cuota.repository.CuotaRepository;
import com.cjprestamos.backend.dashboard.dto.DashboardControlCajaResponse;
import com.cjprestamos.backend.dashboard.dto.DashboardResumenResponse;
import com.cjprestamos.backend.pago.model.Pago;
import com.cjprestamos.backend.pago.model.enums.EstadoPago;
import com.cjprestamos.backend.pago.repository.PagoRepository;
import com.cjprestamos.backend.persona.model.Persona;
import com.cjprestamos.backend.prestamo.dto.CalculoPrestamoResultado;
import com.cjprestamos.backend.prestamo.model.Prestamo;
import com.cjprestamos.backend.prestamo.model.enums.EstadoPrestamo;
import com.cjprestamos.backend.prestamo.model.enums.FrecuenciaTipo;
import com.cjprestamos.backend.prestamo.repository.PrestamoRepository;
import com.cjprestamos.backend.prestamo.service.CalculadoraPrestamoService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private PrestamoRepository prestamoRepository;

    @Mock
    private CuotaRepository cuotaRepository;

    @Mock
    private PagoRepository pagoRepository;

    @Mock
    private CalculadoraPrestamoService calculadoraPrestamoService;

    private DashboardService dashboardService;

    @BeforeEach
    void setUp() {
        dashboardService = new DashboardService(prestamoRepository, cuotaRepository, pagoRepository, calculadoraPrestamoService);
    }

    @Test
    void obtenerResumen_deberiaCalcularMetricasSoloConActivos() {
        Prestamo prestamoActivoConCuotas = crearPrestamo(1L, "1000.00", EstadoPrestamo.ACTIVO);
        Prestamo prestamoActivoSinCuotas = crearPrestamo(2L, "500.00", EstadoPrestamo.ACTIVO);

        when(prestamoRepository.findByEstadoOrderByCreatedAtDesc(EstadoPrestamo.ACTIVO))
            .thenReturn(List.of(prestamoActivoConCuotas, prestamoActivoSinCuotas));

        Cuota cuota1 = crearCuota(prestamoActivoConCuotas, 1, "600.00", "300.00", LocalDate.of(2026, 4, 10));
        Cuota cuota2 = crearCuota(prestamoActivoConCuotas, 2, "600.00", "0.00", LocalDate.of(2026, 5, 10));
        when(cuotaRepository.findByPrestamoIdIn(List.of(1L, 2L))).thenReturn(List.of(cuota1, cuota2));

        Pago pago1 = crearPago(prestamoActivoConCuotas, "700.00", EstadoPago.REGISTRADO, LocalDate.of(2026, 4, 10));
        Pago pago2 = crearPago(prestamoActivoSinCuotas, "200.00", EstadoPago.REGISTRADO, LocalDate.of(2026, 4, 18));
        when(pagoRepository.findByPrestamoIdInAndEstado(List.of(1L, 2L), EstadoPago.REGISTRADO))
            .thenReturn(List.of(pago1, pago2));

        when(calculadoraPrestamoService.calcular(org.mockito.ArgumentMatchers.any())).thenAnswer(invocation -> {
            var entrada = invocation.getArgument(0, com.cjprestamos.backend.prestamo.dto.CalculoPrestamoEntrada.class);
            if (entrada.montoInicial().compareTo(new BigDecimal("1000.00")) == 0) {
                return new CalculoPrestamoResultado(
                    new BigDecimal("200.00"),
                    new BigDecimal("1200.00"),
                    new BigDecimal("600.00"),
                    new BigDecimal("1000.00"),
                    new BigDecimal("200.00"),
                    new BigDecimal("200.00")
                );
            }

            return new CalculoPrestamoResultado(
                new BigDecimal("100.00"),
                new BigDecimal("600.00"),
                new BigDecimal("300.00"),
                new BigDecimal("500.00"),
                new BigDecimal("100.00"),
                new BigDecimal("100.00")
            );
        });

        DashboardResumenResponse resumen = dashboardService.obtenerResumen();

        assertEquals(2L, resumen.prestamosActivos());
        assertEquals(new BigDecimal("1500.00"), resumen.montoInvertido());
        assertEquals(new BigDecimal("0.00"), resumen.montoGanado());
        assertEquals(new BigDecimal("300.00"), resumen.montoPorGanar());
        assertEquals(new BigDecimal("1300.00"), resumen.deudaTotal());
    }

    @Test
    void obtenerResumen_sinActivos_deberiaRetornarTodoEnCero() {
        when(prestamoRepository.findByEstadoOrderByCreatedAtDesc(EstadoPrestamo.ACTIVO)).thenReturn(List.of());

        DashboardResumenResponse resumen = dashboardService.obtenerResumen();

        assertEquals(0L, resumen.prestamosActivos());
        assertEquals(new BigDecimal("0.00"), resumen.montoInvertido());
        assertEquals(new BigDecimal("0.00"), resumen.montoGanado());
        assertEquals(new BigDecimal("0.00"), resumen.montoPorGanar());
        assertEquals(new BigDecimal("0.00"), resumen.deudaTotal());
    }

    @Test
    void obtenerResumen_deberiaCapearGanadoAlInteresTotal() {
        Prestamo prestamo = crearPrestamo(5L, "1000.00", EstadoPrestamo.ACTIVO);
        when(prestamoRepository.findByEstadoOrderByCreatedAtDesc(EstadoPrestamo.ACTIVO)).thenReturn(List.of(prestamo));
        when(cuotaRepository.findByPrestamoIdIn(List.of(5L))).thenReturn(List.of());
        when(pagoRepository.findByPrestamoIdInAndEstado(List.of(5L), EstadoPago.REGISTRADO))
            .thenReturn(List.of(crearPago(prestamo, "1800.00", EstadoPago.REGISTRADO, LocalDate.of(2026, 4, 10))));

        when(calculadoraPrestamoService.calcular(org.mockito.ArgumentMatchers.any())).thenReturn(
            new CalculoPrestamoResultado(
                new BigDecimal("200.00"),
                new BigDecimal("1200.00"),
                new BigDecimal("600.00"),
                new BigDecimal("1000.00"),
                new BigDecimal("200.00"),
                new BigDecimal("200.00")
            )
        );

        DashboardResumenResponse resumen = dashboardService.obtenerResumen();

        assertEquals(new BigDecimal("200.00"), resumen.montoGanado());
        assertEquals(new BigDecimal("0.00"), resumen.montoPorGanar());
        assertEquals(new BigDecimal("0.00"), resumen.deudaTotal());
    }

    @Test
    void obtenerResumen_activoSinPagos_deberiaReflejarDeudaYPorGanarCompletos() {
        Prestamo prestamo = crearPrestamo(6L, "1000.00", EstadoPrestamo.ACTIVO);
        when(prestamoRepository.findByEstadoOrderByCreatedAtDesc(EstadoPrestamo.ACTIVO)).thenReturn(List.of(prestamo));
        when(cuotaRepository.findByPrestamoIdIn(List.of(6L))).thenReturn(List.of());
        when(pagoRepository.findByPrestamoIdInAndEstado(List.of(6L), EstadoPago.REGISTRADO)).thenReturn(List.of());

        when(calculadoraPrestamoService.calcular(org.mockito.ArgumentMatchers.any())).thenReturn(
            new CalculoPrestamoResultado(
                new BigDecimal("200.00"),
                new BigDecimal("1200.00"),
                new BigDecimal("600.00"),
                new BigDecimal("1000.00"),
                new BigDecimal("200.00"),
                new BigDecimal("200.00")
            )
        );

        DashboardResumenResponse resumen = dashboardService.obtenerResumen();

        assertEquals(1L, resumen.prestamosActivos());
        assertEquals(new BigDecimal("1000.00"), resumen.montoInvertido());
        assertEquals(new BigDecimal("0.00"), resumen.montoGanado());
        assertEquals(new BigDecimal("200.00"), resumen.montoPorGanar());
        assertEquals(new BigDecimal("1200.00"), resumen.deudaTotal());
    }

    @Test
    void obtenerResumen_conPagosParciales_deberiaMantenerGanadoYPorGanarConsistentes() {
        Prestamo prestamo = crearPrestamo(7L, "1000.00", EstadoPrestamo.ACTIVO);
        when(prestamoRepository.findByEstadoOrderByCreatedAtDesc(EstadoPrestamo.ACTIVO)).thenReturn(List.of(prestamo));
        when(cuotaRepository.findByPrestamoIdIn(List.of(7L))).thenReturn(List.of());
        when(pagoRepository.findByPrestamoIdInAndEstado(List.of(7L), EstadoPago.REGISTRADO))
            .thenReturn(List.of(crearPago(prestamo, "1100.00", EstadoPago.REGISTRADO, LocalDate.of(2026, 4, 10))));

        when(calculadoraPrestamoService.calcular(org.mockito.ArgumentMatchers.any())).thenReturn(
            new CalculoPrestamoResultado(
                new BigDecimal("200.00"),
                new BigDecimal("1200.00"),
                new BigDecimal("600.00"),
                new BigDecimal("1000.00"),
                new BigDecimal("200.00"),
                new BigDecimal("200.00")
            )
        );

        DashboardResumenResponse resumen = dashboardService.obtenerResumen();

        assertEquals(new BigDecimal("100.00"), resumen.montoGanado());
        assertEquals(new BigDecimal("100.00"), resumen.montoPorGanar());
        assertEquals(new BigDecimal("100.00"), resumen.deudaTotal());
    }

    @Test
    void obtenerResumen_conCuotas_deberiaCalcularDeudaDesdeCuotasYPriorizarSaldoReal() {
        Prestamo prestamo = crearPrestamo(8L, "1000.00", EstadoPrestamo.ACTIVO);
        when(prestamoRepository.findByEstadoOrderByCreatedAtDesc(EstadoPrestamo.ACTIVO)).thenReturn(List.of(prestamo));
        when(cuotaRepository.findByPrestamoIdIn(List.of(8L))).thenReturn(List.of(
            crearCuota(prestamo, 1, "600.00", "600.00", LocalDate.of(2026, 4, 10)),
            crearCuota(prestamo, 2, "600.00", "500.00", LocalDate.of(2026, 5, 10))
        ));
        when(pagoRepository.findByPrestamoIdInAndEstado(List.of(8L), EstadoPago.REGISTRADO))
            .thenReturn(List.of(crearPago(prestamo, "500.00", EstadoPago.REGISTRADO, LocalDate.of(2026, 4, 10))));

        when(calculadoraPrestamoService.calcular(org.mockito.ArgumentMatchers.any())).thenReturn(
            new CalculoPrestamoResultado(
                new BigDecimal("200.00"),
                new BigDecimal("1200.00"),
                new BigDecimal("600.00"),
                new BigDecimal("1000.00"),
                new BigDecimal("200.00"),
                new BigDecimal("200.00")
            )
        );

        DashboardResumenResponse resumen = dashboardService.obtenerResumen();

        assertEquals(new BigDecimal("100.00"), resumen.deudaTotal());
    }

    @Test
    void obtenerControlCaja_deberiaCalcularIndicadoresContablesYProyecciones() {
        Prestamo prestamo = crearPrestamo(11L, "1000.00", EstadoPrestamo.ACTIVO);
        setCreatedAt(prestamo, LocalDateTime.now().withDayOfMonth(3));

        when(prestamoRepository.findByEstadoOrderByCreatedAtDesc(EstadoPrestamo.ACTIVO)).thenReturn(List.of(prestamo));
        when(cuotaRepository.findByPrestamoIdIn(List.of(11L))).thenReturn(List.of(
            crearCuota(prestamo, 1, "600.00", "300.00", LocalDate.now().plusDays(5)),
            crearCuota(prestamo, 2, "600.00", "0.00", LocalDate.now().plusDays(40)),
            crearCuota(prestamo, 3, "200.00", "0.00", LocalDate.now().minusDays(2))
        ));

        when(pagoRepository.findByPrestamoIdInAndEstado(List.of(11L), EstadoPago.REGISTRADO)).thenReturn(List.of(
            crearPago(prestamo, "900.00", EstadoPago.REGISTRADO, LocalDate.now().minusDays(1))
        ));

        when(calculadoraPrestamoService.calcular(org.mockito.ArgumentMatchers.any())).thenReturn(
            new CalculoPrestamoResultado(
                new BigDecimal("200.00"),
                new BigDecimal("1200.00"),
                new BigDecimal("400.00"),
                new BigDecimal("1000.00"),
                new BigDecimal("200.00"),
                new BigDecimal("200.00")
            )
        );

        DashboardControlCajaResponse controlCaja = dashboardService.obtenerControlCaja();

        assertEquals(new BigDecimal("900.00"), controlCaja.cajaDisponible());
        assertEquals(new BigDecimal("900.00"), controlCaja.ingresosMesActual());
        assertEquals(new BigDecimal("1000.00"), controlCaja.egresosMesActual());
        assertEquals(new BigDecimal("-100.00"), controlCaja.balanceMesActual());
        assertEquals(new BigDecimal("300.00"), controlCaja.proyeccionCobro30Dias());
        assertEquals(new BigDecimal("900.00"), controlCaja.proyeccionCobro60Dias());
        assertEquals(new BigDecimal("200.00"), controlCaja.carteraEnMora());
        assertEquals(3L, controlCaja.cuotasPendientes());
        assertEquals(1L, controlCaja.cuotasVencenProximos7Dias());
        assertEquals(new BigDecimal("90.00"), controlCaja.recuperoCapitalPorcentaje());
        assertEquals(new BigDecimal("20.00"), controlCaja.rendimientoEsperadoPorcentaje());
    }

    @Test
    void obtenerControlCaja_sinActivos_deberiaRetornarTodoEnCero() {
        when(prestamoRepository.findByEstadoOrderByCreatedAtDesc(EstadoPrestamo.ACTIVO)).thenReturn(List.of());

        DashboardControlCajaResponse controlCaja = dashboardService.obtenerControlCaja();

        assertEquals(new BigDecimal("0.00"), controlCaja.cajaDisponible());
        assertEquals(0L, controlCaja.cuotasPendientes());
        assertEquals(new BigDecimal("0.00"), controlCaja.proyeccionCobro90Dias());
    }

    private Prestamo crearPrestamo(Long id, String montoInicial, EstadoPrestamo estado) {
        Prestamo prestamo = new Prestamo();
        Persona persona = new Persona();
        persona.setNombre("Persona " + id);

        prestamo.setPersona(persona);
        prestamo.setMontoInicial(new BigDecimal(montoInicial));
        prestamo.setCantidadCuotas(2);
        prestamo.setFrecuenciaTipo(FrecuenciaTipo.MENSUAL);
        prestamo.setFechaBase(LocalDate.of(2026, 4, 1));
        prestamo.setUsarFechasManuales(false);
        prestamo.setEstado(estado);

        try {
            var field = Prestamo.class.getDeclaredField("id");
            field.setAccessible(true);
            field.set(prestamo, id);
        } catch (ReflectiveOperationException e) {
            throw new IllegalStateException(e);
        }

        return prestamo;
    }

    private Cuota crearCuota(Prestamo prestamo, int numero, String montoProgramado, String montoPagado, LocalDate fechaVencimiento) {
        Cuota cuota = new Cuota();
        cuota.setPrestamo(prestamo);
        cuota.setNumeroCuota(numero);
        cuota.setMontoProgramado(new BigDecimal(montoProgramado));
        cuota.setMontoPagado(new BigDecimal(montoPagado));
        cuota.setFechaVencimiento(fechaVencimiento);
        return cuota;
    }

    private Pago crearPago(Prestamo prestamo, String monto, EstadoPago estado, LocalDate fechaPago) {
        Pago pago = new Pago();
        pago.setPrestamo(prestamo);
        pago.setFechaPago(fechaPago);
        pago.setMonto(new BigDecimal(monto));
        pago.setEstado(estado);
        return pago;
    }

    private void setCreatedAt(Prestamo prestamo, LocalDateTime createdAt) {
        try {
            var field = prestamo.getClass().getSuperclass().getDeclaredField("createdAt");
            field.setAccessible(true);
            field.set(prestamo, createdAt);
        } catch (ReflectiveOperationException e) {
            throw new IllegalStateException(e);
        }
    }
}
