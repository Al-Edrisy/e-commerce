# Database Architecture Documentation

## Overview

This e-commerce platform implements a **database-per-service** architecture pattern, a core principle of microservices design. Instead of a single shared database, each service has its own dedicated data store, ensuring loose coupling, independent scalability, and service autonomy.

## Architecture Pattern: Database-per-Service

### What is Database-per-Service?

Database-per-service is a microservices pattern where each service:
- Owns its database exclusively
- Has full control over its data schema
- Cannot directly access other services' databases
- Communicates with other services via APIs only

### Benefits

1. **Loose Coupling**: Services can evolve independently without breaking others
2. **Technology Flexibility**: Each service can use the most appropriate database technology
3. **Independent Scaling**: Scale databases based on individual service needs
4. **Fault Isolation**: Database issues in one service don't affect others
5. **Team Autonomy**: Teams can make database decisions independently
6. **Deployment Independence**: Deploy services without coordinating database changes

### Trade-offs

1. **Data Consistency**: Eventual consistency instead of ACID transactions across services
2. **Complexity**: More databases to manage and monitor
3. **Data Duplication**: Some data may be cached/duplicated across services
4. **Queries**: Cannot use SQL joins across services
5. **Transactions**: Distributed transactions require saga patterns or compensation logic

---

## Database Overview

### 1. Firebase/Firestore (User Service)

**Purpose**: User authentication, profiles, and session management

**Technology**: Google Firebase with Firestore (NoSQL document database)

**Why Firebase?**
- Built-in authentication with security rules
- Real-time synchronization capabilities
- Automatic scaling and high availability
- No infrastructure management required
- Global CDN for low-latency access

**Collections**:

#### users Collection
- **Document ID**: `firebase_uid` (Firebase Authentication UID)
- **Fields**: email, first_name, last_name, phone_number, status, last_login_at, login_count, email_verified, profile_completed, timezone, language, source, ip_address, user_agent, created_at, updated_at, deleted_at
- **Indexes**: Automatically managed by Firestore

#### user_sessions Collection
- **Document ID**: `session_token` (UUID)
- **Fields**: user_uid, device_type, browser, os, ip_address, location_country, location_city, is_active, last_activity_at, created_at, expires_at
- **Indexes**: Composite index on user_uid + is_active for active session queries

**Configuration**:
```javascript
// Environment Variables
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-service-account-email
```

**Access**: Via Firebase Admin SDK in User Service

---

### 2. PostgreSQL - Product Database

**Purpose**: Product catalog, categories, and reviews

**Technology**: PostgreSQL 15 (Relational database)

**Why PostgreSQL?**
- Strong ACID compliance for inventory management
- Rich indexing capabilities for product search
- JSON support for flexible product attributes
- Array support for tags and categories
- Mature ecosystem and tooling

**Connection Details**:
- **Host**: `postgres-product` (Docker network) / `localhost` (external)
- **Port**: `5433` (external) / `5432` (internal)
- **Database**: `product_database`
- **User**: `product_user`
- **Password**: `product_pass` (change in production!)

**Tables**:

#### categories
- **Primary Key**: `id` (SERIAL)
- **Fields**: name, description, status, sort_order, parent_id, slug, image_url, created_at, updated_at, deleted_at
- **Indexes**: status, parent_id, slug
- **Relationships**: Self-referencing (parent_id → categories.id)

#### products
- **Primary Key**: `id` (SERIAL)
- **Fields**: name, description, price, stock, category_id, sku, image_url, status, tags (array), slug, is_featured, cost_price, margin_percentage, created_at, updated_at, deleted_at
- **Indexes**: category_id, status, sku, slug, price, tags (GIN)
- **Relationships**: category_id → categories.id

#### product_reviews
- **Primary Key**: `id` (SERIAL)
- **Fields**: product_id, user_uid (VARCHAR), order_id (INTEGER), rating, title, comment, is_verified_purchase, is_approved, created_at, updated_at, deleted_at
- **Indexes**: product_id, user_uid, rating
- **Relationships**: product_id → products.id
- **Cross-Service References**: user_uid (Firebase), order_id (Order Service) - NO foreign keys

**Initialization Script**: `database/product-service-init.sql`

---

### 3. PostgreSQL - Order Database

**Purpose**: Order processing, order items, and payment transactions

**Technology**: PostgreSQL 15 (Relational database)

