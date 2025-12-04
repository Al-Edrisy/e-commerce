package com.ecommerce.order.exception;

import org.springframework.http.HttpStatus;

/**
 * Base exception class for all Order Service exceptions.
 * Provides common fields for error code and HTTP status.
 */
public class OrderServiceException extends RuntimeException {
    
    private final String errorCode;
    private final HttpStatus httpStatus;
    
    /**
     * Constructor with message, error code, and HTTP status.
     *
     * @param message Human-readable error message
     * @param errorCode Machine-readable error code
     * @param httpStatus HTTP status code to return
     */
    public OrderServiceException(String message, String errorCode, HttpStatus httpStatus) {
        super(message);
        this.errorCode = errorCode;
        this.httpStatus = httpStatus;
    }
    
    /**
     * Constructor with message, error code, HTTP status, and cause.
     *
     * @param message Human-readable error message
     * @param errorCode Machine-readable error code
     * @param httpStatus HTTP status code to return
     * @param cause The underlying cause of this exception
     */
    public OrderServiceException(String message, String errorCode, HttpStatus httpStatus, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
        this.httpStatus = httpStatus;
    }
    
    public String getErrorCode() {
        return errorCode;
    }
    
    public HttpStatus getHttpStatus() {
        return httpStatus;
    }
}
