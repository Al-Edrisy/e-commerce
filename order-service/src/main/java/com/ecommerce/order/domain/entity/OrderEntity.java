package com.ecommerce.order.domain.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Core domain entity representing an Order.
 * Contains business logic and invariants.
 */
public class OrderEntity {

    private Long id;
    private String userUid;
    private BigDecimal totalAmount;
    private OrderStatus status;
    private String shippingAddress;
    private List<OrderItemEntity> items;
    private PaymentEntity payment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public OrderEntity() {
        this.items = new ArrayList<>();
        this.status = OrderStatus.PENDING;
        this.totalAmount = BigDecimal.ZERO;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public OrderEntity(String userUid, String shippingAddress) {
        this();
        validateUserUid(userUid);
        validateShippingAddress(shippingAddress);
        this.userUid = userUid;
        this.shippingAddress = shippingAddress;
    }

    // Business Logic Methods

    public void addItem(OrderItemEntity item) {
        if (item == null) {
            throw new IllegalArgumentException("Order item cannot be null");
        }
        this.items.add(item);
        recalculateTotalAmount();
    }

    public void removeItem(OrderItemEntity item) {
        this.items.remove(item);
        recalculateTotalAmount();
    }

    public void recalculateTotalAmount() {
        this.totalAmount = items.stream()
                .map(OrderItemEntity::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        this.updatedAt = LocalDateTime.now();
    }

    public void markAsPending() {
        this.status = OrderStatus.PENDING;
        this.updatedAt = LocalDateTime.now();
    }

    public void markAsProcessing() {
        if (this.status != OrderStatus.PENDING) {
            throw new IllegalStateException("Can only move to PROCESSING from PENDING status");
        }
        this.status = OrderStatus.PROCESSING;
        this.updatedAt = LocalDateTime.now();
    }

    public void markAsShipped() {
        if (this.status != OrderStatus.PROCESSING) {
            throw new IllegalStateException("Can only move to SHIPPED from PROCESSING status");
        }
        this.status = OrderStatus.SHIPPED;
        this.updatedAt = LocalDateTime.now();
    }

    public void markAsDelivered() {
        if (this.status != OrderStatus.SHIPPED) {
            throw new IllegalStateException("Can only move to DELIVERED from SHIPPED status");
        }
        this.status = OrderStatus.DELIVERED;
        this.updatedAt = LocalDateTime.now();
    }

    public void cancel() {
        if (this.status == OrderStatus.DELIVERED) {
            throw new IllegalStateException("Cannot cancel a delivered order");
        }
        this.status = OrderStatus.CANCELLED;
        this.updatedAt = LocalDateTime.now();
    }

    public boolean canBeCancelled() {
        return this.status != OrderStatus.DELIVERED && this.status != OrderStatus.CANCELLED;
    }

    public boolean isPending() {
        return this.status == OrderStatus.PENDING;
    }

    public boolean isProcessing() {
        return this.status == OrderStatus.PROCESSING;
    }

    public boolean isDelivered() {
        return this.status == OrderStatus.DELIVERED;
    }

    public boolean belongsToUser(String userUid) {
        return this.userUid != null && this.userUid.equals(userUid);
    }

    // Validation Methods

    private void validateUserUid(String userUid) {
        if (userUid == null || userUid.trim().isEmpty()) {
            throw new IllegalArgumentException("User UID cannot be null or empty");
        }
    }

    private void validateShippingAddress(String shippingAddress) {
        if (shippingAddress == null || shippingAddress.trim().isEmpty()) {
            throw new IllegalArgumentException("Shipping address cannot be null or empty");
        }
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUserUid() {
        return userUid;
    }

    public void setUserUid(String userUid) {
        validateUserUid(userUid);
        this.userUid = userUid;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public String getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(String shippingAddress) {
        validateShippingAddress(shippingAddress);
        this.shippingAddress = shippingAddress;
    }

    public List<OrderItemEntity> getItems() {
        return Collections.unmodifiableList(items);
    }

    public void setItems(List<OrderItemEntity> items) {
        this.items = new ArrayList<>(items);
        recalculateTotalAmount();
    }

    public PaymentEntity getPayment() {
        return payment;
    }

    public void setPayment(PaymentEntity payment) {
        this.payment = payment;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public enum OrderStatus {
        PENDING,
        PROCESSING,
        SHIPPED,
        DELIVERED,
        CANCELLED
    }
}
