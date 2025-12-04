# Database Migration Guide

## Overview

This guide provides step-by-step instructions for migrating from the monolithic single-database architecture to the new database-per-service architecture. The migration transforms one shared PostgreSQL database into four separate data stores:

1. **Firebase/Firestore** - User profiles and sessions (User Service)
2. **PostgreSQL (product_database)** - Product catalog (Product Service)
3. **PostgreSQL (order_database)** - Orders and payments (Order Service)
4. **PostgreSQL (gateway_database)** - API logs and analytics (API Gateway)

**Migration Duration:** Approximately 2-4 hours depending on data volume

**Downtime Required:** Yes (recommended maintenance window)

**Rollback Time:** 30-60 minutes

---

## Prerequisites

Before starting the migration, ensure you have:

- [ ] Access to the production database with backup privileges
- [ ] Firebase project created with Firestore enabled
- [ ] Firebase Admin SDK credentials (service account JSON)
- [ ] Docker and Docker Compose installed
- [ ] Sufficient disk space (3x current database size recommended)
- [ ] Database client tools installed (psql, pg_dump)
- [ ] Node.js installed (for Firebase data import scripts)
- [ ] All services stopped or in maintenance mode

---

## Phase 1: Backup Existing Database

### 1.1 Create Full Database Backup

```bash
# Set backup directory
export BACKUP_DIR="./database-backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

# Backup entire database
pg_dump -h localhost -p 5432 -U postgres -d ecommerce_db \
  --format=custom \
  --file=$BACKUP_DIR/full_backup.dump

# Create SQL format backup for easier inspection
pg_dump -h localhost -p 5432 -U postgres -d ecommerce_db \
  --format=plain \
  --file=$BACKUP_DIR/full_backup.sql
```

### 1.2 Verify Backup Integrity

```bash
# Check backup file size
ls -lh $BACKUP_DIR/

# Verify backup can be read
pg_restore --list $BACKUP_DIR/full_backup.dump | head -20

# Count records in each table
psql -h localhost -p 5432 -U postgres -d ecommerce_db -c "
SELECT 
  'users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'categories', COUNT(*) FROM categories
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'order_items', COUNT(*) FROM order_items
UNION ALL
SELECT 'payments', COUNT(*) FROM payments
UNION ALL
SELECT 'user_sessions', COUNT(*) FROM user_sessions
UNION ALL
SELECT 'product_reviews', COUNT(*) FROM product_reviews
UNION ALL
SELECT 'system_logs', COUNT(*) FROM system_logs
UNION ALL
SELECT 'analytics_events', COUNT(*) FROM analytics_events;
"

# Save record counts for verification later
psql -h localhost -p 5432 -U postgres -d ecommerce_db -c "
SELECT 
  'users' as table_name, COUNT(*) as record_count FROM users
UNION ALL SELECT 'categories', COUNT(*) FROM categories
UNION ALL SELECT 'products', COUNT(*) FROM products
UNION ALL SELECT 'orders', COUNT(*) FROM orders
UNION ALL SELECT 'order_items', COUNT(*) FROM order_items
UNION ALL SELECT 'payments', COUNT(*) FROM payments
UNION ALL SELECT 'user_sessions', COUNT(*) FROM user_sessions
UNION ALL SELECT 'product_reviews', COUNT(*) FROM product_reviews
UNION ALL SELECT 'system_logs', COUNT(*) FROM system_logs
UNION ALL SELECT 'analytics_events', COUNT(*) FROM analytics_events;
" > $BACKUP_DIR/record_counts.txt

echo "Backup completed at: $BACKUP_DIR"
```

### 1.3 Document Current State

```bash
# Save database schema
pg_dump -h localhost -p 5432 -U postgres -d ecommerce_db \
  --schema-only \
  --file=$BACKUP_DIR/schema_only.sql

# Save current configuration
docker-compose config > $BACKUP_DIR/docker-compose-before.yml
```