**Why PostgreSQL?**
- ACID transactions for financial data integrity
- Strong consistency for order processing
- JSON support for payment gateway responses
- Reliable for critical business operations

**Connection Details**:
- **Host**: `postgres-order` (Docker network) / `localhost` (external)
- **Port**: `5434` (external) / `5432` (internal)
- **Database**: `order_database`
- **User**: `order_user`
- **Password**: `order_pass` (change in production!)

**Tables**:

#### orders
- **Primary Key**: `id` (SERIAL)
- **Fields**: user_uid (VARCHAR), total_amount, status, subtotal, tax_amount, shipping_amount, discount_amount, payment_status, payment_method, shipping_method, tracking_number, created_at, updated_at
- **Indexes**: user_uid, status, payment_status, created_at
- **Cross-Service References**: user_uid (Firebase) - NO foreign key

#### order_items
- **Primary Key**: `id` (SERIAL)
- **Fields**: order_id, product_id (INTEGER), product_name, quantity, unit_price, subtotal, tax_amount, discount_amount, final_price, created_at, updated_at
- **Indexes**: order_id, product_id
- **Relationships**: order_id → orders.id (CASCADE delete)
- **Cross-Service References**: product_id (Product Service) - NO foreign key
- **Note**: product_name cached for historical accuracy

#### payments
- **Primary Key**: `id` (SERIAL)
- **Fields**: order_id, amount, status, payment_method, currency, transaction_id, gateway, gateway_response (JSONB), created_at, updated_at
- **Indexes**: order_id, status, transaction_id
- **Relationships**: order_id → orders.id (CASCADE delete)

**Initialization Script**: `database/order-service-init.sql`

---

### 4. PostgreSQL - Gateway Database

**Purpose**: Centralized API logging and analytics

**Technology**: PostgreSQL 15 (Relational database)

**Why PostgreSQL?**
- Efficient time-series data storage
- JSONB for flexible event properties
- GIN indexes for fast JSON queries
- Aggregation capabilities for analytics

**Connection Details**:
- **Host**: `postgres-gateway` (Docker network) / `localhost` (external)
- **Port**: `5435` (external) / `5432` (internal)
- **Database**: `gateway_database`
- **User**: `gateway_user`
- **Password**: `gateway_pass` (change in production!)

**Tables**:

#### api_logs
- **Primary Key**: `id` (SERIAL)
- **Fields**: service_name, path, method, status_code, latency_ms, user_uid, ip_address (INET), user_agent, request_id, created_at
- **Indexes**: service_name, status_code, user_uid, created_at
- **Purpose**: Track all API requests across services

#### analytics_events
- **Primary Key**: `id` (SERIAL)
- **Fields**: event_name, user_uid, session_id, properties (JSONB), ip_address (INET), user_agent, referrer, utm_source, utm_medium, utm_campaign, created_at
- **Indexes**: event_name, user_uid, created_at, properties (GIN)
- **Purpose**: Track user behavior and marketing attribution

**Initialization Script**: `database/gateway-init.sql`

---

## Cross-Service Data References

### The Challenge

In a microservices architecture, services cannot use database foreign keys to reference data in other services. This is by design to maintain loose coupling.

### Our Solution

We use **application-level references** with string/integer identifiers:

1. **User References**: Use `user_uid` (Firebase UID) as VARCHAR(255)
   - Product reviews store user_uid
   - Orders store user_uid
   - Services validate users via User Service API

2. **Product References**: Use `product_id` as INTEGER
   - Order items store product_id
   - Services fetch product details via Product Service API
   - Product name cached in order_items for historical records

3. **Order References**: Use `order_id` as INTEGER
   - Product reviews can link to orders
   - Services verify purchases via Order Service API

### Data Consistency Strategy

**Validation Flow**:
```
1. Service receives request with cross-service reference (e.g., user_uid)
2. Service calls other service's API to validate reference exists
3. If valid, proceed with operation
4. If invalid, return 404 error
5. Cache frequently accessed data to reduce API calls
```

**Example - Creating an Order**:
```
1. Order Service receives: { user_uid, product_ids }
2. Call User Service API: GET /users/{user_uid} → Validate user exists
3. Call Product Service API: GET /products/{id} → Get details, check stock
4. Create order with cached product information
5. Call Product Service API: POST /products/{id}/decrement-stock
6. If any step fails, rollback transaction
```

---

## Running Initialization Scripts Manually

### Prerequisites

