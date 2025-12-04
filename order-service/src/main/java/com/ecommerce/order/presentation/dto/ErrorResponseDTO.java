package com.ecommerce.order.presentation.dto;

import java.util.List;

public class ErrorResponseDTO {
    private String errorCode;
    private String message;
    private List<String> errors;

    public ErrorResponseDTO(String errorCode, String message) {
        this.errorCode = errorCode;
        this.message = message;
    }

    public ErrorResponseDTO(String errorCode, String message, List<String> errors) {
        this.errorCode = errorCode;
        this.message = message;
        this.errors = errors;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public void setErrorCode(String errorCode) {
        this.errorCode = errorCode;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<String> getErrors() {
        return errors;
    }

    public void setErrors(List<String> errors) {
        this.errors = errors;
    }
}
