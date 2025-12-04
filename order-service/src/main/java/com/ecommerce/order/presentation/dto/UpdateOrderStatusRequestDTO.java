package com.ecommerce.order.presentation.dto;

import com.ecommerce.order.domain.entity.OrderEntity;
import jakarta.validation.constraints.NotNull;

/**
 * DTO for updating order status.
 */
public class UpdateOrderStatusRequestDTO {

    @NotNull(message = "Status is required")
    private OrderEntity.OrderStatus status;

    public OrderEntity.OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderEntity.OrderStatus status) {
        this.status = status;
    }
}
