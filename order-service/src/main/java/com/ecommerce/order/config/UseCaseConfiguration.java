package com.ecommerce.order.config;

import com.ecommerce.order.application.usecase.*;
import com.ecommerce.order.domain.repository.OrderDomainRepository;
import com.ecommerce.order.domain.repository.PaymentDomainRepository;
import com.ecommerce.order.domain.service.PaymentGatewayService;
import com.ecommerce.order.domain.service.ProductValidationDomainService;
import com.ecommerce.order.domain.service.UserValidationDomainService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration for Use Cases (Application Layer).
 * Wires up dependencies following Clean Architecture principles.
 */
@Configuration
public class UseCaseConfiguration {

    /**
     * Creates CreateOrderUseCase bean.
     */
    @Bean
    public CreateOrderUseCase createOrderUseCase(
            OrderDomainRepository orderRepository,
            UserValidationDomainService userValidationService,
            ProductValidationDomainService productValidationService) {
        return new CreateOrderUseCase(orderRepository, userValidationService, productValidationService);
    }

    /**
     * Creates GetOrderByIdUseCase bean.
     */
    @Bean
    public GetOrderByIdUseCase getOrderByIdUseCase(OrderDomainRepository orderRepository) {
        return new GetOrderByIdUseCase(orderRepository);
    }

    /**
     * Creates GetUserOrdersUseCase bean.
     */
    @Bean
    public GetUserOrdersUseCase getUserOrdersUseCase(OrderDomainRepository orderRepository) {
        return new GetUserOrdersUseCase(orderRepository);
    }

    /**
     * Creates UpdateOrderStatusUseCase bean.
     */
    @Bean
    public UpdateOrderStatusUseCase updateOrderStatusUseCase(OrderDomainRepository orderRepository) {
        return new UpdateOrderStatusUseCase(orderRepository);
    }

    /**
     * Creates CreatePaymentIntentUseCase bean.
     */
    @Bean
    public CreatePaymentIntentUseCase createPaymentIntentUseCase(
            OrderDomainRepository orderRepository,
            PaymentDomainRepository paymentRepository,
            PaymentGatewayService paymentGatewayService) {
        return new CreatePaymentIntentUseCase(orderRepository, paymentRepository, paymentGatewayService);
    }
}