```bash
# Ensure Docker containers are running
docker-compose up -d postgres-product postgres-order postgres-gateway

# Wait for databases to be healthy (check with)
docker-compose ps
```

### Product Database

```bash
# Run initialization script
docker exec -i postgres-product psql -U product_user -d product_database < database/product-service-init.sql

# Verify tables created
docker exec -it postgres-product psql -U product_user -d product_database -c "\dt"

# Check sample data
docker exec -it postgres-product psql -U product_user -d product_database -c "SELECT * FROM categories;"
docker exec -it postgres-product psql -U product_user -d product_database -c "SELECT id, name, price, stock FROM products LIMIT 5;"
```

### Order Database

```bash
# Run initialization script
docker exec -i postgres-order psql -U order_user -d order_database < database/order-service-init.sql

# Verify tables created
docker exec -it postgres-order psql -U order_user -d order_database -c "\dt"

# Verify schema
docker exec -it postgres-order psql -U order_user -d order_database -c "\d orders"
```

### Gateway Database

```bash
# Run initialization script
docker exec -i postgres-gateway psql -U gateway_user -d gateway_database < database/gateway-init.sql

# Verify tables created
docker exec -it postgres-gateway psql -U gateway_user -d gateway_database -c "\dt"

# Verify indexes
docker exec -it postgres-gateway psql -U gateway_user -d gateway_database -c "\di"
```

### Re-initializing a Database

If you need to reset a database to its initial state:

```bash
# Product Database - Drop and recreate
docker exec -it postgres-product psql -U product_user -d product_database -c "
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO product_user;
"
docker exec -i postgres-product psql -U product_user -d product_database < database/product-service-init.sql

# Order Database - Drop and recreate
docker exec -it postgres-order psql -U order_user -d order_database -c "
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO order_user;
"
docker exec -i postgres-order psql -U order_user -d order_database < database/order-service-init.sql

# Gateway Database - Drop and recreate
docker exec -it postgres-gateway psql -U gateway_user -d gateway_database -c "
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO gateway_user;
"
docker exec -i postgres-gateway psql -U gateway_user -d gateway_database < database/gateway-init.sql
```

---

## Accessing Databases for Debugging

### Using Docker Exec (Recommended for Development)

```bash
# Product Database
docker exec -it postgres-product psql -U product_user -d product_database

# Order Database
docker exec -it postgres-order psql -U order_user -d order_database

# Gateway Database
docker exec -it postgres-gateway psql -U gateway_user -d gateway_database
```

### Using psql from Host Machine

If you have PostgreSQL client tools installed locally:

```bash
# Product Database
psql -h localhost -p 5433 -U product_user -d product_database

# Order Database
psql -h localhost -p 5434 -U order_user -d order_database

# Gateway Database
psql -h localhost -p 5435 -U gateway_user -d gateway_database
```

### Using External Tools (pgAdmin, DBeaver, TablePlus, etc.)

**Product Database**:
- Host: `localhost`
- Port: `5433`
- Database: `product_database`
- Username: `product_user`
- Password: `product_pass`

**Order Database**:
- Host: `localhost`
- Port: `5434`
- Database: `order_database`
- Username: `order_user`
- Password: `order_pass`

**Gateway Database**:
- Host: `localhost`
- Port: `5435`
- Database: `gateway_database`
- Username: `gateway_user`
- Password: `gateway_pass`

### Firebase/Firestore

Access via Firebase Console:
1. Go to https://console.firebase.google.com
2. Select your project
3. Navigate to Firestore Database
4. Browse collections: `users`, `user_sessions`

Or use Firebase CLI:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Access Firestore
firebase firestore:indexes
```

---

## Common Database Operations

### Viewing Table Structure

```bash
# PostgreSQL
docker exec -it postgres-product psql -U product_user -d product_database

# Show all tables
\dt

# Show table structure
\d products

# Show indexes
\di
```

### Checking Record Counts

```bash
# Product Database
docker exec -it postgres-product psql -U product_user -d product_database -c "
SELECT 'categories' as table_name, COUNT(*) as count FROM categories
UNION ALL SELECT 'products', COUNT(*) FROM products
UNION ALL SELECT 'product_reviews', COUNT(*) FROM product_reviews;
"

# Order Database
docker exec -it postgres-order psql -U order_user -d order_database -c "
SELECT 'orders' as table_name, COUNT(*) as count FROM orders
UNION ALL SELECT 'order_items', COUNT(*) FROM order_items
UNION ALL SELECT 'payments', COUNT(*) FROM payments;
"

