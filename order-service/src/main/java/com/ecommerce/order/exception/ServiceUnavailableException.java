package com.ecommerce.order.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception thrown when an external service is unavailable or unreachable.
 */
public class ServiceUnavailableException extends OrderServiceException {
    
    /**
     * Constructor with service name.
     *
     * @param serviceName Name of the unavailable service
     */
    public ServiceUnavailableException(String serviceName) {
        super(serviceName + " is unavailable", "SERVICE_UNAVAILABLE", HttpStatus.SERVICE_UNAVAILABLE);
    }
    
    /**
     * Constructor with service name and cause.
     *
     * @param serviceName Name of the unavailable service
     * @param cause The underlying cause
     */
    public ServiceUnavailableException(String serviceName, Throwable cause) {
        super(serviceName + " is unavailable", "SERVICE_UNAVAILABLE", HttpStatus.SERVICE_UNAVAILABLE, cause);
    }
}
