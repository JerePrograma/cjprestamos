package com.cjprestamos.backend.cuota.dto;

import java.util.List;

public record GenerarCuotasRequest(
    List<CuotaManualRequest> cuotasManuales
) {
}
