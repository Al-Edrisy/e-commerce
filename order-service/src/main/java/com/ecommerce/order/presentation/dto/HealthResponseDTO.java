package com.ecommerce.order.presentation.dto;

import java.util.Map;

/**
 * Health check response DTO containing overall status and individual service
 * health.
 */
public class HealthResponseDTO {

    private String status;
    private Map<String, Boolean> services;

    public HealthResponseDTO() {
    }

    public HealthResponseDTO(String status, Map<String, Boolean> services) {
        this.status = status;
        this.services = services;
    }

    // Getters and Setters
    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Map<String, Boolean> getServices() {
        return services;
    }

    public void setServices(Map<String, Boolean> services) {
        this.services = services;
    }
}
