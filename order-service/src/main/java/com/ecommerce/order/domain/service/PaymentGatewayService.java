package com.ecommerce.order.domain.service;

import java.math.BigDecimal;

/**
 * Domain service interface for payment processing.
 * This is a port that defines what the domain needs from payment gateway
 * (Stripe).
 */
public interface PaymentGatewayService {

    /**
     * Creates a payment intent in the payment gateway.
     * 
     * @param amount      the payment amount
     * @param currency    the currency code (e.g., "usd")
     * @param description payment description
     * @return payment intent result with client secret
     */
    PaymentIntentResult createPaymentIntent(BigDecimal amount, String currency, String description);

    /**
     * Confirms a payment intent.
     * 
     * @param paymentIntentId the payment intent ID
     * @return true if confirmed successfully
     */
    boolean confirmPayment(String paymentIntentId);

    /**
     * Cancels a payment intent.
     * 
     * @param paymentIntentId the payment intent ID
     * @return true if cancelled successfully
     */
    boolean cancelPayment(String paymentIntentId);

    /**
     * Refunds a payment.
     * 
     * @param paymentIntentId the payment intent ID
     * @param amount          the amount to refund (null for full refund)
     * @return refund result
     */
    RefundResult refundPayment(String paymentIntentId, BigDecimal amount);

    /**
     * Gets the status of a payment.
     * 
     * @param paymentIntentId the payment intent ID
     * @return payment status
     */
    String getPaymentStatus(String paymentIntentId);

    /**
     * Payment intent creation result.
     */
    class PaymentIntentResult {
        private final String paymentIntentId;
        private final String clientSecret;
        private final boolean success;
        private final String errorMessage;

        public PaymentIntentResult(String paymentIntentId, String clientSecret, boolean success, String errorMessage) {
            this.paymentIntentId = paymentIntentId;
            this.clientSecret = clientSecret;
            this.success = success;
            this.errorMessage = errorMessage;
        }

        public static PaymentIntentResult success(String paymentIntentId, String clientSecret) {
            return new PaymentIntentResult(paymentIntentId, clientSecret, true, null);
        }

        public static PaymentIntentResult failure(String errorMessage) {
            return new PaymentIntentResult(null, null, false, errorMessage);
        }

        public String getPaymentIntentId() {
            return paymentIntentId;
        }

        public String getClientSecret() {
            return clientSecret;
        }

        public boolean isSuccess() {
            return success;
        }

        public String getErrorMessage() {
            return errorMessage;
        }
    }

    /**
     * Refund result.
     */
    class RefundResult {
        private final String refundId;
        private final boolean success;
        private final String errorMessage;

        public RefundResult(String refundId, boolean success, String errorMessage) {
            this.refundId = refundId;
            this.success = success;
            this.errorMessage = errorMessage;
        }

        public static RefundResult success(String refundId) {
            return new RefundResult(refundId, true, null);
        }

        public static RefundResult failure(String errorMessage) {
            return new RefundResult(null, false, errorMessage);
        }

        public String getRefundId() {
            return refundId;
        }

        public boolean isSuccess() {
            return success;
        }

        public String getErrorMessage() {
            return errorMessage;
        }
    }
}
