package com.ecommerce.order.application.usecase;

import java.math.BigDecimal;
import java.util.List;

/**
 * Command object for creating an order.
 * Encapsulates all data needed for order creation.
 */
public class CreateOrderCommand {

    private final String userUid;
    private final String authenticatedUserUid;
    private final String shippingAddress;
    private final List<OrderItemData> items;

    public CreateOrderCommand(
            String userUid,
            String authenticatedUserUid,
            String shippingAddress,
            List<OrderItemData> items) {
        this.userUid = userUid;
        this.authenticatedUserUid = authenticatedUserUid;
        this.shippingAddress = shippingAddress;
        this.items = items;
    }

    public String getUserUid() {
        return userUid;
    }

    public String getAuthenticatedUserUid() {
        return authenticatedUserUid;
    }

    public String getShippingAddress() {
        return shippingAddress;
    }

    public List<OrderItemData> getItems() {
        return items;
    }

    /**
     * Data class representing an order item in the command.
     */
    public static class OrderItemData {
        private final Integer productId;
        private final String productName;
        private final Integer quantity;
        private final BigDecimal unitPrice;

        public OrderItemData(Integer productId, String productName, Integer quantity, BigDecimal unitPrice) {
            this.productId = productId;
            this.productName = productName;
            this.quantity = quantity;
            this.unitPrice = unitPrice;
        }

        public Integer getProductId() {
            return productId;
        }

        public String getProductName() {
            return productName;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public BigDecimal getUnitPrice() {
            return unitPrice;
        }
    }
}
