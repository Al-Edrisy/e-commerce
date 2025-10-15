# Order Service

Order management and payment processing service with Stripe integration.

## Technology Stack

- **Runtime**: Java 17+
- **Framework**: Spring Boot 3.2
- **Database**: PostgreSQL
- **Payment**: Stripe SDK
- **Build Tool**: Maven
- **Port**: 8080

## Prerequisites

- Java 17+
- Maven 3.6+
- PostgreSQL database
- Stripe account for payment processing

## Environment Variables

```env
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/ecommerce
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=postgres
STRIPE_API_KEY=sk_test_your_stripe_secret_key
```

## Quick Start

1. Configure environment:
   ```bash
   cp env.template .env
   # Edit .env with your configuration
   ```

2. Build the project:
   ```bash
   ./mvnw clean install
   ```

3. Start the service:
   ```bash
   ./mvnw spring-boot:run
   ```

4. Service will be available at `http://localhost:8080`

## API Endpoints

- `POST /api/orders` - Create order (requires auth)
- `GET /api/orders` - Get user orders (requires auth)
- `GET /api/orders/{id}` - Get order by ID (requires auth)
- `POST /api/orders/{id}/payment` - Process payment
- `POST /api/payments/create-intent` - Create payment intent (requires auth)
- `GET /api/orders/{id}/status` - Get order status

## Stripe Integration

The service integrates with Stripe for payment processing:

- **Payment Intent creation** for secure payments
- **Webhook handling** for payment status updates
- **Refund processing** for order cancellations
- **Payment method validation**
- **Transaction logging** and audit trails

## Development Status

**TODO Implementation Required:**
- Order creation and management
- Payment processing with Stripe
- Order status tracking
- Invoice generation
- Database models and repositories
- Stripe webhook handling

## Features to Implement

- Order lifecycle management
- Payment processing with Stripe
- Order status tracking and notifications
- Invoice and receipt generation
- Refund processing
- Order analytics and reporting
- Integration with User and Product services
