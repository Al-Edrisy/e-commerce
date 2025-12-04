package com.ecommerce.order.application.usecase;

import com.ecommerce.order.domain.entity.OrderEntity;
import com.ecommerce.order.domain.repository.OrderDomainRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Use case for updating order status.
 */
public class UpdateOrderStatusUseCase {

    private static final Logger log = LoggerFactory.getLogger(UpdateOrderStatusUseCase.class);

    private final OrderDomainRepository orderRepository;

    public UpdateOrderStatusUseCase(OrderDomainRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    /**
     * Executes the update order status use case.
     * 
     * @param orderId   the order ID
     * @param newStatus the new status
     * @return the updated order entity
     * @throws OrderNotFoundException           if order doesn't exist
     * @throws InvalidStatusTransitionException if status transition is invalid
     */
    public OrderEntity execute(Long orderId, OrderEntity.OrderStatus newStatus) {
        log.info("Updating order {} to status {}", orderId, newStatus);

        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> {
                    log.warn("Order not found: {}", orderId);
                    return new OrderNotFoundException("Order not found");
                });

        OrderEntity.OrderStatus oldStatus = order.getStatus();

        try {
            // Use domain methods for status transitions to enforce business rules
            switch (newStatus) {
                case PENDING -> order.markAsPending();
                case PROCESSING -> order.markAsProcessing();
                case SHIPPED -> order.markAsShipped();
                case DELIVERED -> order.markAsDelivered();
                case CANCELLED -> order.cancel();
                default -> throw new InvalidStatusTransitionException("Unknown status: " + newStatus);
            }

            OrderEntity updatedOrder = orderRepository.save(order);
            log.info("Order {} status updated from {} to {}", orderId, oldStatus, newStatus);
            return updatedOrder;

        } catch (IllegalStateException e) {
            log.warn("Invalid status transition for order {}: {} -> {}", orderId, oldStatus, newStatus);
            throw new InvalidStatusTransitionException(e.getMessage());
        }
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
     * Exception thrown when status transition is invalid.
     */
    public static class InvalidStatusTransitionException extends RuntimeException {
        public InvalidStatusTransitionException(String message) {
            super(message);
        }
    }
}
