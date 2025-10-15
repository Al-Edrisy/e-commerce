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
 * All order endpoints require authentication
 */
router.use(
  '/orders',
  apiLimiter,
  verifyToken,
  createProxyMiddleware({
    target: serviceUrls.orderService,
    pathRewrite: { '^/api/orders': '/api/orders' },
    changeOrigin: true,
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
  })
);

export default router;

