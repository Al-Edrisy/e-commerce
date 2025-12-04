package com.ecommerce.order.exception;

import org.springframework.http.HttpStatus;

import java.util.ArrayList;
import java.util.List;

/**
 * Exception thrown when request validation fails.
 * Contains a list of specific validation errors.
 */
public class ValidationException extends OrderServiceException {
    
    private final List<String> errors;
    
    /**
     * Constructor with message and list of validation errors.
     *
     * @param message General validation error message
     * @param errors List of specific validation errors
     */
    public ValidationException(String message, List<String> errors) {
        super(message, "VALIDATION_ERROR", HttpStatus.BAD_REQUEST);
        this.errors = errors != null ? new ArrayList<>(errors) : new ArrayList<>();
    }
    
    /**
     * Constructor with message only (single validation error).
     *
     * @param message Validation error message
     */
    public ValidationException(String message) {
        super(message, "VALIDATION_ERROR", HttpStatus.BAD_REQUEST);
        this.errors = new ArrayList<>();
        this.errors.add(message);
    }
    
    public List<String> getErrors() {
        return new ArrayList<>(errors);
    }
}
