package com.gobang.gobang.domain.admin.web;

import com.gobang.gobang.global.exception.CustomException;
import com.gobang.gobang.global.exception.ErrorCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

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

    // ✅ 1) CustomException 핸들러 추가
    @ExceptionHandler(CustomException.class)
    public ResponseEntity<?> handleCustom(CustomException e) {
        ErrorCode errorCode = e.getErrorCode();

        return ResponseEntity
                .status(errorCode.getStatus())  // ErrorCode에 들어있는 HttpStatus 사용
                .body(
                        Map.of(
                                "error", Map.of(
                                        "code", errorCode.getCode(),      // "M002" 같은 코드
                                        "message", errorCode.getMessage()  // "Login input is invalid"
                                )
                        )
                );
    }
}
