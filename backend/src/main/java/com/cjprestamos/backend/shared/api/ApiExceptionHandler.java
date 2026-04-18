package com.cjprestamos.backend.shared.api;

import java.time.LocalDateTime;
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
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        List<Map<String, String>> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(this::mapFieldError)
                .toList();

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Bad Request");
        body.put("message", "Error de validación");
        body.put("detail", errors.isEmpty() ? "Request inválido" : errors.get(0).get("message"));
        body.put("errors", errors);

        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> handleResponseStatus(ResponseStatusException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", ex.getStatusCode().value());
        body.put("error", ex.getStatusCode().toString());
        body.put("message", ex.getReason());
        body.put("detail", ex.getReason());

        return ResponseEntity.status(ex.getStatusCode()).body(body);
    }

    @ExceptionHandler(ErrorResponseException.class)
    public ResponseEntity<Map<String, Object>> handleErrorResponse(ErrorResponseException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", ex.getStatusCode().value());
        body.put("error", ex.getStatusCode().toString());
        body.put("message", ex.getBody().getTitle());
        body.put("detail", ex.getBody().getDetail());

        return ResponseEntity.status(ex.getStatusCode()).body(body);
    }

    private Map<String, String> mapFieldError(FieldError error) {
        Map<String, String> item = new LinkedHashMap<>();
        item.put("field", error.getField());
        item.put("message", error.getDefaultMessage());
        return item;
    }
}