# Gateway Database
docker exec -it postgres-gateway psql -U gateway_user -d gateway_database -c "
SELECT 'api_logs' as table_name, COUNT(*) as count FROM api_logs
UNION ALL SELECT 'analytics_events', COUNT(*) FROM analytics_events;
"
```

### Viewing Recent Records

```bash
# Recent orders
docker exec -it postgres-order psql -U order_user -d order_database -c "
SELECT id, user_uid, total_amount, status, created_at 
FROM orders 
ORDER BY created_at DESC 
LIMIT 10;
"

# Recent API logs
docker exec -it postgres-gateway psql -U gateway_user -d gateway_database -c "
SELECT service_name, path, method, status_code, latency_ms, created_at 
FROM api_logs 
ORDER BY created_at DESC 
LIMIT 10;
"
```

### Clearing Test Data

```bash
# Product Database (clear data but keep schema)
docker exec -it postgres-product psql -U product_user -d product_database -c "
TRUNCATE TABLE product_reviews CASCADE;
TRUNCATE TABLE products CASCADE;
TRUNCATE TABLE categories CASCADE;

# Reset sequences
ALTER SEQUENCE categories_id_seq RESTART WITH 1;
ALTER SEQUENCE products_id_seq RESTART WITH 1;
ALTER SEQUENCE product_reviews_id_seq RESTART WITH 1;
"
```

---

## Backup and Restore

### Backing Up Individual Databases

```bash
# Product Database
docker exec postgres-product pg_dump -U product_user product_database > backup_product_$(date +%Y%m%d).sql

# Order Database
docker exec postgres-order pg_dump -U order_user order_database > backup_order_$(date +%Y%m%d).sql

# Gateway Database
docker exec postgres-gateway pg_dump -U gateway_user gateway_database > backup_gateway_$(date +%Y%m%d).sql
```

### Restoring from Backup

```bash
# Product Database
docker exec -i postgres-product psql -U product_user -d product_database < backup_product_20241108.sql

# Order Database
docker exec -i postgres-order psql -U order_user -d order_database < backup_order_20241108.sql

# Gateway Database
docker exec -i postgres-gateway psql -U gateway_user -d gateway_database < backup_gateway_20241108.sql
```

### Firebase/Firestore Backup

Firestore backups are managed through:
1. Google Cloud Console → Firestore → Import/Export
2. Automated backups (configure in Firebase Console)
3. Export via gcloud CLI:

```bash
gcloud firestore export gs://your-bucket-name/firestore-backups
```

---

## Monitoring and Maintenance

### Database Health Checks

```bash
# Check if databases are accepting connections
docker exec postgres-product pg_isready -U product_user -d product_database
docker exec postgres-order pg_isready -U order_user -d order_database
docker exec postgres-gateway pg_isready -U gateway_user -d gateway_database

# View active connections
docker exec -it postgres-product psql -U product_user -d product_database -c "
SELECT count(*) as active_connections 
FROM pg_stat_activity 
WHERE datname = 'product_database';
"
```

### Connection Pool Monitoring

```bash
# View active connections
docker exec -it postgres-product psql -U product_user -d product_database -c "
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
"
```

### Disk Usage

```bash
# Database size
docker exec -it postgres-product psql -U product_user -d product_database -c "
SELECT pg_size_pretty(pg_database_size('product_database'));
"

# Table sizes
docker exec -it postgres-product psql -U product_user -d product_database -c "
SELECT 
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
"

# Check Docker volume usage
docker system df -v
```

### Cleaning Up Old Data

```bash
# Clean up old data
docker exec -it postgres-gateway psql -U gateway_user -d gateway_database -c "
DELETE FROM api_logs WHERE created_at < NOW() - INTERVAL '30 days';
DELETE FROM analytics_events WHERE created_at < NOW() - INTERVAL '90 days';

# Reclaim storage space
VACUUM FULL;
"
```

### Index Usage Statistics

```bash
# Analyze query performance
docker exec -it postgres-product psql -U product_user -d product_database -c "
EXPLAIN ANALYZE
SELECT * FROM products WHERE category_id = 1;
"

# View index usage
docker exec -it postgres-product psql -U product_user -d product_database -c "
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
"
```

### Slow Query Logging

```bash
# Enable slow query logging (temporary)
docker exec -it postgres-product psql -U postgres -d product_database -c "
ALTER DATABASE product_database 
SET log_min_duration_statement = 1000;
"

