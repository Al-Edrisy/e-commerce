# Frontend

React-based user interface for the E-Commerce platform with Firebase authentication.

## Technology Stack

- **Framework**: React 18
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Authentication**: Firebase SDK
- **State Management**: Context API
- **Port**: 3000

## Prerequisites

- Node.js 18+
- Firebase project with Authentication enabled

## Environment Variables

```env
REACT_APP_API_GATEWAY_URL=http://localhost:4000
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef
```

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment:
   ```bash
   cp env.template .env
   # Edit .env with your Firebase configuration
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Application will be available at `http://localhost:3000`

## Available Pages/Routes

- `/` - Home page with product listings
- `/products` - Product catalog and search
- `/login` - User login
- `/register` - User registration
- `/orders` - User order history
- `/cart` - Shopping cart (to be implemented)

## Features

- **User Authentication**: Login/register with Firebase
- **Product Browsing**: View products and categories
- **Search Functionality**: Product search with filters
- **Shopping Cart**: Add/remove items (to be implemented)
- **Order Management**: View order history
- **Responsive Design**: Mobile-friendly interface

## Development Status

**TODO Implementation Required:**
- Shopping cart functionality
- Checkout process
- Order placement
- User profile management
- Product filtering and search
- Payment integration

## Features to Implement

- Shopping cart with add/remove functionality
- Checkout process with order creation
- Product search and filtering
- User profile management
- Order tracking and history
- Payment integration with Stripe
- Responsive design improvements
- Error handling and loading states
