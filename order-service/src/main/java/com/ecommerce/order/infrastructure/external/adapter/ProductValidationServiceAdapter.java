package com.ecommerce.order.infrastructure.external.adapter;

import com.ecommerce.order.domain.service.ProductValidationDomainService;
import com.ecommerce.order.infrastructure.external.dto.ExternalOrderItemRequestDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Adapter for product validation via external Product Service.
 * Implements the domain service interface.
 */
@Component
public class ProductValidationServiceAdapter implements ProductValidationDomainService {

    private static final Logger log = LoggerFactory.getLogger(ProductValidationServiceAdapter.class);

    private final RestTemplate restTemplate;
    private final String productServiceUrl;

    public ProductValidationServiceAdapter(
            RestTemplate restTemplate,
            @Value("${product.service.url:http://localhost:8082}") String productServiceUrl) {
        this.restTemplate = restTemplate;
        this.productServiceUrl = productServiceUrl;
    }

    @Override
    public ProductValidationResult validateProductsAndStock(List<ProductValidationRequest> requests) {
        try {
            String url = productServiceUrl + "/api/products/validate";
            log.debug("Validating {} products", requests.size());

            // Convert to DTOs expected by product service
            List<ExternalOrderItemRequestDTO> itemRequests = requests.stream()
                    .map(req -> {
                        ExternalOrderItemRequestDTO item = new ExternalOrderItemRequestDTO();
                        item.setProductId(req.getProductId());
                        item.setQuantity(req.getQuantity());
                        return item;
                    })
                    .collect(Collectors.toList());

            HttpEntity<List<ExternalOrderItemRequestDTO>> requestEntity = new HttpEntity<>(itemRequests);

            ResponseEntity<ProductValidationResult> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    requestEntity,
                    ProductValidationResult.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                ProductValidationResult result = response.getBody();
                log.debug("Product validation result: valid={}, errors={}", result.isValid(),
                        result.getErrors().size());

                // Convert to domain result
                return new ProductValidationResult(result.isValid(), result.getErrors());
            }

            log.warn("Unexpected response when validating products: {}", response.getStatusCode());
            return new ProductValidationResult(false, List.of("Product service returned unexpected response"));

        } catch (Exception e) {
            log.error("Error validating products", e);
            return new ProductValidationResult(false, List.of("Product validation service unavailable"));
        }
    }

    @Override
    public boolean productExists(Integer productId) {
        try {
            String url = productServiceUrl + "/api/products/" + productId + "/exists";
            log.debug("Checking if product exists: {}", productId);

            ResponseEntity<Boolean> response = restTemplate.getForEntity(url, Boolean.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return response.getBody();
            }

            return false;

        } catch (Exception e) {
            log.error("Error checking if product exists: {}", productId, e);
            return false;
        }
    }

    @Override
    public int getAvailableStock(Integer productId) {
        try {
            String url = productServiceUrl + "/api/products/" + productId + "/stock";
            log.debug("Getting stock for product: {}", productId);

            ResponseEntity<Integer> response = restTemplate.getForEntity(url, Integer.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return response.getBody();
            }

            return -1;

        } catch (Exception e) {
            log.error("Error getting stock for product: {}", productId, e);
            return -1;
        }
    }
}
