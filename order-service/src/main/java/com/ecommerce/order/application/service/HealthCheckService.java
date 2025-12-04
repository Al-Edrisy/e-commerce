package com.ecommerce.order.application.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.*;

/**
 * Service for performing health checks on database and external services.
 */
@Service
public class HealthCheckService {

    private static final Logger log = LoggerFactory.getLogger(HealthCheckService.class);
    private static final int HEALTH_CHECK_TIMEOUT_SECONDS = 3;
    private static final int SERVICE_CHECK_TIMEOUT_SECONDS = 2;

    @Autowired
    private DataSource dataSource;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${services.user-service.url}")
    private String userServiceUrl;

    @Value("${services.product-service.url}")
    private String productServiceUrl;

    /**
     * Performs comprehensive health check on all services.
     * 
     * @return Map containing overall status and individual service health
     */
    public Map<String, Object> performHealthCheck() {
        ExecutorService executor = Executors.newFixedThreadPool(3);
        Map<String, Boolean> serviceHealth = new HashMap<>();

        try {
            // Submit all health checks concurrently
            Future<Boolean> dbHealthFuture = executor.submit(this::checkDatabaseConnection);
            Future<Boolean> userServiceFuture = executor.submit(this::checkUserServiceConnection);
            Future<Boolean> productServiceFuture = executor.submit(this::checkProductServiceConnection);

            // Wait for results with timeout
            try {
                serviceHealth.put("database", dbHealthFuture.get(HEALTH_CHECK_TIMEOUT_SECONDS, TimeUnit.SECONDS));
            } catch (Exception e) {
                log.error("Database health check failed or timed out", e);
                serviceHealth.put("database", false);
            }

            try {
                serviceHealth.put("userService",
                        userServiceFuture.get(SERVICE_CHECK_TIMEOUT_SECONDS, TimeUnit.SECONDS));
            } catch (Exception e) {
                log.error("User Service health check failed or timed out", e);
                serviceHealth.put("userService", false);
            }

            try {
                serviceHealth.put("productService",
                        productServiceFuture.get(SERVICE_CHECK_TIMEOUT_SECONDS, TimeUnit.SECONDS));
            } catch (Exception e) {
                log.error("Product Service health check failed or timed out", e);
                serviceHealth.put("productService", false);
            }

        } finally {
            executor.shutdownNow();
        }

        // Determine overall status
        String overallStatus = determineOverallStatus(serviceHealth);

        Map<String, Object> result = new HashMap<>();
        result.put("status", overallStatus);
        result.put("services", serviceHealth);

        return result;
    }

    /**
     * Checks database connectivity.
     * 
     * @return true if database is accessible, false otherwise
     */
    private boolean checkDatabaseConnection() {
        try (Connection connection = dataSource.getConnection()) {
            return connection.isValid(2);
        } catch (Exception e) {
            log.error("Database connection check failed", e);
            return false;
        }
    }

    /**
     * Checks User Service connectivity.
     * 
     * @return true if User Service is accessible, false otherwise
     */
    private boolean checkUserServiceConnection() {
        try {
            String healthUrl = userServiceUrl + "/health";
            restTemplate.getForEntity(healthUrl, String.class);
            return true;
        } catch (Exception e) {
            log.warn("User Service health check failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Checks Product Service connectivity.
     * 
     * @return true if Product Service is accessible, false otherwise
     */
    private boolean checkProductServiceConnection() {
        try {
            String healthUrl = productServiceUrl + "/health";
            restTemplate.getForEntity(healthUrl, String.class);
            return true;
        } catch (Exception e) {
            log.warn("Product Service health check failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Determines overall health status based on individual service health.
     * 
     * @param serviceHealth Map of service health statuses
     * @return "OK" if all healthy, "DEGRADED" if some unhealthy, "UNHEALTHY" if
     *         critical services down
     */
    private String determineOverallStatus(Map<String, Boolean> serviceHealth) {
        boolean allHealthy = serviceHealth.values().stream().allMatch(Boolean::booleanValue);
        boolean databaseHealthy = serviceHealth.getOrDefault("database", false);

        if (allHealthy) {
            return "OK";
        } else if (!databaseHealthy) {
            return "UNHEALTHY";
        } else {
            return "DEGRADED";
        }
    }
}
