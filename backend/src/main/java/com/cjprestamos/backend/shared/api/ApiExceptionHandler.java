package com.cjprestamos.backend.shared.api;

import com.cjprestamos.backend.common.audit.AuditoriaProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.ErrorResponseException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class ApiExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(ApiExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        List<Map<String, String>> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(this::mapFieldError)
                .toList();

        Map<String, Object> body = crearBodyBase(HttpStatus.BAD_REQUEST, "Error de validación",
                errors.isEmpty() ? "Request inválido" : errors.get(0).get("message"));
        body.put("errors", errors);

        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, Object>> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        String nombreParametro = ex.getName();
        Map<String, Object> body = crearBodyBase(HttpStatus.BAD_REQUEST,
                "Parámetro inválido",
                "El parámetro " + nombreParametro + " tiene un formato inválido");

        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> handleResponseStatus(ResponseStatusException ex) {
        Map<String, Object> body = crearBodyBase(HttpStatus.valueOf(ex.getStatusCode().value()),
                ex.getReason(), ex.getReason());

        return ResponseEntity.status(ex.getStatusCode()).body(body);
    }

    @ExceptionHandler(ErrorResponseException.class)
    public ResponseEntity<Map<String, Object>> handleErrorResponse(ErrorResponseException ex) {
        Map<String, Object> body = crearBodyBase(HttpStatus.valueOf(ex.getStatusCode().value()),
                ex.getBody().getTitle(), ex.getBody().getDetail());

        return ResponseEntity.status(ex.getStatusCode()).body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleUnexpected(Exception ex) {
        log.error("Excepción inesperada no controlada", ex);
        Map<String, Object> body = crearBodyBase(HttpStatus.INTERNAL_SERVER_ERROR,
                "Error interno del servidor",
                "Ocurrió un error inesperado. Intentá nuevamente.");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }

    private Map<String, Object> crearBodyBase(HttpStatus status, String message, String detail) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", AuditoriaProvider.ahora());
        body.put("status", status.value());
        body.put("error", status.toString());
        body.put("message", message);
        body.put("detail", detail);
        return body;
    }

    private Map<String, String> mapFieldError(FieldError error) {
        Map<String, String> item = new LinkedHashMap<>();
        item.put("field", error.getField());
        item.put("message", error.getDefaultMessage());
        return item;
    }
}
