package com.ecommerce.order.application.usecase;

import com.ecommerce.order.domain.entity.OrderEntity;
import com.ecommerce.order.domain.repository.OrderDomainRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

/**
 * Use case for retrieving all orders for a user.
 * Includes authorization check.
 */
public class GetUserOrdersUseCase {

    private static final Logger log = LoggerFactory.getLogger(GetUserOrdersUseCase.class);

    private final OrderDomainRepository orderRepository;

    public GetUserOrdersUseCase(OrderDomainRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    /**
     * Executes the get user orders use case.
     * 
     * @param requestedUserUid     the requested user UID
     * @param authenticatedUserUid the authenticated user's UID
     * @return list of orders for the user
     * @throws OrderAccessDeniedException if authenticated user doesn't match
     *                                    requested user
     */
    public List<OrderEntity> execute(String requestedUserUid, String authenticatedUserUid) {
        log.debug("Retrieving orders for user {} (authenticated as {})", requestedUserUid, authenticatedUserUid);

        if (!requestedUserUid.equals(authenticatedUserUid)) {
            log.warn("Access denied: user {} attempted to access orders for user {}",
                    authenticatedUserUid, requestedUserUid);
            throw new OrderAccessDeniedException("Access denied");
        }

        List<OrderEntity> orders = orderRepository.findByUserUid(requestedUserUid);
        log.debug("Retrieved {} orders for user {}", orders.size(), requestedUserUid);
        return orders;
    }

    /**
     * Exception thrown when user doesn't have access to orders.
     */
    public static class OrderAccessDeniedException extends RuntimeException {
        public OrderAccessDeniedException(String message) {
            super(message);
        }
    }
}
