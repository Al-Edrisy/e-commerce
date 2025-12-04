package com.ecommerce.order.domain.repository;

import com.ecommerce.order.domain.entity.PaymentEntity;

import java.util.Optional;

/**
 * Repository interface for Payment domain entity.
 * This is a port in Clean Architecture.
 */
public interface PaymentDomainRepository {

    /**
     * Saves a payment entity.
     * 
     * @param payment the payment to save
     * @return the saved payment with generated ID
     */
    PaymentEntity save(PaymentEntity payment);

    /**
     * Finds a payment by its ID.
     * 
     * @param id the payment ID
     * @return Optional containing the payment if found
     */
    Optional<PaymentEntity> findById(Long id);

    /**
     * Finds a payment by Stripe payment intent ID.
     * 
     * @param paymentIntentId the Stripe payment intent ID
     * @return Optional containing the payment if found
     */
    Optional<PaymentEntity> findByStripePaymentIntentId(String paymentIntentId);

    /**
     * Finds a payment by order ID.
     * 
     * @param orderId the order ID
     * @return Optional containing the payment if found
     */
    Optional<PaymentEntity> findByOrderId(Long orderId);

    /**
     * Deletes a payment by its ID.
     * 
     * @param id the payment ID to delete
     */
    void deleteById(Long id);
}
