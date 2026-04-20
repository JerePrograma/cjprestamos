package com.cjprestamos.backend.legajo.controller;

import com.cjprestamos.backend.legajo.dto.LegajoAdjuntoResponse;
import com.cjprestamos.backend.legajo.service.LegajoAdjuntoDescarga;
import com.cjprestamos.backend.legajo.service.LegajoAdjuntoService;
import java.nio.charset.StandardCharsets;
import java.util.List;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/personas/{personaId}/legajo/adjuntos")
public class LegajoAdjuntoController {

    private final LegajoAdjuntoService legajoAdjuntoService;

    public LegajoAdjuntoController(LegajoAdjuntoService legajoAdjuntoService) {
        this.legajoAdjuntoService = legajoAdjuntoService;
    }

    @GetMapping
    public List<LegajoAdjuntoResponse> listar(@PathVariable Long personaId) {
        return legajoAdjuntoService.listarPorPersona(personaId);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public LegajoAdjuntoResponse subir(@PathVariable Long personaId, @RequestParam("archivo") MultipartFile archivo) {
        return legajoAdjuntoService.subir(personaId, archivo);
    }

    @GetMapping("/{adjuntoId}/descargar")
    public ResponseEntity<Resource> descargar(@PathVariable Long personaId, @PathVariable Long adjuntoId) {
        LegajoAdjuntoDescarga descarga = legajoAdjuntoService.descargar(personaId, adjuntoId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentDisposition(ContentDisposition.attachment()
            .filename(descarga.nombreOriginal(), StandardCharsets.UTF_8)
            .build());

        return ResponseEntity.ok()
            .headers(headers)
            .contentType(MediaType.parseMediaType(descarga.tipoContenido()))
            .body(descarga.recurso());
    }

    @DeleteMapping("/{adjuntoId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long personaId, @PathVariable Long adjuntoId) {
        legajoAdjuntoService.eliminar(personaId, adjuntoId);
    }
}