---

## Phase 2: Export Data from Monolithic Database

### 2.1 Export User Data

```bash
# Export users table
psql -h localhost -p 5432 -U postgres -d ecommerce_db -c "
COPY (
  SELECT 
    id,
    firebase_uid,
    email,
    first_name,
    last_name,
    phone_number,
    status,
    last_login_at,
    login_count,
    email_verified,
    profile_completed,
    timezone,
    language,
    source,
    ip_address::text,
    user_agent,
    created_at,
    updated_at,
    deleted_at
  FROM users
  WHERE deleted_at IS NULL
  ORDER BY id
) TO STDOUT WITH CSV HEADER
" > $BACKUP_DIR/users.csv

# Export user sessions
psql -h localhost -p 5432 -U postgres -d ecommerce_db -c "
COPY (
  SELECT 
    id,
    user_id,
    session_token,
    device_type,
    browser,
    os,
    ip_address::text,
    location_country,
    location_city,
    is_active,
    last_activity_at,
    created_at,
    expires_at
  FROM user_sessions
  ORDER BY id
) TO STDOUT WITH CSV HEADER
" > $BACKUP_DIR/user_sessions.csv
```

### 2.2 Export Product Data

```bash
# Export categories
psql -h localhost -p 5432 -U postgres -d ecommerce_db -c "
COPY (
  SELECT 
    id,
    name,
    description,
    status,
    sort_order,
    parent_id,
    slug,
    image_url,
    created_at,
    updated_at,
    deleted_at
  FROM categories
  WHERE deleted_at IS NULL
  ORDER BY id
) TO STDOUT WITH CSV HEADER
" > $BACKUP_DIR/categories.csv

# Export products
psql -h localhost -p 5432 -U postgres -d ecommerce_db -c "
COPY (
  SELECT 
    id,
    name,
    description,
    price,
    stock,
    category_id,
    sku,
    image_url,
    status,
    tags,
    slug,
    is_featured,
    cost_price,
    margin_percentage,
    created_at,
    updated_at,
    deleted_at
  FROM products
  WHERE deleted_at IS NULL
  ORDER BY id
) TO STDOUT WITH CSV HEADER
" > $BACKUP_DIR/products.csv

# Export product reviews
psql -h localhost -p 5432 -U postgres -d ecommerce_db -c "
COPY (
  SELECT 
    pr.id,
    pr.product_id,
    u.firebase_uid as user_uid,
    pr.order_id,
    pr.rating,
    pr.title,
    pr.comment,
    pr.is_verified_purchase,
    pr.is_approved,
    pr.created_at,
    pr.updated_at,
    pr.deleted_at
  FROM product_reviews pr
  JOIN users u ON pr.user_id = u.id
  WHERE pr.deleted_at IS NULL
  ORDER BY pr.id
) TO STDOUT WITH CSV HEADER
" > $BACKUP_DIR/product_reviews.csv
```

### 2.3 Export Order Data

```bash
# Export orders
psql -h localhost -p 5432 -U postgres -d ecommerce_db -c "
COPY (
  SELECT 
    o.id,
    u.firebase_uid as user_uid,
    o.total_amount,
    o.status,
    o.subtotal,
    o.tax_amount,
    o.shipping_amount,
    o.discount_amount,
    o.payment_status,
    o.payment_method,
    o.shipping_method,
    o.tracking_number,
    o.created_at,
    o.updated_at
  FROM orders o
  JOIN users u ON o.user_id = u.id
  ORDER BY o.id
) TO STDOUT WITH CSV HEADER
" > $BACKUP_DIR/orders.csv

# Export order items
psql -h localhost -p 5432 -U postgres -d ecommerce_db -c "
COPY (
  SELECT 
    id,
    order_id,
    product_id,
    product_name,
    quantity,
    unit_price,
    subtotal,
    tax_amount,
    discount_amount,
    final_price,
    created_at,
    updated_at
  FROM order_items
  ORDER BY id
) TO STDOUT WITH CSV HEADER
" > $BACKUP_DIR/order_items.csv

# Export payments
psql -h localhost -p 5432 -U postgres -d ecommerce_db -c "
COPY (
  SELECT 
    id,
    order_id,
    amount,
    status,
    payment_method,
    currency,
    transaction_id,
    gateway,
    gateway_response,
    created_at,
    updated_at
  FROM payments
  ORDER BY id
) TO STDOUT WITH CSV HEADER
" > $BACKUP_DIR/payments.csv
```

