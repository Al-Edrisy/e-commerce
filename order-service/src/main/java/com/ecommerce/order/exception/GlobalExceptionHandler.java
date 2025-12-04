package com.ecommerce.order.exception;

import com.ecommerce.order.presentation.dto.ErrorResponseDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Global exception handler for the Order Service.
 * Catches exceptions and converts them to appropriate HTTP responses.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

        private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

        /**
         * Handle ValidationException - returns 400 Bad Request.
         */
        @ExceptionHandler(ValidationException.class)
        public ResponseEntity<ErrorResponseDTO> handleValidationException(ValidationException ex) {
                log.warn("Validation error: {}", ex.getMessage());
                ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                                ex.getErrorCode(),
                                ex.getMessage(),
                                ex.getErrors());
                return ResponseEntity
                                .status(ex.getHttpStatus())
                                .body(errorResponse);
        }

        /**
         * Handle NotFoundException - returns 404 Not Found.
         */
        @ExceptionHandler(NotFoundException.class)
        public ResponseEntity<ErrorResponseDTO> handleNotFoundException(NotFoundException ex) {
                log.warn("Resource not found: {}", ex.getMessage());
                ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                                ex.getErrorCode(),
                                ex.getMessage());
                return ResponseEntity
                                .status(ex.getHttpStatus())
                                .body(errorResponse);
        }

        /**
         * Handle ForbiddenException - returns 403 Forbidden.
         */
        @ExceptionHandler(ForbiddenException.class)
        public ResponseEntity<ErrorResponseDTO> handleForbiddenException(ForbiddenException ex) {
                log.warn("Access forbidden: {}", ex.getMessage());
                ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                                ex.getErrorCode(),
                                ex.getMessage());
                return ResponseEntity
                                .status(ex.getHttpStatus())
                                .body(errorResponse);
        }

        /**
         * Handle UnauthorizedException - returns 401 Unauthorized.
         */
        @ExceptionHandler(UnauthorizedException.class)
        public ResponseEntity<ErrorResponseDTO> handleUnauthorizedException(UnauthorizedException ex) {
                log.warn("Unauthorized access: {}", ex.getMessage());
                ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                                ex.getErrorCode(),
                                ex.getMessage());
                return ResponseEntity
                                .status(ex.getHttpStatus())
                                .body(errorResponse);
        }

        /**
         * Handle ServiceUnavailableException - returns 503 Service Unavailable.
         */
        @ExceptionHandler(ServiceUnavailableException.class)
        public ResponseEntity<ErrorResponseDTO> handleServiceUnavailableException(ServiceUnavailableException ex) {
                log.error("Service unavailable: {}", ex.getMessage(), ex);
                ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                                ex.getErrorCode(),
                                ex.getMessage());
                return ResponseEntity
                                .status(ex.getHttpStatus())
                                .body(errorResponse);
        }

        /**
         * Handle all other exceptions - returns 500 Internal Server Error.
         */
        @ExceptionHandler(Exception.class)
        public ResponseEntity<ErrorResponseDTO> handleGenericException(Exception ex) {
                // Ignore favicon requests - these are harmless browser requests
                if (ex instanceof org.springframework.web.servlet.resource.NoResourceFoundException) {
                        org.springframework.web.servlet.resource.NoResourceFoundException nrfe = (org.springframework.web.servlet.resource.NoResourceFoundException) ex;
                        if (nrfe.getMessage().contains("favicon")) {
                                // Don't log favicon errors, just return 404 quietly
                                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
                        }
                }

                log.error("Unexpected error occurred", ex);
                ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                                "INTERNAL_ERROR",
                                "An unexpected error occurred");
                return ResponseEntity
                                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(errorResponse);
        }
}
