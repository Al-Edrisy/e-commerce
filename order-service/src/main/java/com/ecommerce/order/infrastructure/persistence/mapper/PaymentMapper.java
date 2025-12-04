package com.ecommerce.order.infrastructure.persistence.mapper;

import com.ecommerce.order.domain.entity.PaymentEntity;
import com.ecommerce.order.infrastructure.persistence.entity.PaymentJpaEntity;
import org.springframework.stereotype.Component;

/**
 * Mapper between Payment domain entity and JPA entity.
 */
@Component
public class PaymentMapper {

    /**
     * Converts domain entity to JPA entity.
     */
    public PaymentJpaEntity toJpaEntity(PaymentEntity domainEntity) {
        if (domainEntity == null) {
            return null;
        }

        PaymentJpaEntity jpaEntity = new PaymentJpaEntity();
        jpaEntity.setId(domainEntity.getId());
        jpaEntity.setAmount(domainEntity.getAmount());
        jpaEntity.setStripePaymentIntentId(domainEntity.getStripePaymentIntentId());
        // jpaEntity.setPaymentMethod(domainEntity.getPaymentMethod()); // Not in JPA
        // entity
        jpaEntity.setCreatedAt(domainEntity.getCreatedAt());

        // Map status
        if (domainEntity.getStatus() != null) {
            jpaEntity.setStatus(PaymentJpaEntity.PaymentStatus.valueOf(domainEntity.getStatus().name()));
        }

        return jpaEntity;
    }

    /**
     * Converts JPA entity to domain entity.
     */
    public PaymentEntity toDomainEntity(PaymentJpaEntity jpaEntity) {
        if (jpaEntity == null) {
            return null;
        }

        PaymentEntity domainEntity = new PaymentEntity();
        domainEntity.setId(jpaEntity.getId());
        if (jpaEntity.getOrder() != null) {
            domainEntity.setOrderId(jpaEntity.getOrder().getId());
        }
        domainEntity.setAmount(jpaEntity.getAmount());
        domainEntity.setStripePaymentIntentId(jpaEntity.getStripePaymentIntentId());
        // domainEntity.setPaymentMethod(jpaEntity.getPaymentMethod()); // Not in JPA
        // entity
        domainEntity.setCreatedAt(jpaEntity.getCreatedAt());

        // Map status
        if (jpaEntity.getStatus() != null) {
            domainEntity.setStatus(PaymentEntity.PaymentStatus.valueOf(jpaEntity.getStatus().name()));
        }

        return domainEntity;
    }
}
