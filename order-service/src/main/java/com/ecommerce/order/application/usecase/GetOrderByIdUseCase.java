package com.ecommerce.order.application.usecase;

import com.ecommerce.order.domain.entity.OrderEntity;
import com.ecommerce.order.domain.repository.OrderDomainRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Use case for retrieving an order by ID.
 * Includes authorization check.
 */
public class GetOrderByIdUseCase {

    private static final Logger log = LoggerFactory.getLogger(GetOrderByIdUseCase.class);

    private final OrderDomainRepository orderRepository;

    public GetOrderByIdUseCase(OrderDomainRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    /**
     * Executes the get order by ID use case.
     * 
     * @param orderId              the order ID
     * @param authenticatedUserUid the authenticated user's UID
     * @return the order entity
     * @throws OrderNotFoundException     if order doesn't exist
     * @throws OrderAccessDeniedException if user doesn't own the order
     */
    public OrderEntity execute(Long orderId, String authenticatedUserUid) {
        log.debug("Retrieving order {} for user {}", orderId, authenticatedUserUid);

        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> {
                    log.warn("Order not found: {}", orderId);
                    return new OrderNotFoundException("Order not found");
                });

        if (!order.belongsToUser(authenticatedUserUid)) {
            log.warn("Access denied: user {} attempted to access order {} belonging to user {}",
                    authenticatedUserUid, orderId, order.getUserUid());
            throw new OrderAccessDeniedException("Access denied");
        }

        log.debug("Order {} retrieved successfully for user {}", orderId, authenticatedUserUid);
        return order;
    }

    /**
     * Exception thrown when order is not found.
     */
    public static class OrderNotFoundException extends RuntimeException {
        public OrderNotFoundException(String message) {
            super(message);
        }
    }

    /**
     * Exception thrown when user doesn't have access to order.
     */
    public static class OrderAccessDeniedException extends RuntimeException {
        public OrderAccessDeniedException(String message) {
            super(message);
        }
    }
}
