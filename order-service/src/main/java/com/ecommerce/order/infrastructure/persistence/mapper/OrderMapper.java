package com.ecommerce.order.infrastructure.persistence.mapper;

import com.ecommerce.order.domain.entity.OrderEntity;
import com.ecommerce.order.domain.entity.OrderItemEntity;
import com.ecommerce.order.infrastructure.persistence.entity.OrderJpaEntity;
import com.ecommerce.order.infrastructure.persistence.entity.OrderItemJpaEntity;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper between Order domain entity and JPA entity.
 * Separates domain model from persistence model.
 */
@Component
public class OrderMapper {

    private final OrderItemMapper orderItemMapper;
    private final PaymentMapper paymentMapper;

    public OrderMapper(OrderItemMapper orderItemMapper, PaymentMapper paymentMapper) {
        this.orderItemMapper = orderItemMapper;
        this.paymentMapper = paymentMapper;
    }

    /**
     * Converts domain entity to JPA entity.
     */
    public OrderJpaEntity toJpaEntity(OrderEntity domainEntity) {
        if (domainEntity == null) {
            return null;
        }

        OrderJpaEntity jpaEntity = new OrderJpaEntity();
        jpaEntity.setId(domainEntity.getId());
        jpaEntity.setUserUid(domainEntity.getUserUid());
        jpaEntity.setTotalAmount(domainEntity.getTotalAmount());
        jpaEntity.setShippingAddress(domainEntity.getShippingAddress());
        jpaEntity.setCreatedAt(domainEntity.getCreatedAt());
        jpaEntity.setUpdatedAt(domainEntity.getUpdatedAt());

        // Map status
        if (domainEntity.getStatus() != null) {
            jpaEntity.setStatus(OrderJpaEntity.OrderStatus.valueOf(domainEntity.getStatus().name()));
        }

        // Map items
        if (domainEntity.getItems() != null) {
            List<OrderItemJpaEntity> jpaItems = domainEntity.getItems().stream()
                    .map(item -> {
                        OrderItemJpaEntity jpaItem = orderItemMapper.toJpaEntity(item);
                        jpaItem.setOrder(jpaEntity); // Set bidirectional relationship
                        return jpaItem;
                    })
                    .collect(Collectors.toList());
            jpaEntity.setItems(jpaItems);
        }

        // Map payment if exists
        if (domainEntity.getPayment() != null) {
            jpaEntity.setPayment(paymentMapper.toJpaEntity(domainEntity.getPayment()));
        }

        return jpaEntity;
    }

    /**
     * Converts JPA entity to domain entity.
     */
    public OrderEntity toDomainEntity(OrderJpaEntity jpaEntity) {
        if (jpaEntity == null) {
            return null;
        }

        OrderEntity domainEntity = new OrderEntity();
        domainEntity.setId(jpaEntity.getId());
        domainEntity.setUserUid(jpaEntity.getUserUid());
        domainEntity.setTotalAmount(jpaEntity.getTotalAmount());
        domainEntity.setShippingAddress(jpaEntity.getShippingAddress());
        domainEntity.setCreatedAt(jpaEntity.getCreatedAt());
        domainEntity.setUpdatedAt(jpaEntity.getUpdatedAt());

        // Map status
        if (jpaEntity.getStatus() != null) {
            domainEntity.setStatus(OrderEntity.OrderStatus.valueOf(jpaEntity.getStatus().name()));
        }

        // Map items
        if (jpaEntity.getItems() != null) {
            List<OrderItemEntity> domainItems = jpaEntity.getItems().stream()
                    .map(orderItemMapper::toDomainEntity)
                    .collect(Collectors.toList());
            domainEntity.setItems(domainItems);
        } else {
            domainEntity.setItems(new ArrayList<>());
        }

        // Map payment if exists
        if (jpaEntity.getPayment() != null) {
            domainEntity.setPayment(paymentMapper.toDomainEntity(jpaEntity.getPayment()));
        }

        return domainEntity;
    }
}
