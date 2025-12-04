package com.ecommerce.order.infrastructure.external.adapter;

import com.ecommerce.order.domain.service.UserValidationDomainService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Adapter for user validation via external User Service.
 * Implements the domain service interface.
 */
@Component
public class UserValidationServiceAdapter implements UserValidationDomainService {

    private static final Logger log = LoggerFactory.getLogger(UserValidationServiceAdapter.class);

    private final RestTemplate restTemplate;
    private final String userServiceUrl;

    public UserValidationServiceAdapter(
            RestTemplate restTemplate,
            @Value("${user.service.url:http://localhost:8081}") String userServiceUrl) {
        this.restTemplate = restTemplate;
        this.userServiceUrl = userServiceUrl;
    }

    @Override
    public boolean validateUser(String userUid) {
        return userExists(userUid);
    }

    @Override
    public boolean userExists(String userUid) {
        try {
            String url = userServiceUrl + "/api/users/" + userUid + "/exists";
            log.debug("Checking if user exists: {}", userUid);

            // The User Service returns a JSON object: { "exists": true, ... }
            // We use exchange with ParameterizedTypeReference to safely map the response
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<Map<String, Object>>() {
                    });

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                if (body.containsKey("exists")) {
                    Object exists = body.get("exists");
                    log.debug("User {} exists: {}", userUid, exists);
                    return Boolean.TRUE.equals(exists);
                }
            }

            log.warn("Unexpected response when checking user existence: {}", response.getStatusCode());
            return false;

        } catch (Exception e) {
            log.error("Error checking if user exists: {}", userUid, e);
            // In production, you might want to handle this differently
            // For now, we'll assume the user doesn't exist if the service is unavailable
            return false;
        }
    }
}
