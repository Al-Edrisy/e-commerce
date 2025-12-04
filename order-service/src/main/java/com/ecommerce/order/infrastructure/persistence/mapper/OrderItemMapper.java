package com.ecommerce.order.infrastructure.persistence.mapper;

import com.ecommerce.order.domain.entity.OrderItemEntity;
import com.ecommerce.order.infrastructure.persistence.entity.OrderItemJpaEntity;
import org.springframework.stereotype.Component;

/**
 * Mapper between OrderItem domain entity and JPA entity.
 */
@Component
public class OrderItemMapper {

    /**
     * Converts domain entity to JPA entity.
     */
    public OrderItemJpaEntity toJpaEntity(OrderItemEntity domainEntity) {
        if (domainEntity == null) {
            return null;
        }

        OrderItemJpaEntity jpaEntity = new OrderItemJpaEntity();
        jpaEntity.setId(domainEntity.getId());
        jpaEntity.setProductId(String.valueOf(domainEntity.getProductId()));
        jpaEntity.setProductName(domainEntity.getProductName());
        jpaEntity.setQuantity(domainEntity.getQuantity());
        jpaEntity.setPrice(domainEntity.getUnitPrice());
        jpaEntity.setSubtotal(domainEntity.getSubtotal());

        return jpaEntity;
    }

    /**
     * Converts JPA entity to domain entity.
     */
    public OrderItemEntity toDomainEntity(OrderItemJpaEntity jpaEntity) {
        if (jpaEntity == null) {
            return null;
        }

        OrderItemEntity domainEntity = new OrderItemEntity();
        domainEntity.setId(jpaEntity.getId());
        domainEntity.setProductId(Integer.valueOf(jpaEntity.getProductId()));
        domainEntity.setProductName(jpaEntity.getProductName());
        domainEntity.setQuantity(jpaEntity.getQuantity());
        domainEntity.setUnitPrice(jpaEntity.getPrice());
        domainEntity.setSubtotal(jpaEntity.getSubtotal());

        return domainEntity;
    }
}
