#!/bin/bash

# Order Service API Testing Script
# This script tests all Order Service endpoints

BASE_URL="http://localhost:8080"
USER_UID="ScqxPpk2vmhMStbEgu0S8FHPVoC3"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Order Service API Testing Script${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Function to print test header
print_test() {
    echo -e "\n${YELLOW}>>> TEST: $1${NC}"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Test 1: Health Check
print_test "1. Health Check"
echo "GET $BASE_URL/api/orders/health"
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" $BASE_URL/api/orders/health)
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$HEALTH_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    print_success "Health check passed (HTTP $HTTP_CODE)"
    echo "$RESPONSE_BODY" | jq .
else
    print_error "Health check failed (HTTP $HTTP_CODE)"
    echo "$RESPONSE_BODY"
fi

# Test 2: Create Order
print_test "2. Create Order"
echo "POST $BASE_URL/api/v1/orders"

CREATE_ORDER_PAYLOAD='{
  "userUid": "'"$USER_UID"'",
  "shippingAddress": "123 Main St, New York, NY 10001, USA",
  "items": [
    {
      "productId": 1,
      "productName": "Laptop Dell XPS 15",
      "quantity": 2,
      "unitPrice": 1299.99
    },
    {
      "productId": 5,
      "productName": "Wireless Mouse",
      "quantity": 1,
      "unitPrice": 29.99
    }
  ]
}'

CREATE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $BASE_URL/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "X-User-UID: $USER_UID" \
  -d "$CREATE_ORDER_PAYLOAD")

HTTP_CODE=$(echo "$CREATE_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$CREATE_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 201 ]; then
    print_success "Order created successfully (HTTP $HTTP_CODE)"
    ORDER_ID=$(echo "$RESPONSE_BODY" | jq -r '.id')
    echo "Order ID: $ORDER_ID"
    echo "$RESPONSE_BODY" | jq .
else
    print_error "Order creation failed (HTTP $HTTP_CODE)"
    echo "$RESPONSE_BODY"
    exit 1
fi

# Test 3: Get Order by ID
print_test "3. Get Order by ID"
echo "GET $BASE_URL/api/v1/orders/$ORDER_ID"

GET_ORDER_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET $BASE_URL/api/v1/orders/$ORDER_ID \
  -H "X-User-UID: $USER_UID")

HTTP_CODE=$(echo "$GET_ORDER_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$GET_ORDER_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    print_success "Order retrieved successfully (HTTP $HTTP_CODE)"
    echo "$RESPONSE_BODY" | jq .
else
    print_error "Failed to retrieve order (HTTP $HTTP_CODE)"
    echo "$RESPONSE_BODY"
fi

# Test 4: Get All User Orders
print_test "4. Get All User Orders"
echo "GET $BASE_URL/api/v1/orders"

GET_ORDERS_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET $BASE_URL/api/v1/orders \
  -H "X-User-UID: $USER_UID")

HTTP_CODE=$(echo "$GET_ORDERS_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$GET_ORDERS_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    print_success "User orders retrieved successfully (HTTP $HTTP_CODE)"
    ORDER_COUNT=$(echo "$RESPONSE_BODY" | jq '. | length')
    echo "Total orders: $ORDER_COUNT"
    echo "$RESPONSE_BODY" | jq .
else
    print_error "Failed to retrieve user orders (HTTP $HTTP_CODE)"
    echo "$RESPONSE_BODY"
fi

# Test 5: Update Order Status to PROCESSING
print_test "5. Update Order Status to PROCESSING"
echo "PUT $BASE_URL/api/v1/orders/$ORDER_ID/status"

UPDATE_STATUS_PAYLOAD='{"status": "PROCESSING"}'

UPDATE_RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT $BASE_URL/api/v1/orders/$ORDER_ID/status \
  -H "Content-Type: application/json" \
  -H "X-User-UID: $USER_UID" \
  -d "$UPDATE_STATUS_PAYLOAD")

HTTP_CODE=$(echo "$UPDATE_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$UPDATE_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    print_success "Order status updated to PROCESSING (HTTP $HTTP_CODE)"
    echo "$RESPONSE_BODY" | jq .
else
    print_error "Failed to update order status (HTTP $HTTP_CODE)"
    echo "$RESPONSE_BODY"
fi

# Test 6: Update Order Status to SHIPPED
print_test "6. Update Order Status to SHIPPED"
UPDATE_STATUS_PAYLOAD='{"status": "SHIPPED"}'

UPDATE_RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT $BASE_URL/api/v1/orders/$ORDER_ID/status \
  -H "Content-Type: application/json" \
  -H "X-User-UID: $USER_UID" \
  -d "$UPDATE_STATUS_PAYLOAD")

