package com.ecommerce.order.application.usecase;

import com.ecommerce.order.domain.entity.OrderEntity;
import com.ecommerce.order.domain.entity.OrderItemEntity;
import com.ecommerce.order.domain.repository.OrderDomainRepository;
import com.ecommerce.order.domain.service.ProductValidationDomainService;
import com.ecommerce.order.domain.service.UserValidationDomainService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Use case for creating an order.
 * Encapsulates the business logic for order creation.
 */
public class CreateOrderUseCase {

    private static final Logger log = LoggerFactory.getLogger(CreateOrderUseCase.class);

    private final OrderDomainRepository orderRepository;
    private final UserValidationDomainService userValidationService;
    private final ProductValidationDomainService productValidationService;

    public CreateOrderUseCase(
            OrderDomainRepository orderRepository,
            UserValidationDomainService userValidationService,
            ProductValidationDomainService productValidationService) {
        this.orderRepository = orderRepository;
        this.userValidationService = userValidationService;
        this.productValidationService = productValidationService;
    }

    /**
     * Executes the create order use case.
     * 
     * @param command the command containing order creation data
     * @return the created order entity
     * @throws CreateOrderException if order creation fails
     */
    public OrderEntity execute(CreateOrderCommand command) {
        log.info("Executing CreateOrderUseCase for user: {}", command.getUserUid());

        // 1. Validate authenticated user matches request
        if (!command.getUserUid().equals(command.getAuthenticatedUserUid())) {
            log.warn("User mismatch: authenticated user {} attempted to create order for user {}",
                    command.getAuthenticatedUserUid(), command.getUserUid());
            throw new CreateOrderException("Cannot create order for different user");
        }

        // 2. Validate user exists
        if (!userValidationService.validateUser(command.getUserUid())) {
            log.warn("User validation failed: user {} not found", command.getUserUid());
            throw new CreateOrderException("User not found");
        }

        // 3. Validate products and stock
        List<ProductValidationDomainService.ProductValidationRequest> validationRequests = command.getItems().stream()
                .map(item -> new ProductValidationDomainService.ProductValidationRequest(
                        item.getProductId(), item.getQuantity()))
                .collect(Collectors.toList());

        ProductValidationDomainService.ProductValidationResult validationResult = productValidationService
                .validateProductsAndStock(validationRequests);

        if (!validationResult.isValid()) {
            log.warn("Product validation failed for user {}: {}",
                    command.getAuthenticatedUserUid(), validationResult.getErrors());
            throw new CreateOrderException("Product validation failed: " +
                    String.join(", ", validationResult.getErrors()));
        }

        // 4. Create order entity
        OrderEntity order = new OrderEntity(command.getUserUid(), command.getShippingAddress());

        // 5. Add items to order
        for (CreateOrderCommand.OrderItemData itemData : command.getItems()) {
            OrderItemEntity item = new OrderItemEntity(
                    itemData.getProductId(),
                    itemData.getProductName(),
                    itemData.getQuantity(),
                    itemData.getUnitPrice());
            order.addItem(item);
        }

        // 6. Persist order
        OrderEntity savedOrder = orderRepository.save(order);

        log.info("Order created successfully: {} for user: {}", savedOrder.getId(), command.getUserUid());
        return savedOrder;
    }

    /**
     * Exception thrown when order creation fails.
     */
    public static class CreateOrderException extends RuntimeException {
        public CreateOrderException(String message) {
            super(message);
        }

        public CreateOrderException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
