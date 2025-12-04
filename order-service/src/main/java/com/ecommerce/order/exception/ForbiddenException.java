package com.ecommerce.order.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception thrown when a user attempts to access a resource they don't have permission for.
 */
public class ForbiddenException extends OrderServiceException {
    
    /**
     * Constructor with message.
     *
     * @param message Description of the forbidden action
     */
    public ForbiddenException(String message) {
        super(message, "FORBIDDEN", HttpStatus.FORBIDDEN);
    }
    
    /**
     * Constructor with message and cause.
     *
     * @param message Description of the forbidden action
     * @param cause The underlying cause
     */
    public ForbiddenException(String message, Throwable cause) {
        super(message, "FORBIDDEN", HttpStatus.FORBIDDEN, cause);
    }
}
