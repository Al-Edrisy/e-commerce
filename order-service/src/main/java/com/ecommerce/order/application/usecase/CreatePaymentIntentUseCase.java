package com.ecommerce.order.application.usecase;

import com.ecommerce.order.domain.entity.OrderEntity;
import com.ecommerce.order.domain.entity.PaymentEntity;
import com.ecommerce.order.domain.repository.OrderDomainRepository;
import com.ecommerce.order.domain.repository.PaymentDomainRepository;
import com.ecommerce.order.domain.service.PaymentGatewayService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Use case for creating a payment intent.
 */
public class CreatePaymentIntentUseCase {

    private static final Logger log = LoggerFactory.getLogger(CreatePaymentIntentUseCase.class);

    private final OrderDomainRepository orderRepository;
    private final PaymentDomainRepository paymentRepository;
    private final PaymentGatewayService paymentGatewayService;

    public CreatePaymentIntentUseCase(
            OrderDomainRepository orderRepository,
            PaymentDomainRepository paymentRepository,
            PaymentGatewayService paymentGatewayService) {
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
        this.paymentGatewayService = paymentGatewayService;
    }

    /**
     * Executes the create payment intent use case.
     * 
     * @param orderId              the order ID
     * @param authenticatedUserUid the authenticated user's UID
     * @return payment intent result
     * @throws OrderNotFoundException     if order doesn't exist
     * @throws OrderAccessDeniedException if user doesn't own the order
     * @throws PaymentCreationException   if payment creation fails
     */
    public PaymentIntentResult execute(Long orderId, String authenticatedUserUid) {
        log.info("Creating payment intent for order {}", orderId);

        // 1. Retrieve and authorize order
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException("Order not found"));

        if (!order.belongsToUser(authenticatedUserUid)) {
            log.warn("Access denied: user {} attempted to pay for order {} belonging to user {}",
                    authenticatedUserUid, orderId, order.getUserUid());
            throw new OrderAccessDeniedException("Access denied");
        }

        // 2. Create payment intent via gateway
        PaymentGatewayService.PaymentIntentResult gatewayResult = paymentGatewayService.createPaymentIntent(
                order.getTotalAmount(),
                "usd",
                "Order #" + orderId);

        if (!gatewayResult.isSuccess()) {
            log.error("Payment intent creation failed for order {}: {}", orderId, gatewayResult.getErrorMessage());
            throw new PaymentCreationException(gatewayResult.getErrorMessage());
        }

        // 3. Create payment entity
        PaymentEntity payment = new PaymentEntity(order.getTotalAmount());
        payment.setStripePaymentIntentId(gatewayResult.getPaymentIntentId());
        payment.markAsProcessing();

        // 4. Save payment
        PaymentEntity savedPayment = paymentRepository.save(payment);

        // 5. Associate payment with order
        order.setPayment(savedPayment);
        orderRepository.save(order);

        log.info("Payment intent created successfully for order {}: {}", orderId, gatewayResult.getPaymentIntentId());

        return new PaymentIntentResult(
                gatewayResult.getPaymentIntentId(),
                gatewayResult.getClientSecret(),
                savedPayment.getId());
    }

    /**
     * Result of payment intent creation.
     */
    public static class PaymentIntentResult {
        private final String paymentIntentId;
        private final String clientSecret;
        private final Long paymentId;

        public PaymentIntentResult(String paymentIntentId, String clientSecret, Long paymentId) {
            this.paymentIntentId = paymentIntentId;
            this.clientSecret = clientSecret;
            this.paymentId = paymentId;
        }

        public String getPaymentIntentId() {
            return paymentIntentId;
        }

        public String getClientSecret() {
            return clientSecret;
        }

        public Long getPaymentId() {
            return paymentId;
        }
    }

    public static class OrderNotFoundException extends RuntimeException {
        public OrderNotFoundException(String message) {
            super(message);
        }
    }

    public static class OrderAccessDeniedException extends RuntimeException {
        public OrderAccessDeniedException(String message) {
            super(message);
        }
    }

    public static class PaymentCreationException extends RuntimeException {
        public PaymentCreationException(String message) {
            super(message);
        }
    }
}