### 2.4 Export Gateway Data

```bash
# Export system logs (rename to api_logs)
psql -h localhost -p 5432 -U postgres -d ecommerce_db -c "
COPY (
  SELECT 
    id,
    service_name,
    message as path,
    'GET' as method,
    200 as status_code,
    0 as latency_ms,
    user_id,
    ip_address::text,
    user_agent,
    request_id,
    created_at
  FROM system_logs
  ORDER BY id
) TO STDOUT WITH CSV HEADER
" > $BACKUP_DIR/api_logs.csv

# Export analytics events
psql -h localhost -p 5432 -U postgres -d ecommerce_db -c "
COPY (
  SELECT 
    id,
    event_name,
    user_id,
    session_id,
    properties,
    ip_address::text,
    user_agent,
    referrer,
    utm_source,
    utm_medium,
    utm_campaign,
    created_at
  FROM analytics_events
  ORDER BY id
) TO STDOUT WITH CSV HEADER
" > $BACKUP_DIR/analytics_events.csv
```

---

## Phase 3: Transform Data for New Schemas

### 3.1 Create Firebase Import Script

Create a Node.js script to import users and sessions into Firestore:

```javascript
// scripts/import-to-firebase.js
const admin = require('firebase-admin');
const fs = require('fs');
const csv = require('csv-parser');

// Initialize Firebase Admin
const serviceAccount = require('./firebase-service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function importUsers(csvPath) {
  const users = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        users.push({
          firebase_uid: row.firebase_uid,
          email: row.email,
          first_name: row.first_name || '',
          last_name: row.last_name || '',
          phone_number: row.phone_number || '',
          status: row.status || 'active',
          last_login_at: row.last_login_at ? admin.firestore.Timestamp.fromDate(new Date(row.last_login_at)) : null,
          login_count: parseInt(row.login_count) || 0,
          email_verified: row.email_verified === 'true' || row.email_verified === 't',
          profile_completed: row.profile_completed === 'true' || row.profile_completed === 't',
          timezone: row.timezone || 'UTC',
          language: row.language || 'en',
          source: row.source || 'web',
          ip_address: row.ip_address || '',
          user_agent: row.user_agent || '',
          created_at: admin.firestore.Timestamp.fromDate(new Date(row.created_at)),
          updated_at: admin.firestore.Timestamp.fromDate(new Date(row.updated_at)),
          deleted_at: row.deleted_at ? admin.firestore.Timestamp.fromDate(new Date(row.deleted_at)) : null
        });
      })
      .on('end', async () => {
        console.log(`Importing ${users.length} users to Firestore...`);
        
        const batch = db.batch();
        let count = 0;
        
        for (const user of users) {
          const docRef = db.collection('users').doc(user.firebase_uid);
          batch.set(docRef, user);
          count++;
          
          // Firestore batch limit is 500
          if (count % 500 === 0) {
            await batch.commit();
            console.log(`Committed ${count} users`);
          }
        }
        
        if (count % 500 !== 0) {
          await batch.commit();
        }
        
        console.log(`Successfully imported ${users.length} users`);
        resolve();
      })
      .on('error', reject);
  });
}

async function importSessions(csvPath, usersMap) {
  const sessions = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        // Map user_id to firebase_uid
        const userUid = usersMap[row.user_id];
        if (!userUid) {
          console.warn(`User ID ${row.user_id} not found, skipping session`);
          return;
        }
        
        sessions.push({
          session_token: row.session_token,
          user_uid: userUid,
          device_type: row.device_type || 'desktop',
          browser: row.browser || '',
          os: row.os || '',
          ip_address: row.ip_address || '',
          location_country: row.location_country || '',
          location_city: row.location_city || '',
          is_active: row.is_active === 'true' || row.is_active === 't',
          last_activity_at: admin.firestore.Timestamp.fromDate(new Date(row.last_activity_at)),
          created_at: admin.firestore.Timestamp.fromDate(new Date(row.created_at)),
          expires_at: admin.firestore.Timestamp.fromDate(new Date(row.expires_at))
        });
      })
      .on('end', async () => {
        console.log(`Importing ${sessions.length} sessions to Firestore...`);
        
        const batch = db.batch();
        let count = 0;
        
        for (const session of sessions) {
          const docRef = db.collection('user_sessions').doc(session.session_token);
          batch.set(docRef, session);
          count++;
          
          if (count % 500 === 0) {
            await batch.commit();
            console.log(`Committed ${count} sessions`);
          }
        }
        
        if (count % 500 !== 0) {
          await batch.commit();
        }
        
        console.log(`Successfully imported ${sessions.length} sessions`);
        resolve();
      })
      .on('error', reject);
  });
}

async function main() {
  try {
    // Build user_id to firebase_uid mapping
    const usersMap = {};
    await new Promise((resolve, reject) => {
      fs.createReadStream(process.argv[2])
        .pipe(csv())
        .on('data', (row) => {
          usersMap[row.id] = row.firebase_uid;
        })
        .on('end', resolve)
        .on('error', reject);
    });
    
    await importUsers(process.argv[2]);
    await importSessions(process.argv[3]);
    
    console.log('Migration to Firebase completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();
```