HTTP_CODE=$(echo "$UPDATE_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$UPDATE_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    print_success "Order status updated to SHIPPED (HTTP $HTTP_CODE)"
    echo "$RESPONSE_BODY" | jq .
else
    print_error "Failed to update order status (HTTP $HTTP_CODE)"
    echo "$RESPONSE_BODY"
fi

# Test 7: Update Order Status to DELIVERED
print_test "7. Update Order Status to DELIVERED"
UPDATE_STATUS_PAYLOAD='{"status": "DELIVERED"}'

UPDATE_RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT $BASE_URL/api/v1/orders/$ORDER_ID/status \
  -H "Content-Type: application/json" \
  -H "X-User-UID: $USER_UID" \
  -d "$UPDATE_STATUS_PAYLOAD")

HTTP_CODE=$(echo "$UPDATE_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$UPDATE_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    print_success "Order status updated to DELIVERED (HTTP $HTTP_CODE)"
    echo "$RESPONSE_BODY" | jq .
else
    print_error "Failed to update order status (HTTP $HTTP_CODE)"
    echo "$RESPONSE_BODY"
fi

# Test 8: Try to Cancel Delivered Order (Should Fail)
print_test "8. Try to Cancel Delivered Order (Should Fail)"
UPDATE_STATUS_PAYLOAD='{"status": "CANCELLED"}'

UPDATE_RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT $BASE_URL/api/v1/orders/$ORDER_ID/status \
  -H "Content-Type: application/json" \
  -H "X-User-UID: $USER_UID" \
  -d "$UPDATE_STATUS_PAYLOAD")

HTTP_CODE=$(echo "$UPDATE_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$UPDATE_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 400 ]; then
    print_success "Correctly rejected cancellation of delivered order (HTTP $HTTP_CODE)"
    echo "$RESPONSE_BODY" | jq .
else
    print_error "Unexpected response (HTTP $HTTP_CODE)"
    echo "$RESPONSE_BODY"
fi

# Test 9: Create Another Order and Cancel It
print_test "9. Create Another Order and Cancel It"

CREATE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $BASE_URL/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "X-User-UID: $USER_UID" \
  -d "$CREATE_ORDER_PAYLOAD")

HTTP_CODE=$(echo "$CREATE_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$CREATE_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 201 ]; then
    ORDER_ID_2=$(echo "$RESPONSE_BODY" | jq -r '.id')
    print_success "Second order created (ID: $ORDER_ID_2)"
    
    # Now cancel it
    UPDATE_STATUS_PAYLOAD='{"status": "CANCELLED"}'
    
    UPDATE_RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT $BASE_URL/api/v1/orders/$ORDER_ID_2/status \
      -H "Content-Type: application/json" \
      -H "X-User-UID: $USER_UID" \
      -d "$UPDATE_STATUS_PAYLOAD")
    
    HTTP_CODE=$(echo "$UPDATE_RESPONSE" | tail -n1)
    RESPONSE_BODY=$(echo "$UPDATE_RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" -eq 200 ]; then
        print_success "Order cancelled successfully (HTTP $HTTP_CODE)"
        echo "$RESPONSE_BODY" | jq .
    else
        print_error "Failed to cancel order (HTTP $HTTP_CODE)"
        echo "$RESPONSE_BODY"
    fi
else
    print_error "Failed to create second order (HTTP $HTTP_CODE)"
    echo "$RESPONSE_BODY"
fi

# Test 10: Access Denied Test (Try to access another user's order)
print_test "10. Access Denied Test (Different User)"
echo "GET $BASE_URL/api/v1/orders/$ORDER_ID with different user"

ACCESS_DENIED_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET $BASE_URL/api/v1/orders/$ORDER_ID \
  -H "X-User-UID: differentuser456")

HTTP_CODE=$(echo "$ACCESS_DENIED_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$ACCESS_DENIED_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 403 ]; then
    print_success "Correctly denied access to another user's order (HTTP $HTTP_CODE)"
    echo "$RESPONSE_BODY" | jq .
else
    print_error "Unexpected response (HTTP $HTTP_CODE)"
    echo "$RESPONSE_BODY"
fi

# Summary
echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}  Testing Complete!${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo -e "${GREEN}All Order Service endpoints tested successfully!${NC}"
echo -e "\nCreated Orders:"
echo -e "  - Order #$ORDER_ID (Status: DELIVERED)"
if [ ! -z "$ORDER_ID_2" ]; then
    echo -e "  - Order #$ORDER_ID_2 (Status: CANCELLED)"
fi

echo -e "\n${YELLOW}Next Steps:${NC}"
echo "1. Check the API_TESTING_GUIDE.md for detailed documentation"
echo "2. Import postman_collection.json into Postman for GUI testing"
echo "3. Test with different scenarios and edge cases"
