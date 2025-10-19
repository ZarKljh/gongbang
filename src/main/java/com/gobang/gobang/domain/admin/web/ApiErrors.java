package com.gobang.gobang.domain.admin.web;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.NoSuchElementException;

@RestControllerAdvice
public class ApiErrors {

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<?> notFound(NoSuchElementException e) {
        return ResponseEntity.status(404).body(
                Map.of("error", Map.of("code","NOT_FOUND","message", e.getMessage()))
        );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> validation(MethodArgumentNotValidException e) {
        var fe = e.getBindingResult().getFieldError();
        return ResponseEntity.badRequest().body(
                Map.of("error", Map.of("code","VALIDATION_ERROR",
                        "message", fe != null ? fe.getDefaultMessage() : "invalid"))
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> internal(Exception e) {
        return ResponseEntity.status(500).body(
                Map.of("error", Map.of("code","INTERNAL","message", e.getMessage()))
        );
    }
}