# View slow queries in logs
docker logs postgres-product 2>&1 | grep "duration"

# Analyze query performance
docker exec -it postgres-product psql -U product_user -d product_database -c "
EXPLAIN ANALYZE SELECT * FROM products WHERE category_id = 1;
"
```

---

## Troubleshooting

### Database Won't Start

```bash
# Check container status
docker-compose ps

# Check container logs
docker logs postgres-product
docker logs postgres-order
docker logs postgres-gateway

# Restart specific database
docker-compose restart postgres-product
```

### Connection Refused

```bash
# Verify containers are running
docker ps | grep postgres

# Check network connectivity
docker network ls
docker network inspect <network_name>

# Test connection from another container
docker exec -it api-gateway ping postgres-product
```

### Slow Queries

```bash
# Analyze query performance
docker exec -it postgres-product psql -U product_user -d product_database -c "
EXPLAIN ANALYZE
SELECT * FROM products WHERE category_id = 1;
"

# Check index usage
docker exec -it postgres-product psql -U product_user -d product_database -c "
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
"
```

### Out of Disk Space

```bash
# Check Docker volume usage
docker system df -v

# Clean up old data (see Maintenance section)

# Vacuum database to reclaim space
docker exec -it postgres-gateway psql -U gateway_user -d gateway_database -c "VACUUM FULL;"
```

---

## Security Best Practices

### Development Environment

- ✅ Use simple passwords for ease of development
- ✅ Expose database ports for debugging
- ✅ Use default Docker networks

### Production Environment

- ⚠️ **Change all default passwords**
- ⚠️ **Remove exposed database ports** (use internal Docker networks only)
- ⚠️ **Enable SSL/TLS** for all database connections
- ⚠️ **Use secrets management** (AWS Secrets Manager, HashiCorp Vault, etc.)
- ⚠️ **Implement database user permissions** (principle of least privilege)
- ⚠️ **Enable audit logging** for sensitive operations
- ⚠️ **Regular security updates** for PostgreSQL and Firebase SDK
- ⚠️ **Network isolation** using private subnets
- ⚠️ **Firewall rules** to restrict database access

---

## Migration Guide

For detailed instructions on migrating from the old monolithic database to this new architecture, see:

**[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)**

The migration guide includes:
- Step-by-step migration process
- Data export and transformation scripts
- Rollback procedures
- Verification and testing steps

---

## Additional Resources

- **Architecture Overview**: [../ARCHITECTURE.md](../ARCHITECTURE.md)
- **Design Document**: [../.kiro/specs/database-architecture-redesign/design.md](../.kiro/specs/database-architecture-redesign/design.md)
- **Requirements**: [../.kiro/specs/database-architecture-redesign/requirements.md](../.kiro/specs/database-architecture-redesign/requirements.md)
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
- **Firebase Documentation**: https://firebase.google.com/docs
- **Firestore Documentation**: https://firebase.google.com/docs/firestore

---

## Quick Reference

### Database Ports

| Database | Internal Port | External Port | Container Name |
|----------|--------------|---------------|----------------|
| Product  | 5432         | 5433          | postgres-product |
| Order    | 5432         | 5434          | postgres-order |
| Gateway  | 5432         | 5435          | postgres-gateway |

### Database Credentials (Development)

| Database | Name | User | Password |
|----------|------|------|----------|
| Product  | product_database | product_user | product_pass |
| Order    | order_database | order_user | order_pass |
| Gateway  | gateway_database | gateway_user | gateway_pass |

### Initialization Scripts

| Database | Script Location |
|----------|----------------|
| Product  | `database/product-service-init.sql` |
| Order    | `database/order-service-init.sql` |
| Gateway  | `database/gateway-init.sql` |

### Service Configuration Files

| Service | Configuration File |
|---------|-------------------|
| Product Service | `product-service/app/config/database.py` |
| Order Service | `order-service/src/main/resources/application.properties` |
| User Service | `user-service/src/config/firebase.js` |
| API Gateway | `api-gateway/src/config/database.ts` |

---

## Support

For questions or issues:
1. Check this documentation first
2. Review the migration guide for common issues
3. Check service logs: `docker logs <service-name>`
4. Check database logs: `docker logs <database-container>`
5. Consult the design document for architectural decisions