### 3.2 Install Dependencies and Run Firebase Import

```bash
# Create scripts directory
mkdir -p scripts
cd scripts

# Initialize Node.js project
npm init -y
npm install firebase-admin csv-parser

# Copy your Firebase service account JSON to scripts/firebase-service-account.json
# Download from Firebase Console > Project Settings > Service Accounts

# Run the import script
node import-to-firebase.js \
  ../database-backups/TIMESTAMP/users.csv \
  ../database-backups/TIMESTAMP/user_sessions.csv
```

### 3.3 Create User ID Mapping File

Create a mapping file for transforming user_id to user_uid in other tables:

```bash
# Create user_id to firebase_uid mapping
psql -h localhost -p 5432 -U postgres -d ecommerce_db -c "
COPY (
  SELECT id, firebase_uid
  FROM users
  ORDER BY id
) TO STDOUT WITH CSV HEADER
" > $BACKUP_DIR/user_id_mapping.csv
```

### 3.4 Transform Data Files

The exported CSV files already contain the transformed data:
- `product_reviews.csv` - Contains `user_uid` instead of `user_id`
- `orders.csv` - Contains `user_uid` instead of `user_id`
- `analytics_events.csv` - Will need user_uid lookup during import

---

## Phase 4: Import Data into Separate Databases

### 4.1 Start New Database Containers

```bash
# Start only the database containers
docker-compose up -d postgres-product postgres-order postgres-gateway

# Wait for databases to be healthy
docker-compose ps

# Verify databases are initialized
docker exec -it postgres-product psql -U product_user -d product_database -c "\dt"
docker exec -it postgres-order psql -U order_user -d order_database -c "\dt"
docker exec -it postgres-gateway psql -U gateway_user -d gateway_database -c "\dt"
```

### 4.2 Import Product Service Data

