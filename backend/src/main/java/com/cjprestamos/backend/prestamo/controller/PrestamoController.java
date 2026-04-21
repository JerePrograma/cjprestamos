package com.cjprestamos.backend.prestamo.controller;

import com.cjprestamos.backend.prestamo.dto.ActualizacionReferenciaPrestamoRequest;
import com.cjprestamos.backend.prestamo.dto.CalculoPrestamoEntrada;
import com.cjprestamos.backend.prestamo.dto.CalculoPrestamoResultado;
import com.cjprestamos.backend.prestamo.dto.PrestamoRequest;
import com.cjprestamos.backend.prestamo.dto.PrestamoResponse;
import com.cjprestamos.backend.prestamo.dto.SimulacionPrestamoRequest;
import com.cjprestamos.backend.prestamo.dto.SimulacionPrestamoResponse;
import com.cjprestamos.backend.prestamo.service.PrestamoService;
import com.cjprestamos.backend.prestamo.service.SimuladorPrestamoService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/prestamos")
public class PrestamoController {

    private final PrestamoService prestamoService;
    private final SimuladorPrestamoService simuladorPrestamoService;

    public PrestamoController(PrestamoService prestamoService, SimuladorPrestamoService simuladorPrestamoService) {
        this.prestamoService = prestamoService;
        this.simuladorPrestamoService = simuladorPrestamoService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PrestamoResponse crear(@Valid @RequestBody PrestamoRequest request) {
        return prestamoService.crear(request);
    }

    @PostMapping("/calcular")
    public CalculoPrestamoResultado calcular(@Valid @RequestBody CalculoPrestamoEntrada request) {
        return prestamoService.calcular(request);
    }


    @PostMapping("/simulador")
    public SimulacionPrestamoResponse simular(@Valid @RequestBody SimulacionPrestamoRequest request) {
        return simuladorPrestamoService.simular(request);
    }

    @PostMapping(value = "/simulador/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> generarPdfSimulacion(@Valid @RequestBody SimulacionPrestamoRequest request) {
        byte[] pdf = simuladorPrestamoService.generarPdfSimulacion(request);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.attachment().filename("simulacion-prestamo.pdf").build());

        return ResponseEntity.ok().headers(headers).body(pdf);
    }

    @PutMapping("/{id}/referencia")
    public PrestamoResponse actualizarReferencia(
        @PathVariable Long id,
        @Valid @RequestBody ActualizacionReferenciaPrestamoRequest request
    ) {
        return prestamoService.actualizarReferencia(id, request);
    }

    @GetMapping
    public List<PrestamoResponse> listar() {
        return prestamoService.listar();
    }

    @GetMapping("/{id}")
    public PrestamoResponse obtenerPorId(@PathVariable Long id) {
        return prestamoService.obtenerPorId(id);
    }

    @GetMapping("/activos")
    public List<PrestamoResponse> listarActivos() {
        return prestamoService.listarActivos();
    }
}
