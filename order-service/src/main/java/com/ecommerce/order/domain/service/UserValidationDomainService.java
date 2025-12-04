package com.ecommerce.order.domain.service;

/**
 * Domain service interface for user validation.
 * This is a port that defines what the domain needs from external user service.
 */
public interface UserValidationDomainService {

    /**
     * Validates if a user exists in the system.
     * 
     * @param userUid the user unique identifier
     * @return true if user exists and is valid, false otherwise
     */
    boolean validateUser(String userUid);

    /**
     * Checks if a user exists by UID.
     * 
     * @param userUid the user unique identifier
     * @return true if user exists, false otherwise
     */
    boolean userExists(String userUid);
}
