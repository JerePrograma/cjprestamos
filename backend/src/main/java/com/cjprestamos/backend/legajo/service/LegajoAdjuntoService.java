package com.cjprestamos.backend.legajo.service;

import com.cjprestamos.backend.legajo.dto.LegajoAdjuntoResponse;
import com.cjprestamos.backend.legajo.model.LegajoAdjunto;
import com.cjprestamos.backend.legajo.model.LegajoPersona;
import com.cjprestamos.backend.legajo.repository.LegajoAdjuntoRepository;
import com.cjprestamos.backend.legajo.repository.LegajoPersonaRepository;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.text.Normalizer;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class LegajoAdjuntoService {

    private static final Set<String> TIPOS_PERMITIDOS = Set.of(
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/webp",
        "text/plain"
    );

    private final LegajoAdjuntoRepository legajoAdjuntoRepository;
    private final LegajoPersonaRepository legajoPersonaRepository;
    private final Path directorioBase;
    private final long tamanoMaximoBytes;

    public LegajoAdjuntoService(
        LegajoAdjuntoRepository legajoAdjuntoRepository,
        LegajoPersonaRepository legajoPersonaRepository,
        @Value("${app.legajo.adjuntos.directorio:./storage/legajos}") String directorioBase,
        @Value("${app.legajo.adjuntos.tamano-maximo-bytes:5242880}") long tamanoMaximoBytes
    ) {
        this.legajoAdjuntoRepository = legajoAdjuntoRepository;
        this.legajoPersonaRepository = legajoPersonaRepository;
        this.directorioBase = Path.of(directorioBase).toAbsolutePath().normalize();
        this.tamanoMaximoBytes = tamanoMaximoBytes;
    }

    @Transactional(readOnly = true)
    public List<LegajoAdjuntoResponse> listarPorPersona(Long personaId) {
        validarLegajoExiste(personaId);
        return legajoAdjuntoRepository.findByLegajoPersonaPersonaIdOrderByCreatedAtDesc(personaId)
            .stream()
            .map(this::aResponse)
            .toList();
    }

    public LegajoAdjuntoResponse subir(Long personaId, MultipartFile archivo) {
        LegajoPersona legajoPersona = obtenerLegajo(personaId);
        validarArchivo(archivo);

        String nombreOriginal = normalizarNombre(archivo.getOriginalFilename());
        String extension = extraerExtension(nombreOriginal);
        String nombreStorage = UUID.randomUUID() + extension;

        Path directorioPersona = directorioBase.resolve("persona-" + personaId).normalize();
        Path destino = directorioPersona.resolve(nombreStorage).normalize();

        if (!destino.startsWith(directorioPersona)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nombre de archivo inválido.");
        }

        try {
            Files.createDirectories(directorioPersona);
            try (InputStream inputStream = archivo.getInputStream()) {
                Files.copy(inputStream, destino, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "No se pudo guardar el adjunto.");
        }

        LegajoAdjunto legajoAdjunto = new LegajoAdjunto();
        legajoAdjunto.setLegajoPersona(legajoPersona);
        legajoAdjunto.setNombreOriginal(nombreOriginal);
        legajoAdjunto.setNombreArchivoStorage(nombreStorage);
        legajoAdjunto.setTipoContenido(archivo.getContentType().trim().toLowerCase());
        legajoAdjunto.setTamanoBytes(archivo.getSize());

        return aResponse(legajoAdjuntoRepository.save(legajoAdjunto));
    }

    @Transactional(readOnly = true)
    public LegajoAdjuntoDescarga descargar(Long personaId, Long adjuntoId) {
        LegajoAdjunto adjunto = obtenerAdjunto(personaId, adjuntoId);
        Path archivo = pathArchivo(personaId, adjunto.getNombreArchivoStorage());

        if (!Files.exists(archivo)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "El archivo adjunto no existe en storage.");
        }

        try {
            Resource recurso = new UrlResource(archivo.toUri());
            return new LegajoAdjuntoDescarga(adjunto.getNombreOriginal(), adjunto.getTipoContenido(), recurso);
        } catch (MalformedURLException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "No se pudo abrir el archivo adjunto.");
        }
    }

    public void eliminar(Long personaId, Long adjuntoId) {
        LegajoAdjunto adjunto = obtenerAdjunto(personaId, adjuntoId);
        Path archivo = pathArchivo(personaId, adjunto.getNombreArchivoStorage());

        try {
            Files.deleteIfExists(archivo);
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "No se pudo eliminar el archivo adjunto.");
        }

        legajoAdjuntoRepository.delete(adjunto);
    }

    private void validarLegajoExiste(Long personaId) {
        if (!legajoPersonaRepository.existsByPersonaId(personaId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Legajo no encontrado para la persona.");
        }
    }

    private LegajoPersona obtenerLegajo(Long personaId) {
        return legajoPersonaRepository.findByPersonaId(personaId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Legajo no encontrado para la persona."));
    }

    private LegajoAdjunto obtenerAdjunto(Long personaId, Long adjuntoId) {
        validarLegajoExiste(personaId);
        return legajoAdjuntoRepository.findByIdAndLegajoPersonaPersonaId(adjuntoId, personaId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Adjunto no encontrado para la persona."));
    }

    private Path pathArchivo(Long personaId, String nombreStorage) {
        return directorioBase.resolve("persona-" + personaId).resolve(nombreStorage).normalize();
    }

    private void validarArchivo(MultipartFile archivo) {
        if (archivo == null || archivo.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El archivo es obligatorio.");
        }

        if (archivo.getSize() > tamanoMaximoBytes) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El archivo supera el tamaño máximo permitido.");
        }

        String tipoContenido = archivo.getContentType();
        if (tipoContenido == null || !TIPOS_PERMITIDOS.contains(tipoContenido.trim().toLowerCase())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tipo de archivo no permitido.");
        }

        normalizarNombre(archivo.getOriginalFilename());
    }

    private String normalizarNombre(String nombreOriginal) {
        String valor = nombreOriginal == null ? "" : nombreOriginal.trim();
        if (valor.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El nombre del archivo es obligatorio.");
        }

        String sinDiacriticos = Normalizer.normalize(valor, Normalizer.Form.NFD)
            .replaceAll("\\p{M}", "");
        String limpio = sinDiacriticos.replaceAll("[^A-Za-z0-9._()\\- ]", "_");

        if (limpio.length() > 180) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El nombre del archivo es demasiado largo.");
        }

        return limpio;
    }

    private String extraerExtension(String nombreArchivo) {
        int posicion = nombreArchivo.lastIndexOf('.');
        if (posicion < 0 || posicion == nombreArchivo.length() - 1) {
            return "";
        }

        String extension = nombreArchivo.substring(posicion).toLowerCase();
        return extension.length() > 10 ? "" : extension;
    }

    private LegajoAdjuntoResponse aResponse(LegajoAdjunto adjunto) {
        return new LegajoAdjuntoResponse(
            adjunto.getId(),
            adjunto.getLegajoPersona().getPersona().getId(),
            adjunto.getNombreOriginal(),
            adjunto.getTipoContenido(),
            adjunto.getTamanoBytes(),
            adjunto.getCreatedAt()
        );
    }
}
