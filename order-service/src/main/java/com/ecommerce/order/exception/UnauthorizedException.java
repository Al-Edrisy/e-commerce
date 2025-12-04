package com.ecommerce.order.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception thrown when authentication is missing or invalid.
 */
public class UnauthorizedException extends OrderServiceException {
    
    /**
     * Constructor with message.
     *
     * @param message Description of the authentication failure
     */
    public UnauthorizedException(String message) {
        super(message, "UNAUTHORIZED", HttpStatus.UNAUTHORIZED);
    }
    
    /**
     * Constructor with message and cause.
     *
     * @param message Description of the authentication failure
     * @param cause The underlying cause
     */
    public UnauthorizedException(String message, Throwable cause) {
        super(message, "UNAUTHORIZED", HttpStatus.UNAUTHORIZED, cause);
    }
}
