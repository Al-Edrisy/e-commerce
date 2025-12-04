import { Request, Response, NextFunction } from 'express';
import admin, { isFirebaseReady } from '../config/firebase';

export interface AuthRequest extends Request {
  user?: any;
}

/**
 * Middleware to verify Firebase authentication token
 */
export const verifyToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Check if Firebase is initialized
    if (!isFirebaseReady()) {
      console.error('⚠️  Firebase not initialized - cannot verify token');
      res.status(503).json({
        error: 'Authentication service unavailable',
        message: 'Firebase is not properly configured'
      });
      return;
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'No token provided',
        message: 'Authorization header with Bearer token is required'
      });
      return;
    }

    const token = authHeader.split('Bearer ')[1];

    if (!token || token.trim() === '') {
      res.status(401).json({
        error: 'Invalid token format',
        message: 'Token cannot be empty'
      });
      return;
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;

    // Extract user_uid from decoded token and add as header for downstream services
    if (decodedToken.uid) {
      req.headers['x-user-uid'] = decodedToken.uid;

      // Also add email if available for logging purposes
      if (decodedToken.email) {
        req.headers['x-user-email'] = decodedToken.email;
      }
    }

    next();
  } catch (error) {
    console.error('❌ Error verifying token:', error instanceof Error ? error.message : error);

    // Provide specific error messages
    if (error instanceof Error) {
      if (error.message.includes('expired')) {
        res.status(401).json({
          error: 'Token expired',
          message: 'Your session has expired. Please log in again.'
        });
        return;
      }
      if (error.message.includes('invalid')) {
        res.status(401).json({
          error: 'Invalid token',
          message: 'The provided token is invalid.'
        });
        return;
      }
    }

    res.status(401).json({
      error: 'Authentication failed',
      message: 'Could not verify authentication token'
    });
  }
};

/**
 * Optional authentication - proceeds even if no token is provided
 */
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // If Firebase is not initialized, skip auth but allow request to proceed
    if (!isFirebaseReady()) {
      console.warn('⚠️  Firebase not initialized - optional auth skipped');
      next();
      return;
    }

    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split('Bearer ')[1];

      if (token && token.trim() !== '') {
        try {
          const decodedToken = await admin.auth().verifyIdToken(token);
          req.user = decodedToken;

          // Add user context headers if available
          if (decodedToken.uid) {
            req.headers['x-user-uid'] = decodedToken.uid;
            if (decodedToken.email) {
              req.headers['x-user-email'] = decodedToken.email;
            }
          }
        } catch (tokenError) {
          // In optional auth, we just log the error and continue
          console.warn('⚠️  Optional auth token verification failed:', tokenError instanceof Error ? tokenError.message : tokenError);
        }
      }
    }
    next();
  } catch (error) {
    // In optional auth, errors should not block the request
    console.error('❌ Error in optional auth:', error instanceof Error ? error.message : error);
    next();
  }
};

