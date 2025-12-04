package com.ecommerce.order.infrastructure.external.service;

import com.ecommerce.order.application.usecase.UpdateOrderStatusUseCase;
import com.ecommerce.order.domain.entity.OrderEntity;
import com.ecommerce.order.domain.entity.PaymentEntity;
import com.ecommerce.order.domain.repository.PaymentDomainRepository;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
public class StripeWebhookService {

    private static final Logger logger = LoggerFactory.getLogger(StripeWebhookService.class);

    private final PaymentDomainRepository paymentRepository;
    private final UpdateOrderStatusUseCase updateOrderStatusUseCase;

    public StripeWebhookService(PaymentDomainRepository paymentRepository,
            UpdateOrderStatusUseCase updateOrderStatusUseCase) {
        this.paymentRepository = paymentRepository;
        this.updateOrderStatusUseCase = updateOrderStatusUseCase;
    }

    public void handleWebhookEvent(Event event) {
        logger.info("Received Stripe webhook event: type={}, id={}", event.getType(), event.getId());

        try {
            switch (event.getType()) {
                case "payment_intent.succeeded":
                    handlePaymentSucceeded(event);
                    break;
                case "payment_intent.payment_failed":
                    handlePaymentFailed(event);
                    break;
                case "payment_intent.processing":
                    handlePaymentProcessing(event);
                    break;
                case "payment_intent.canceled":
                    handlePaymentCanceled(event);
                    break;
                case "charge.refunded":
                    handleChargeRefunded(event);
                    break;
                case "charge.succeeded":
                    handleChargeSucceeded(event);
                    break;
                case "charge.failed":
                    handleChargeFailed(event);
                    break;
                default:
                    logger.info("Unhandled event type: {}", event.getType());
            }
            logger.info("Successfully processed webhook event: type={}, id={}", event.getType(), event.getId());
        } catch (Exception e) {
            logger.error("Error processing webhook event: type={}, id={}, error={}",
                    event.getType(), event.getId(), e.getMessage(), e);
            throw e;
        }
    }

    private void handlePaymentSucceeded(Event event) {
        try {
            PaymentIntent paymentIntent = (PaymentIntent) event.getDataObjectDeserializer()
                    .getObject().orElse(null);

            if (paymentIntent == null) {
                logger.error("Failed to extract PaymentIntent from payment_intent.succeeded event");
                return;
            }

            String paymentIntentId = paymentIntent.getId();
            logger.info("Processing payment success for PaymentIntent: {}", paymentIntentId);

            Optional<PaymentEntity> paymentOpt = paymentRepository.findByStripePaymentIntentId(paymentIntentId);

            if (paymentOpt.isPresent()) {
                PaymentEntity payment = paymentOpt.get();

                payment.setStatus(PaymentEntity.PaymentStatus.COMPLETED);
                paymentRepository.save(payment);
                logger.info("Payment status updated: paymentId={}, newStatus=COMPLETED", payment.getId());

                if (payment.getOrderId() != null) {
                    updateOrderStatusUseCase.execute(payment.getOrderId(), OrderEntity.OrderStatus.PROCESSING);
                    logger.info("Order status updated: orderId={}, newStatus=PROCESSING", payment.getOrderId());
                } else {
                    logger.warn("No order associated with payment {}", payment.getId());
                }

            } else {
                logger.warn("Payment not found for PaymentIntent: {}", paymentIntentId);
            }
        } catch (Exception e) {
            logger.error("Error handling payment_intent.succeeded event", e);
            throw e;
        }
    }

    // ... (implement other methods similarly)

    private void handlePaymentFailed(Event event) {
        // Implementation similar to above
    }

    private void handlePaymentProcessing(Event event) {
        // Implementation similar to above
    }

    private void handlePaymentCanceled(Event event) {
        // Implementation similar to above
    }

    private void handleChargeRefunded(Event event) {
        logger.info("Charge refunded event received");
    }

    private void handleChargeSucceeded(Event event) {
        logger.info("Charge succeeded event received");
    }

    private void handleChargeFailed(Event event) {
        logger.info("Charge failed event received");
    }
}
