package com.ecommerce.order.infrastructure.external.adapter;

import com.ecommerce.order.domain.service.PaymentGatewayService;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.RefundCreateParams;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.math.BigDecimal;

/**
 * Adapter for Stripe payment gateway.
 * Implements the domain service interface for payment processing.
 */
@Component
public class StripePaymentGatewayAdapter implements PaymentGatewayService {

    private static final Logger log = LoggerFactory.getLogger(StripePaymentGatewayAdapter.class);

    @Value("${stripe.api.key}")
    private String stripeApiKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeApiKey;
        log.info("Stripe API initialized");
    }

    @Override
    public PaymentIntentResult createPaymentIntent(BigDecimal amount, String currency, String description) {
        try {
            log.info("Creating payment intent for amount: {} {}", amount, currency);

            // Stripe expects amount in cents
            long amountInCents = amount.multiply(BigDecimal.valueOf(100)).longValue();

            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(amountInCents)
                    .setCurrency(currency)
                    .setDescription(description)
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .build())
                    .build();

            PaymentIntent intent = PaymentIntent.create(params);

            log.info("Payment intent created successfully: {}", intent.getId());
            return PaymentIntentResult.success(intent.getId(), intent.getClientSecret());

        } catch (StripeException e) {
            log.error("Error creating payment intent", e);
            return PaymentIntentResult.failure("Failed to create payment intent: " + e.getMessage());
        }
    }

    @Override
    public boolean confirmPayment(String paymentIntentId) {
        try {
            log.info("Confirming payment intent: {}", paymentIntentId);

            PaymentIntent intent = PaymentIntent.retrieve(paymentIntentId);
            intent.confirm();

            log.info("Payment intent confirmed: {}", paymentIntentId);
            return true;

        } catch (StripeException e) {
            log.error("Error confirming payment intent: {}", paymentIntentId, e);
            return false;
        }
    }

    @Override
    public boolean cancelPayment(String paymentIntentId) {
        try {
            log.info("Cancelling payment intent: {}", paymentIntentId);

            PaymentIntent intent = PaymentIntent.retrieve(paymentIntentId);
            intent.cancel();

            log.info("Payment intent cancelled: {}", paymentIntentId);
            return true;

        } catch (StripeException e) {
            log.error("Error cancelling payment intent: {}", paymentIntentId, e);
            return false;
        }
    }

    @Override
    public RefundResult refundPayment(String paymentIntentId, BigDecimal amount) {
        try {
            log.info("Creating refund for payment intent: {}, amount: {}", paymentIntentId, amount);

            RefundCreateParams.Builder paramsBuilder = RefundCreateParams.builder()
                    .setPaymentIntent(paymentIntentId);

            // If amount is specified, it's a partial refund
            if (amount != null) {
                long amountInCents = amount.multiply(BigDecimal.valueOf(100)).longValue();
                paramsBuilder.setAmount(amountInCents);
            }

            Refund refund = Refund.create(paramsBuilder.build());

            log.info("Refund created successfully: {}", refund.getId());
            return RefundResult.success(refund.getId());

        } catch (StripeException e) {
            log.error("Error creating refund for payment intent: {}", paymentIntentId, e);
            return RefundResult.failure("Failed to create refund: " + e.getMessage());
        }
    }

    @Override
    public String getPaymentStatus(String paymentIntentId) {
        try {
            PaymentIntent intent = PaymentIntent.retrieve(paymentIntentId);
            return intent.getStatus();
        } catch (StripeException e) {
            log.error("Error retrieving payment status for: {}", paymentIntentId, e);
            return "unknown";
        }
    }
}
