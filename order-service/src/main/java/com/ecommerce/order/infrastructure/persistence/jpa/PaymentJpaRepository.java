package com.ecommerce.order.infrastructure.persistence.jpa;

import com.ecommerce.order.infrastructure.persistence.entity.PaymentJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * JPA repository for Payment persistence.
 * This is a Spring Data JPA interface.
 */
@Repository
public interface PaymentJpaRepository extends JpaRepository<PaymentJpaEntity, Long> {

    Optional<PaymentJpaEntity> findByStripePaymentIntentId(String stripePaymentIntentId);

    Optional<PaymentJpaEntity> findByOrderId(Long orderId);
}
