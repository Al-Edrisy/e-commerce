package com.ecommerce.order.presentation.controller;

import com.ecommerce.order.application.usecase.*;
import com.ecommerce.order.domain.entity.OrderEntity;
import com.ecommerce.order.exception.NotFoundException;
import com.ecommerce.order.exception.ValidationException;
import com.ecommerce.order.exception.ForbiddenException;
import com.ecommerce.order.presentation.dto.CreateOrderRequestDTO;
import com.ecommerce.order.presentation.dto.OrderResponseDTO;
import com.ecommerce.order.presentation.dto.UpdateOrderStatusRequestDTO;
import com.ecommerce.order.presentation.mapper.OrderDTOMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

/**
 * REST controller for order operations.
 * Follows Clean Architecture - controller depends on use cases, not services.
 */
@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    private static final Logger log = LoggerFactory.getLogger(OrderController.class);

    private final CreateOrderUseCase createOrderUseCase;
    private final GetOrderByIdUseCase getOrderByIdUseCase;
    private final GetUserOrdersUseCase getUserOrdersUseCase;
    private final UpdateOrderStatusUseCase updateOrderStatusUseCase;
    private final OrderDTOMapper orderMapper;

    public OrderController(
            CreateOrderUseCase createOrderUseCase,
            GetOrderByIdUseCase getOrderByIdUseCase,
            GetUserOrdersUseCase getUserOrdersUseCase,
            UpdateOrderStatusUseCase updateOrderStatusUseCase,
            OrderDTOMapper orderMapper) {
        this.createOrderUseCase = createOrderUseCase;
        this.getOrderByIdUseCase = getOrderByIdUseCase;
        this.getUserOrdersUseCase = getUserOrdersUseCase;
        this.updateOrderStatusUseCase = updateOrderStatusUseCase;
        this.orderMapper = orderMapper;
    }

    /**
     * Creates a new order with validation.
     */
    @PostMapping
    public ResponseEntity<OrderResponseDTO> createOrder(
            @Valid @RequestBody CreateOrderRequestDTO request,
            @RequestHeader("X-User-UID") String authenticatedUserUid) {

        log.info("Creating order for user: {}", authenticatedUserUid);

        try {
            CreateOrderCommand command = orderMapper.toCreateOrderCommand(request, authenticatedUserUid);
            OrderEntity order = createOrderUseCase.execute(command);
            OrderResponseDTO response = orderMapper.toResponseDTO(order);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (CreateOrderUseCase.CreateOrderException e) {
            log.error("Order creation failed", e);
            throw new ValidationException("Order creation failed: " + e.getMessage());
        }
    }

    /**
     * Retrieves an order by ID (with authorization).
     */
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponseDTO> getOrderById(
            @PathVariable Long id,
            @RequestHeader("X-User-UID") String authenticatedUserUid) {

        log.info("Retrieving order {} for user {}", id, authenticatedUserUid);

        try {
            OrderEntity order = getOrderByIdUseCase.execute(id, authenticatedUserUid);
            OrderResponseDTO response = orderMapper.toResponseDTO(order);

            return ResponseEntity.ok(response);

        } catch (GetOrderByIdUseCase.OrderNotFoundException e) {
            log.error("Order not found: {}", id);
            throw new NotFoundException("Order not found with ID: " + id);
        } catch (GetOrderByIdUseCase.OrderAccessDeniedException e) {
            log.error("Access denied to order: {}", id);
            throw new ForbiddenException("Access denied to order");
        }
    }

    /**
     * Retrieves all orders for the authenticated user.
     */
    @GetMapping
    public ResponseEntity<List<OrderResponseDTO>> getUserOrders(
            @RequestHeader("X-User-UID") String authenticatedUserUid) {

        log.info("Retrieving orders for user: {}", authenticatedUserUid);

        try {
            List<OrderEntity> orders = getUserOrdersUseCase.execute(authenticatedUserUid, authenticatedUserUid);
            List<OrderResponseDTO> response = orders.stream()
                    .map(orderMapper::toResponseDTO)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(response);

        } catch (GetUserOrdersUseCase.OrderAccessDeniedException e) {
            log.error("Access denied to orders");
            throw new ForbiddenException("Access denied to orders");
        }
    }

    /**
     * Updates order status.
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<OrderResponseDTO> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequestDTO request,
            @RequestHeader("X-User-UID") String authenticatedUserUid) {

        log.info("Updating order {} status to {}", id, request.getStatus());

        try {
            OrderEntity.OrderStatus status = OrderEntity.OrderStatus.valueOf(request.getStatus().name());
            OrderEntity order = updateOrderStatusUseCase.execute(id, status);
            OrderResponseDTO response = orderMapper.toResponseDTO(order);

            return ResponseEntity.ok(response);

        } catch (UpdateOrderStatusUseCase.OrderNotFoundException e) {
            log.error("Order not found: {}", id);
            throw new NotFoundException("Order not found with ID: " + id);
        } catch (UpdateOrderStatusUseCase.InvalidStatusTransitionException e) {
            log.error("Invalid status transition", e);
            throw new ValidationException(e.getMessage());
        }
    }
}