```bash
# Import categories
docker exec -i postgres-product psql -U product_user -d product_database -c "
COPY categories (id, name, description, status, sort_order, parent_id, slug, image_url, created_at, updated_at, deleted_at)
FROM STDIN WITH CSV HEADER
" < $BACKUP_DIR/categories.csv

# Import products
docker exec -i postgres-product psql -U product_user -d product_database -c "
COPY products (id, name, description, price, stock, category_id, sku, image_url, status, tags, slug, is_featured, cost_price, margin_percentage, created_at, updated_at, deleted_at)
FROM STDIN WITH CSV HEADER
" < $BACKUP_DIR/products.csv

# Import product reviews
docker exec -i postgres-product psql -U product_user -d product_database -c "
COPY product_reviews (id, product_id, user_uid, order_id, rating, title, comment, is_verified_purchase, is_approved, created_at, updated_at, deleted_at)
FROM STDIN WITH CSV HEADER
" < $BACKUP_DIR/product_reviews.csv

# Reset sequences
docker exec -it postgres-product psql -U product_user -d product_database -c "
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));
SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));
SELECT setval('product_reviews_id_seq', (SELECT MAX(id) FROM product_reviews));
"
```

### 4.3 Import Order Service Data

```bash
# Import orders
docker exec -i postgres-order psql -U order_user -d order_database -c "
COPY orders (id, user_uid, total_amount, status, subtotal, tax_amount, shipping_amount, discount_amount, payment_status, payment_method, shipping_method, tracking_number, created_at, updated_at)
FROM STDIN WITH CSV HEADER
" < $BACKUP_DIR/orders.csv

# Import order items
docker exec -i postgres-order psql -U order_user -d order_database -c "
COPY order_items (id, order_id, product_id, product_name, quantity, unit_price, subtotal, tax_amount, discount_amount, final_price, created_at, updated_at)
FROM STDIN WITH CSV HEADER
" < $BACKUP_DIR/order_items.csv

# Import payments
docker exec -i postgres-order psql -U order_user -d order_database -c "
COPY payments (id, order_id, amount, status, payment_method, currency, transaction_id, gateway, gateway_response, created_at, updated_at)
FROM STDIN WITH CSV HEADER
" < $BACKUP_DIR/payments.csv

# Reset sequences
docker exec -it postgres-order psql -U order_user -d order_database -c "
SELECT setval('orders_id_seq', (SELECT MAX(id) FROM orders));
SELECT setval('order_items_id_seq', (SELECT MAX(id) FROM order_items));
SELECT setval('payments_id_seq', (SELECT MAX(id) FROM payments));
"
```

### 4.4 Import API Gateway Data

```bash
# Import api_logs
docker exec -i postgres-gateway psql -U gateway_user -d gateway_database -c "
COPY api_logs (id, service_name, path, method, status_code, latency_ms, user_uid, ip_address, user_agent, request_id, created_at)
FROM STDIN WITH CSV HEADER
" < $BACKUP_DIR/api_logs.csv

# Import analytics_events
docker exec -i postgres-gateway psql -U gateway_user -d gateway_database -c "
COPY analytics_events (id, event_name, user_uid, session_id, properties, ip_address, user_agent, referrer, utm_source, utm_medium, utm_campaign, created_at)
FROM STDIN WITH CSV HEADER
" < $BACKUP_DIR/analytics_events.csv

# Reset sequences
docker exec -it postgres-gateway psql -U gateway_user -d gateway_database -c "
SELECT setval('api_logs_id_seq', (SELECT MAX(id) FROM api_logs));
SELECT setval('analytics_events_id_seq', (SELECT MAX(id) FROM analytics_events));
"
```

---

## Phase 5: Verify Data Integrity and Test Services

### 5.1 Verify Record Counts

