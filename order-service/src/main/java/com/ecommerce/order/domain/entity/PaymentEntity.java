package com.ecommerce.order.domain.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Domain entity representing a payment for an order.
 */
public class PaymentEntity {

    private Long id;
    private Long orderId;
    private BigDecimal amount;
    private String stripePaymentIntentId;
    private PaymentStatus status;
    private String paymentMethod;
    private LocalDateTime createdAt;

    public PaymentEntity() {
        this.status = PaymentStatus.PENDING;
        this.createdAt = LocalDateTime.now();
    }

    public PaymentEntity(BigDecimal amount) {
        this();
        validateAmount(amount);
        this.amount = amount;
    }

    // Business Logic

    public void markAsPending() {
        this.status = PaymentStatus.PENDING;
    }

    public void markAsProcessing() {
        this.status = PaymentStatus.PROCESSING;
    }

    public void markAsCompleted() {
        if (this.status == PaymentStatus.REFUNDED) {
            throw new IllegalStateException("Cannot complete a refunded payment");
        }
        this.status = PaymentStatus.COMPLETED;
    }

    public void markAsFailed() {
        this.status = PaymentStatus.FAILED;
    }

    public void markAsRefunded() {
        if (this.status != PaymentStatus.COMPLETED) {
            throw new IllegalStateException("Can only refund a completed payment");
        }
        this.status = PaymentStatus.REFUNDED;
    }

    public boolean isCompleted() {
        return this.status == PaymentStatus.COMPLETED;
    }

    public boolean isPending() {
        return this.status == PaymentStatus.PENDING;
    }

    public boolean isFailed() {
        return this.status == PaymentStatus.FAILED;
    }

    public boolean canBeRefunded() {
        return this.status == PaymentStatus.COMPLETED;
    }

    // Validation

    private void validateAmount(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Payment amount must be positive");
        }
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        validateAmount(amount);
        this.amount = amount;
    }

    public String getStripePaymentIntentId() {
        return stripePaymentIntentId;
    }

    public void setStripePaymentIntentId(String stripePaymentIntentId) {
        this.stripePaymentIntentId = stripePaymentIntentId;
    }

    public PaymentStatus getStatus() {
        return status;
    }

    public void setStatus(PaymentStatus status) {
        this.status = status;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public enum PaymentStatus {
        PENDING,
        PROCESSING,
        COMPLETED,
        FAILED,
        REFUNDED
    }
}
