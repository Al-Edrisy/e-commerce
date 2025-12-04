package com.ecommerce.order.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception thrown when a requested resource is not found.
 */
public class NotFoundException extends OrderServiceException {
    
    /**
     * Constructor with message.
     *
     * @param message Description of what was not found
     */
    public NotFoundException(String message) {
        super(message, "NOT_FOUND", HttpStatus.NOT_FOUND);
    }
    
    /**
     * Constructor with message and cause.
     *
     * @param message Description of what was not found
     * @param cause The underlying cause
     */
    public NotFoundException(String message, Throwable cause) {
        super(message, "NOT_FOUND", HttpStatus.NOT_FOUND, cause);
    }
}
