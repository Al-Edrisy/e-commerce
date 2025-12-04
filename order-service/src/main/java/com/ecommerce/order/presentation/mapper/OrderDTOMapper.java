package com.ecommerce.order.presentation.mapper;

import com.ecommerce.order.application.usecase.CreateOrderCommand;
import com.ecommerce.order.domain.entity.OrderEntity;
import com.ecommerce.order.domain.entity.OrderItemEntity;
import com.ecommerce.order.domain.entity.PaymentEntity;
import com.ecommerce.order.presentation.dto.*;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper between presentation DTOs and domain entities/commands.
 */
@Component
public class OrderDTOMapper {

    /**
     * Converts CreateOrderRequestDTO to CreateOrderCommand.
     */
    public CreateOrderCommand toCreateOrderCommand(CreateOrderRequestDTO dto, String authenticatedUserUid) {
        List<CreateOrderCommand.OrderItemData> itemsData = dto.getItems().stream()
                .map(item -> new CreateOrderCommand.OrderItemData(
                        item.getProductId(),
                        item.getProductName(),
                        item.getQuantity(),
                        item.getUnitPrice()))
                .collect(Collectors.toList());

        return new CreateOrderCommand(
                dto.getUserUid(),
                authenticatedUserUid,
                dto.getShippingAddress(),
                itemsData);
    }

    /**
     * Converts OrderEntity to OrderResponseDTO.
     */
    public OrderResponseDTO toResponseDTO(OrderEntity entity) {
        OrderResponseDTO dto = new OrderResponseDTO();
        dto.setId(entity.getId());
        dto.setUserUid(entity.getUserUid());
        dto.setTotalAmount(entity.getTotalAmount());
        dto.setStatus(entity.getStatus().name());
        dto.setShippingAddress(entity.getShippingAddress());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        // Map items
        if (entity.getItems() != null) {
            List<OrderItemResponseDTO> items = entity.getItems().stream()
                    .map(this::toOrderItemResponseDTO)
                    .collect(Collectors.toList());
            dto.setItems(items);
        }

        // Map payment
        if (entity.getPayment() != null) {
            dto.setPayment(toPaymentResponseDTO(entity.getPayment()));
        }

        return dto;
    }

    /**
     * Converts OrderItemEntity to OrderItemResponseDTO.
     */
    private OrderItemResponseDTO toOrderItemResponseDTO(OrderItemEntity entity) {
        OrderItemResponseDTO dto = new OrderItemResponseDTO();
        dto.setId(entity.getId());
        dto.setProductId(entity.getProductId());
        dto.setProductName(entity.getProductName());
        dto.setQuantity(entity.getQuantity());
        dto.setUnitPrice(entity.getUnitPrice());
        dto.setSubtotal(entity.getSubtotal());
        return dto;
    }

    /**
     * Converts PaymentEntity to PaymentResponseDTO.
     */
    private PaymentResponseDTO toPaymentResponseDTO(PaymentEntity entity) {
        PaymentResponseDTO dto = new PaymentResponseDTO();
        dto.setId(entity.getId());
        dto.setAmount(entity.getAmount());
        dto.setStripePaymentIntentId(entity.getStripePaymentIntentId());
        dto.setStatus(entity.getStatus().name());
        dto.setPaymentMethod(entity.getPaymentMethod());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }
}
