package com.cjprestamos.backend.legajo.service;

import org.springframework.core.io.Resource;

public record LegajoAdjuntoDescarga(
    String nombreOriginal,
    String tipoContenido,
    Resource recurso
) {
}
