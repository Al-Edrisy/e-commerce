package com.ecommerce.order.infrastructure.persistence.adapter;

import com.ecommerce.order.domain.entity.PaymentEntity;
import com.ecommerce.order.domain.repository.PaymentDomainRepository;
import com.ecommerce.order.infrastructure.persistence.jpa.PaymentJpaRepository;
import com.ecommerce.order.infrastructure.persistence.mapper.PaymentMapper;
import com.ecommerce.order.infrastructure.persistence.entity.PaymentJpaEntity;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Adapter that implements PaymentDomainRepository using JPA.
 */
@Component
public class PaymentRepositoryAdapter implements PaymentDomainRepository {

    private final PaymentJpaRepository jpaRepository;
    private final PaymentMapper paymentMapper;

    public PaymentRepositoryAdapter(PaymentJpaRepository jpaRepository, PaymentMapper paymentMapper) {
        this.jpaRepository = jpaRepository;
        this.paymentMapper = paymentMapper;
    }

    @Override
    public PaymentEntity save(PaymentEntity paymentEntity) {
        PaymentJpaEntity jpaPayment = paymentMapper.toJpaEntity(paymentEntity);
        PaymentJpaEntity savedPayment = jpaRepository.save(jpaPayment);
        return paymentMapper.toDomainEntity(savedPayment);
    }

    @Override
    public Optional<PaymentEntity> findById(Long id) {
        return jpaRepository.findById(id)
                .map(paymentMapper::toDomainEntity);
    }

    @Override
    public Optional<PaymentEntity> findByStripePaymentIntentId(String paymentIntentId) {
        return jpaRepository.findByStripePaymentIntentId(paymentIntentId)
                .map(paymentMapper::toDomainEntity);
    }

    @Override
    public Optional<PaymentEntity> findByOrderId(Long orderId) {
        return jpaRepository.findByOrderId(orderId)
                .map(paymentMapper::toDomainEntity);
    }

    @Override
    public void deleteById(Long id) {
        jpaRepository.deleteById(id);
    }
}
