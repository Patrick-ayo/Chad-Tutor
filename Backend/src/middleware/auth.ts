import { Request, Response, NextFunction } from 'express';
import { clerkClient, getAuth } from '@clerk/express';

// Extend Express Request to include auth info
declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        sessionId: string;
      };
      clerkUser?: {
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
      };
    }
  }
}

/**
 * Middleware to require authentication
 * Extracts Clerk auth info and attaches to request
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const auth = getAuth(req);
    
    if (!auth.userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }
    
    req.auth = {
      userId: auth.userId,
      sessionId: auth.sessionId || '',
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid authentication token',
    });
  }
}

/**
 * Middleware to optionally attach user info if authenticated
 * Doesn't fail if not authenticated
 */
export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const auth = getAuth(req);
    
    if (auth.userId) {
      req.auth = {
        userId: auth.userId,
        sessionId: auth.sessionId || '',
      };
    }
    
    next();
  } catch (error) {
    // Continue without auth
    next();
  }
}

/**
 * Middleware to require admin role
 * Must be used after requireAuth
 */
export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.auth?.userId) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required',
    });
  }
  
  // In production, check role from your database
  // For now, we'll check a simple list or Clerk metadata
  // This is a placeholder - implement your role check logic
  
  // Example: Check from database
  // const user = await User.findOne({ clerkId: req.auth.userId });
  // if (!user?.roles.includes('admin')) { ... }
  
  next();
}
