package com.ecommerce.order.domain.service;

import java.util.List;

/**
 * Domain service interface for product validation.
 * This is a port that defines what the domain needs from external product
 * service.
 */
public interface ProductValidationDomainService {

    /**
     * Validates if products exist and have sufficient stock.
     * 
     * @param productValidationRequests list of products to validate
     * @return validation result with details
     */
    ProductValidationResult validateProductsAndStock(List<ProductValidationRequest> productValidationRequests);

    /**
     * Checks if a product exists.
     * 
     * @param productId the product ID
     * @return true if product exists, false otherwise
     */
    boolean productExists(Integer productId);

    /**
     * Gets available stock for a product.
     * 
     * @param productId the product ID
     * @return available stock quantity, or -1 if product not found
     */
    int getAvailableStock(Integer productId);

    /**
     * Product validation request.
     */
    class ProductValidationRequest {
        private final Integer productId;
        private final Integer quantity;

        public ProductValidationRequest(Integer productId, Integer quantity) {
            this.productId = productId;
            this.quantity = quantity;
        }

        public Integer getProductId() {
            return productId;
        }

        public Integer getQuantity() {
            return quantity;
        }
    }

    /**
     * Product validation result.
     */
    class ProductValidationResult {
        private final boolean valid;
        private final List<String> errors;

        public ProductValidationResult(boolean valid, List<String> errors) {
            this.valid = valid;
            this.errors = errors;
        }

        public boolean isValid() {
            return valid;
        }

        public List<String> getErrors() {
            return errors;
        }
    }
}
