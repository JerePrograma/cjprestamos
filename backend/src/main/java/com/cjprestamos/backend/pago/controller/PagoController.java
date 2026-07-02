package com.cjprestamos.backend.pago.controller;

import com.cjprestamos.backend.pago.dto.PagoResponse;
import com.cjprestamos.backend.pago.dto.RegistroPagoRequest;
import com.cjprestamos.backend.pago.service.PagoService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class PagoController {

    private final PagoService pagoService;

    public PagoController(PagoService pagoService) {
        this.pagoService = pagoService;
    }

    @PostMapping("/pagos")
    @ResponseStatus(HttpStatus.CREATED)
    public PagoResponse registrar(
            @Valid @RequestBody RegistroPagoRequest request,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey
    ) {
        return pagoService.registrar(request, idempotencyKey);
    }

    @PostMapping("/prestamos/{prestamoId}/pagos/{pagoId}/anulacion")
    public PagoResponse anular(@PathVariable Long prestamoId, @PathVariable Long pagoId) {
        return pagoService.anular(prestamoId, pagoId);
    }

    @GetMapping("/prestamos/{prestamoId}/pagos")
    public List<PagoResponse> listarPorPrestamo(@PathVariable Long prestamoId) {
        return pagoService.listarPorPrestamo(prestamoId);
    }
}
