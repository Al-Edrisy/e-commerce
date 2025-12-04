import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { serviceUrls } from '../config/services';
import { apiLimiter, authLimiter } from '../middleware/rateLimiter';
import { verifyToken, optionalAuth } from '../middleware/authMiddleware';

const router = Router();

/**
 * User Service Routes
 * Auth endpoints use strict rate limiting
 */
router.use(
  '/users/register',
  authLimiter,
  createProxyMiddleware({
    target: serviceUrls.userService,
    pathRewrite: { '^/api/users': '/api/auth' },
    changeOrigin: true,
  })
);

router.use(
  '/users/login',
  authLimiter,
  createProxyMiddleware({
    target: serviceUrls.userService,
    pathRewrite: { '^/api/users': '/api/auth' },
    changeOrigin: true,
  })
);

router.use(
  '/users',
  apiLimiter,
  verifyToken,
  createProxyMiddleware({
    target: serviceUrls.userService,
    pathRewrite: { '^/api/users': '/api/users' },
    changeOrigin: true,
  })
);

/**
 * Product Service Routes
 * Most product endpoints are public (optional auth)
 */
router.use(
  '/products',
  apiLimiter,
  optionalAuth,
  createProxyMiddleware({
    target: serviceUrls.productService,
    pathRewrite: { '^/api/products': '/api/products' },
    changeOrigin: true,
  })
);

router.use(
  '/categories',
  apiLimiter,
  optionalAuth,
  createProxyMiddleware({
    target: serviceUrls.productService,
    pathRewrite: { '^/api/categories': '/api/categories' },
    changeOrigin: true,
  })
);

/**
 * Order Service Routes
 */

// Public health check endpoint (no authentication required)
router.use(
  '/orders/health',
  apiLimiter,
  createProxyMiddleware({
    target: serviceUrls.orderService,
    pathRewrite: { '^/api/orders/health': '/api/v1/orders/health' },
    changeOrigin: true,
  })
);

// All other order endpoints require authentication
router.use(
  '/orders',
  apiLimiter,
  verifyToken,
  createProxyMiddleware({
    target: serviceUrls.orderService,
    pathRewrite: { '^/api/orders': '/api/v1/orders' },
    changeOrigin: true,
    onProxyReq: (proxyReq, req) => {
      // Ensure X-User-UID header is forwarded to Order Service
      const userUid = req.headers['x-user-uid'];
      if (userUid) {
        proxyReq.setHeader('X-User-UID', userUid as string);
      }
    },
  })
);

router.use(
  '/payments',
  apiLimiter,
  verifyToken,
  createProxyMiddleware({
    target: serviceUrls.orderService,
    pathRewrite: { '^/api/payments': '/api/payments' },
    changeOrigin: true,
    onProxyReq: (proxyReq, req) => {
      // Ensure X-User-UID header is forwarded to Order Service
      const userUid = req.headers['x-user-uid'];
      if (userUid) {
        proxyReq.setHeader('X-User-UID', userUid as string);
      }
    },
  })
);

export default router;

