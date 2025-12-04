package com.ecommerce.order.presentation.controller;

import com.ecommerce.order.application.service.HealthCheckService;
import com.ecommerce.order.presentation.dto.HealthResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Health check controller for order service.
 * Provides health status of the service and its dependencies.
 */
@RestController
@RequestMapping("/api/v1/orders")
public class HealthController {

    @Autowired
    private HealthCheckService healthCheckService;

    @GetMapping("/health")
    public ResponseEntity<HealthResponseDTO> health() {
        Map<String, Object> healthCheck = healthCheckService.performHealthCheck();

        String status = (String) healthCheck.get("status");
        @SuppressWarnings("unchecked")
        Map<String, Boolean> services = (Map<String, Boolean>) healthCheck.get("services");

        HealthResponseDTO response = new HealthResponseDTO(status, services);

        // Return 200 if OK or DEGRADED, 503 if UNHEALTHY
        HttpStatus httpStatus = "UNHEALTHY".equals(status) ? HttpStatus.SERVICE_UNAVAILABLE : HttpStatus.OK;

        return ResponseEntity.status(httpStatus).body(response);
    }
}