```bash
# Check Product Service
echo "=== Product Service Record Counts ==="
docker exec -it postgres-product psql -U product_user -d product_database -c "
SELECT 'categories' as table_name, COUNT(*) as count FROM categories
UNION ALL SELECT 'products', COUNT(*) FROM products
UNION ALL SELECT 'product_reviews', COUNT(*) FROM product_reviews;
"

# Check Order Service
echo "=== Order Service Record Counts ==="
docker exec -it postgres-order psql -U order_user -d order_database -c "
SELECT 'orders' as table_name, COUNT(*) as count FROM orders
UNION ALL SELECT 'order_items', COUNT(*) FROM order_items
UNION ALL SELECT 'payments', COUNT(*) FROM payments;
"

# Check API Gateway
echo "=== API Gateway Record Counts ==="
docker exec -it postgres-gateway psql -U gateway_user -d gateway_database -c "
SELECT 'api_logs' as table_name, COUNT(*) as count FROM api_logs
UNION ALL SELECT 'analytics_events', COUNT(*) FROM analytics_events;
"

# Compare with original counts
echo "=== Original Counts ==="
cat $BACKUP_DIR/record_counts.txt
```

### 5.2 Verify Firebase Data

```bash
# Use Firebase Console or run verification script
node scripts/verify-firebase.js
```

Create `scripts/verify-firebase.js`:

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function verifyData() {
  const usersSnapshot = await db.collection('users').get();
  console.log(`Users in Firestore: ${usersSnapshot.size}`);
  
  const sessionsSnapshot = await db.collection('user_sessions').get();
  console.log(`Sessions in Firestore: ${sessionsSnapshot.size}`);
  
  // Sample a few records
  const sampleUser = await db.collection('users').limit(1).get();
  sampleUser.forEach(doc => {
    console.log('Sample user:', doc.id, doc.data());
  });
}

verifyData().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
```

### 5.3 Test Service Connectivity

```bash
# Start all services
docker-compose up -d

# Wait for services to be ready
sleep 30

# Test Product Service
curl http://localhost:8000/products | jq '.[:2]'

# Test Order Service
curl http://localhost:8080/api/orders | jq '.[:2]'

# Test User Service (requires authentication)
# Check logs for successful Firebase connection
docker logs user-service 2>&1 | grep -i firebase

# Test API Gateway
curl http://localhost:4000/health
```

### 5.4 Run Integration Tests

```bash
# Test creating an order (validates cross-service communication)
curl -X POST http://localhost:4000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TEST_TOKEN" \
  -d '{
    "items": [
      {"product_id": 1, "quantity": 2}
    ]
  }'

# Test creating a product review
curl -X POST http://localhost:4000/api/products/1/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TEST_TOKEN" \
  -d '{
    "rating": 5,
    "title": "Great product",
    "comment": "Works perfectly"
  }'

# Verify API Gateway logging
docker exec -it postgres-gateway psql -U gateway_user -d gateway_database -c "
SELECT * FROM api_logs ORDER BY created_at DESC LIMIT 5;
"
```

### 5.5 Data Integrity Checks

```bash
# Verify no orphaned order items
docker exec -it postgres-order psql -U order_user -d order_database -c "
SELECT COUNT(*) as orphaned_items
FROM order_items oi
LEFT JOIN orders o ON oi.order_id = o.id
WHERE o.id IS NULL;
"

# Verify product references in orders exist
docker exec -it postgres-order psql -U order_user -d order_database -c "
SELECT DISTINCT product_id FROM order_items ORDER BY product_id;
" > /tmp/order_product_ids.txt

docker exec -it postgres-product psql -U product_user -d product_database -c "
SELECT id FROM products ORDER BY id;
" > /tmp/product_ids.txt

# Compare the lists (manual check or script)
```

### 5.6 Performance Testing

```bash
# Test query performance on new databases
docker exec -it postgres-product psql -U product_user -d product_database -c "
EXPLAIN ANALYZE
SELECT * FROM products WHERE category_id = 1 AND status = 'active';
"

# Check index usage
docker exec -it postgres-product psql -U product_user -d product_database -c "
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
"
```

---

## Rollback Procedures

### Scenario 1: Rollback Before Services Start

If you need to rollback before starting the new services:

```bash
# Stop new database containers
docker-compose down

