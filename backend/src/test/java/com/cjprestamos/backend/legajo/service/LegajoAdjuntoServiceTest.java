package com.cjprestamos.backend.legajo.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.cjprestamos.backend.legajo.dto.LegajoAdjuntoResponse;
import com.cjprestamos.backend.legajo.model.LegajoAdjunto;
import com.cjprestamos.backend.legajo.model.LegajoPersona;
import com.cjprestamos.backend.legajo.repository.LegajoAdjuntoRepository;
import com.cjprestamos.backend.legajo.repository.LegajoPersonaRepository;
import com.cjprestamos.backend.persona.model.Persona;
import java.nio.file.Path;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class LegajoAdjuntoServiceTest {

    @Mock
    private LegajoAdjuntoRepository legajoAdjuntoRepository;

    @Mock
    private LegajoPersonaRepository legajoPersonaRepository;

    @TempDir
    Path tempDir;

    private LegajoAdjuntoService legajoAdjuntoService;

    @BeforeEach
    void setUp() {
        legajoAdjuntoService = new LegajoAdjuntoService(
            legajoAdjuntoRepository,
            legajoPersonaRepository,
            tempDir.toString(),
            5_242_880
        );
    }

    @Test
    void subir_deberiaGuardarMetadataYArchivo() {
        Persona persona = new Persona();
        persona.setNombre("Ana");

        LegajoPersona legajo = new LegajoPersona();
        legajo.setPersona(persona);

        when(legajoPersonaRepository.findByPersonaId(3L)).thenReturn(Optional.of(legajo));
        when(legajoAdjuntoRepository.save(any(LegajoAdjunto.class))).thenAnswer(invocation -> invocation.getArgument(0));

        MockMultipartFile archivo = new MockMultipartFile(
            "archivo",
            "recibo.pdf",
            "application/pdf",
            "contenido".getBytes()
        );

        LegajoAdjuntoResponse response = legajoAdjuntoService.subir(3L, archivo);

        assertEquals("recibo.pdf", response.nombreOriginal());
        assertEquals("application/pdf", response.tipoContenido());
        verify(legajoAdjuntoRepository).save(any(LegajoAdjunto.class));
    }

    @Test
    void subir_conTipoNoPermitido_deberiaFallar() {
        Persona persona = new Persona();
        LegajoPersona legajo = new LegajoPersona();
        legajo.setPersona(persona);
        when(legajoPersonaRepository.findByPersonaId(3L)).thenReturn(Optional.of(legajo));

        MockMultipartFile archivo = new MockMultipartFile(
            "archivo",
            "script.exe",
            "application/octet-stream",
            "x".getBytes()
        );

        ResponseStatusException exception = assertThrows(
            ResponseStatusException.class,
            () -> legajoAdjuntoService.subir(3L, archivo)
        );

        assertEquals(400, exception.getStatusCode().value());
    }
}
