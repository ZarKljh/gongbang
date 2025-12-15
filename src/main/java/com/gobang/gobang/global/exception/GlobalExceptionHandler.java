package com.gobang.gobang.global.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

//    @ExceptionHandler(MethodArgumentNotValidException.class)
//    protected ResponseEntity<ErrorResponse> handleMethodArgumentNotValidException(MethodArgumentNotValidException e) {
//        final ErrorResponse response = ErrorResponse.of(ErrorCode.INVALID_INPUT_VALUE);
//        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
//    }
//
//    @ExceptionHandler(CustomException.class)
//    protected ResponseEntity<ErrorResponse> handleCustomException(CustomException e) {
//        final ErrorCode errorCode = e.getErrorCode();
//        final ErrorResponse response = ErrorResponse.of(errorCode);
//        log.error("[CustomException] code={}, status={}, msg={}",
//                e.getErrorCode(), e.getErrorCode().getStatus(), e.getMessage());
//        System.out.println("🔥 [CustomException] errorCode = " + e.getErrorCode());
//        System.out.println("🔥 [CustomException] status    = " + e.getErrorCode().getStatus());
//        System.out.println("🔥 [CustomException] message   = " + e.getMessage());
//        return new ResponseEntity<>(response, errorCode.getStatus());
//    }
//
//    @ExceptionHandler(Exception.class)
//    protected ResponseEntity<ErrorResponse> handleException(Exception e) {
//        final ErrorResponse response = ErrorResponse.of(ErrorCode.INTERNAL_SERVER_ERROR);
//        log.error("[Exception] type={}, msg={}", e.getClass().getName(), e.getMessage(), e);
//        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
//    }
}