# Restore old database
pg_restore -h localhost -p 5432 -U postgres -d ecommerce_db \
  --clean \
  --if-exists \
  $BACKUP_DIR/full_backup.dump

# Restore old docker-compose configuration
cp $BACKUP_DIR/docker-compose-before.yml docker-compose.yml

# Start services with old configuration
docker-compose up -d
```

### Scenario 2: Rollback After Services Start

If issues are discovered after services are running:

```bash
# Stop all services
docker-compose down

# Remove new database volumes
docker volume rm \
  postgres-product-data \
  postgres-order-data \
  postgres-gateway-data

# Restore old database
pg_restore -h localhost -p 5432 -U postgres -d ecommerce_db \
  --clean \
  --if-exists \
  $BACKUP_DIR/full_backup.dump

# Restore old configuration
cp $BACKUP_DIR/docker-compose-before.yml docker-compose.yml

# Update service configurations to use old database
# Revert changes in:
# - product-service/app/config/database.py
# - order-service/src/main/resources/application.properties
# - user-service/src/config/* (revert to PostgreSQL)
# - api-gateway/src/config/database.js

# Start services
docker-compose up -d
```

### Scenario 3: Partial Rollback (Keep Some Services)

If only one service has issues:

```bash
# Example: Rollback User Service to PostgreSQL
# 1. Stop user-service
docker-compose stop user-service

# 2. Restore users and user_sessions to old database
psql -h localhost -p 5432 -U postgres -d ecommerce_db -c "
-- Restore from backup
"

# 3. Update user-service configuration to use PostgreSQL
# 4. Restart user-service
docker-compose up -d user-service
```

---

## Post-Migration Tasks

### 1. Update Documentation

- [ ] Update README.md with new database architecture
- [ ] Update API documentation with new endpoints
- [ ] Update deployment guides
- [ ] Document new environment variables

### 2. Monitoring Setup

```bash
# Set up database monitoring
# - Connection pool metrics
# - Query performance
# - Disk usage alerts
# - Replication lag (if applicable)
```

### 3. Backup Strategy

```bash
# Set up automated backups for each database
# Product Database
0 2 * * * pg_dump -h postgres-product -U product_user product_database > /backups/product_$(date +\%Y\%m\%d).sql

# Order Database
0 2 * * * pg_dump -h postgres-order -U order_user order_database > /backups/order_$(date +\%Y\%m\%d).sql

# Gateway Database
0 2 * * * pg_dump -h postgres-gateway -U gateway_user gateway_database > /backups/gateway_$(date +\%Y\%m\%d).sql

# Firebase/Firestore - Use Firebase Console or gcloud CLI
```

### 4. Security Hardening

```bash
# Change default passwords in production
# Update docker-compose.yml with secure passwords
# Use Docker secrets or environment variable files

# Restrict database access
# - Remove exposed ports in production
# - Use internal Docker networks only
# - Enable SSL/TLS for database connections

# Set up database user permissions
docker exec -it postgres-product psql -U postgres -d product_database -c "
REVOKE ALL ON DATABASE product_database FROM PUBLIC;
GRANT CONNECT ON DATABASE product_database TO product_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO product_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO product_user;
"
```

### 5. Clean Up Old Database

**WARNING: Only do this after confirming the migration is successful and stable for at least 1 week**

```bash
# Archive old database
pg_dump -h localhost -p 5432 -U postgres -d ecommerce_db \
  --format=custom \
  --file=/archives/ecommerce_db_final_$(date +%Y%m%d).dump

# Drop old database (CAREFUL!)
# psql -h localhost -p 5432 -U postgres -c "DROP DATABASE ecommerce_db;"

# Remove old postgres container from docker-compose.yml
# Remove postgres-data volume
```

---

## Troubleshooting

### Issue: CSV Import Fails with Encoding Errors

```bash
# Check file encoding
file -i $BACKUP_DIR/users.csv

