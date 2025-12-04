# Order Service

A production-ready order management and payment processing service built with **Clean Architecture** principles.

## 🏗️ Architecture

This service follows Clean Architecture for maintainability, testability, and flexibility:

- **Domain Layer** - Core business logic and entities (no framework dependencies)
- **Application Layer** - Use cases orchestrating business workflows
- **Infrastructure Layer** - Technical implementations (database, HTTP, Stripe)
- **Presentation Layer** - REST API controllers and DTOs

### Project Structure

```
src/main/java/com/ecommerce/order/
├── domain/              # Core business logic
│   ├── entity/          # Rich domain models with business rules
│   ├── repository/      # Repository interfaces (ports)
│   └── service/         # Domain service interfaces (ports)
├── application/         # Use cases and business workflows
│   └── usecase/
├── infrastructure/      # Technical implementations
│   ├── persistence/     # Database adapters and mappers
│   └── external/        # External service adapters
├── presentation/        # REST API
│   ├── controller/      # API controllers
│   ├── dto/            # Request/Response DTOs
│   └── mapper/         # DTO mappers
└── config/             # Spring configuration
```

## 🚀 Technology Stack

- **Runtime**: Java 17+
- **Framework**: Spring Boot 3.2
- **Database**: PostgreSQL
- **Payment**: Stripe SDK
- **Build Tool**: Maven
- **Port**: 8080

## 📋 Prerequisites

- Java 17+
- Maven 3.6+
- PostgreSQL database
- Stripe account for payment processing

## ⚙️ Configuration

### Environment Variables

```env
# Database
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/ecommerce
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=postgres

# Stripe
STRIPE_API_KEY=sk_test_your_stripe_secret_key

# External Services
USER_SERVICE_URL=http://localhost:8081
PRODUCT_SERVICE_URL=http://localhost:8082
```

## 🚀 Quick Start

1. **Configure environment**:
   ```bash
   cp env.template .env
   # Edit .env with your configuration
   ```

2. **Build the project**:
   ```bash
   ./mvnw clean install
   ```

3. **Start the service**:
   ```bash
   ./mvnw spring-boot:run
   ```

4. Service will be available at `http://localhost:8080`

## 📡 API Endpoints

**Base URL**: `/api/v1/orders`

### Orders

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/v1/orders` | Create a new order | ✅ |
| `GET` | `/api/v1/orders` | Get user's orders | ✅ |
| `GET` | `/api/v1/orders/{id}` | Get order by ID | ✅ |
| `PUT` | `/api/v1/orders/{id}/status` | Update order status | ✅ |

**Authentication**: All endpoints require `X-User-UID` header with the authenticated user's UID.

### Example: Create Order

```bash
curl -X POST http://localhost:8080/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "X-User-UID: user123" \
  -d '{
    "userUid": "user123",
    "shippingAddress": "123 Main St, City, Country",
    "items": [
      {
        "productId": 1,
        "productName": "Product A",
        "quantity": 2,
        "unitPrice": 29.99
      }
    ]
  }'
```

### Example: Get User Orders

```bash
curl http://localhost:8080/api/v1/orders \
  -H "X-User-UID: user123"
```

### Example: Update Order Status

```bash
curl -X PUT http://localhost:8080/api/v1/orders/1/status \
  -H "Content-Type: application/json" \
  -H "X-User-UID: user123" \
  -d '{"status": "PROCESSING"}'
```

## 💳 Payment Integration

The service integrates with Stripe for secure payment processing:

- ✅ Payment Intent creation
- ✅ Webhook handling for payment events
- ✅ Automatic order status updates
- ✅ Signature verification for security
- ✅ Transaction logging

### Webhook Events Handled

- `payment_intent.succeeded` - Payment completed
- `payment_intent.payment_failed` - Payment failed
- `payment_intent.processing` - Payment processing
- `payment_intent.canceled` - Payment canceled
- `charge.refunded` - Charge refunded

## 🏛️ Domain Model

### Order States

Orders follow a strict state transition workflow:

```
PENDING → PROCESSING → SHIPPED → DELIVERED
   ↓
CANCELLED (only from PENDING, PROCESSING, or SHIPPED)
```

### Business Rules

- Orders can only be cancelled if not delivered
- Status transitions must follow the defined workflow
- Order total is automatically calculated from items
- User authorization is enforced at the domain level

## 🧪 Testing

Run tests:
```bash
./mvnw test
```

Build without tests:
```bash
./mvnw clean package -DskipTests
```

## 🔧 Development

### Adding a New Use Case

1. Create use case in `application/usecase/`
2. Register as bean in `config/UseCaseConfiguration.java`
3. Add controller endpoint in `presentation/controller/`

### Business Logic Location

- **Domain entities** - State management, validation, calculations
- **Use cases** - Workflow orchestration, external service coordination
- **Controllers** - HTTP handling, DTO conversion

## 📊 Clean Architecture Benefits

✅ **Testability** - Test business logic without frameworks  
✅ **Maintainability** - Clear structure, easy to navigate  
✅ **Flexibility** - Switch databases or services without changing business logic  
✅ **Scalability** - Add features without breaking existing code  

## 🐳 Docker Support

Build and run with Docker:

```bash
docker build -t order-service .
docker run -p 8080:8080 --env-file .env order-service
```


## 📄 License

Copyright © 2024 E-Commerce Platform
