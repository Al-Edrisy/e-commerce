import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logApiRequestAsync } from '../services/loggingService';

// Extend Express Request type to include custom properties
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      startTime?: number;
      user?: {
        uid: string;
        email?: string;
        [key: string]: any;
      };
    }
  }
}

/**
 * Custom logging middleware with database integration
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  // Capture request start time
  req.startTime = Date.now();

  // Extract or generate request ID
  req.requestId = (req.headers['x-request-id'] as string) || uuidv4();

  // Add request ID to response headers for tracing
  res.setHeader('X-Request-ID', req.requestId);

  // Listen for response finish event
  res.on('finish', () => {
    const duration = Date.now() - (req.startTime || Date.now());
    
    // Extract user UID from authentication token if present
    const userUid = req.user?.uid || null;

    // Extract IP address (handle proxy scenarios)
    const ipAddress = 
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      null;

    // Extract user agent
    const userAgent = req.headers['user-agent'] || null;

    // Determine service name from the path
    let serviceName = 'unknown';
    if (req.originalUrl.includes('/users')) {
      serviceName = 'user-service';
    } else if (req.originalUrl.includes('/products') || req.originalUrl.includes('/categories')) {
      serviceName = 'product-service';
    } else if (req.originalUrl.includes('/orders') || req.originalUrl.includes('/payments')) {
      serviceName = 'order-service';
    } else if (req.originalUrl === '/' || req.originalUrl === '/health') {
      serviceName = 'api-gateway';
    }

    // Console log for immediate visibility
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms - RequestID: ${req.requestId}`
    );

    // Log to database asynchronously (fire and forget)
    logApiRequestAsync({
      service_name: serviceName,
      path: req.originalUrl,
      method: req.method,
      status_code: res.statusCode,
      latency_ms: duration,
      user_uid: userUid,
      ip_address: ipAddress,
      user_agent: userAgent,
      request_id: req.requestId,
    });
  });

  next();
};