# Convert to UTF-8 if needed
iconv -f ISO-8859-1 -t UTF-8 $BACKUP_DIR/users.csv > $BACKUP_DIR/users_utf8.csv
```

### Issue: Sequence Values Not Updated

```bash
# Manually reset sequences
docker exec -it postgres-product psql -U product_user -d product_database -c "
SELECT 'SELECT SETVAL(' ||
       quote_literal(quote_ident(sequence_namespace.nspname) || '.' || quote_ident(class_sequence.relname)) ||
       ', COALESCE(MAX(' ||quote_ident(pg_attribute.attname)|| '), 1) ) FROM ' ||
       quote_ident(table_namespace.nspname)|| '.'||quote_ident(class_table.relname)|| ';'
FROM pg_depend
INNER JOIN pg_class AS class_sequence ON class_sequence.oid = pg_depend.objid
INNER JOIN pg_class AS class_table ON class_table.oid = pg_depend.refobjid
INNER JOIN pg_attribute ON pg_attribute.attrelid = class_table.oid AND pg_attribute.attnum = pg_depend.refobjsubid
INNER JOIN pg_namespace AS table_namespace ON table_namespace.oid = class_table.relnamespace
INNER JOIN pg_namespace AS sequence_namespace ON sequence_namespace.oid = class_sequence.relnamespace
WHERE class_sequence.relkind = 'S';
"
```

### Issue: Firebase Import Fails

```bash
# Check Firebase quotas
# Firestore has limits on writes per second

# Reduce batch size in import script
# Add delays between batches

# Check service account permissions
# Ensure service account has Firestore write permissions
```

### Issue: Services Can't Connect to Databases

```bash
# Check database health
docker-compose ps

# Check database logs
docker logs postgres-product
docker logs postgres-order
docker logs postgres-gateway

# Test connection manually
docker exec -it postgres-product psql -U product_user -d product_database -c "SELECT 1;"

# Check network connectivity
docker network ls
docker network inspect <network_name>
```

### Issue: Data Mismatch After Migration

```bash
# Run comprehensive data audit
# Compare record counts
# Check for NULL values in critical fields
# Verify foreign key references (application level)

# Sample data comparison script
docker exec -it postgres-product psql -U product_user -d product_database -c "
SELECT id, name, price FROM products ORDER BY id LIMIT 10;
"

# Compare with original
psql -h localhost -p 5432 -U postgres -d ecommerce_db -c "
SELECT id, name, price FROM products ORDER BY id LIMIT 10;
"
```

---

## Migration Checklist

### Pre-Migration
- [ ] Full database backup completed
- [ ] Backup integrity verified
- [ ] Record counts documented
- [ ] Firebase project created and configured
- [ ] Service account credentials obtained
- [ ] All stakeholders notified
- [ ] Maintenance window scheduled

### During Migration
- [ ] Services stopped or in maintenance mode
- [ ] Data exported from monolithic database
- [ ] User data imported to Firebase/Firestore
- [ ] Product data imported to product_database
- [ ] Order data imported to order_database
- [ ] Gateway data imported to gateway_database
- [ ] Sequences reset correctly

### Post-Migration
- [ ] Record counts verified
- [ ] Data integrity checks passed
- [ ] Service connectivity tested
- [ ] Integration tests passed
- [ ] Performance tests completed
- [ ] Monitoring configured
- [ ] Backup strategy implemented
- [ ] Documentation updated
- [ ] Team trained on new architecture

### One Week After Migration
- [ ] No critical issues reported
- [ ] Performance metrics acceptable
- [ ] Old database archived
- [ ] Old infrastructure decommissioned (optional)

---

## Support and Resources

- **Database Documentation**: See `database/README.md`
- **Architecture Overview**: See `ARCHITECTURE.md`
- **Design Document**: See `.kiro/specs/database-architecture-redesign/design.md`
- **Requirements**: See `.kiro/specs/database-architecture-redesign/requirements.md`

For issues or questions, contact the platform team or create an issue in the project repository.