import { Request, Response, NextFunction } from 'express';
import { clerkClient, getAuth } from '@clerk/express';
import config from '../config';
import * as userService from '../services/user.service';
import type { UserProfile } from '../services/user.service';

const hasClerkConfig = Boolean(config.clerk.secretKey && config.clerk.publishableKey);

// Extend Express Request to include auth info
declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        sessionId: string;
      };
      user?: UserProfile;
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
    // Local dev fallback when Clerk keys are intentionally not configured.
    if (!hasClerkConfig && config.isDevelopment) {
      req.auth = {
        userId: 'dev-local-user',
        sessionId: 'dev-local-session',
      };
      return next();
    }

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

async function resolveClerkEmail(clerkId: string): Promise<string> {
  if (!hasClerkConfig && config.isDevelopment) {
    return 'dev-local-user@local.dev';
  }

  try {
    const user = await clerkClient.users.getUser(clerkId);
    const primaryEmail = user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId);
    const fallbackEmail = user.emailAddresses[0]?.emailAddress;
    return primaryEmail?.emailAddress || fallbackEmail || `${clerkId}@clerk.local`;
  } catch {
    return `${clerkId}@clerk.local`;
  }
}

/**
 * Middleware to require authentication and resolve DB user mapping.
 */
export async function requireUser(req: Request, res: Response, next: NextFunction) {
  try {
    if (!hasClerkConfig && config.isDevelopment) {
      req.auth = {
        userId: 'dev-local-user',
        sessionId: 'dev-local-session',
      };

      req.user = await userService.getOrCreateUser(
        req.auth.userId,
        'dev-local-user@local.dev',
        'Development User',
      );
      return next();
    }

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

    const email = await resolveClerkEmail(auth.userId);
    req.user = await userService.getOrCreateUser(auth.userId, email);
    return next();
  } catch (error) {
    console.error('Require user middleware error:', error);
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
    if (!hasClerkConfig && config.isDevelopment) {
      req.auth = {
        userId: 'dev-local-user',
        sessionId: 'dev-local-session',
      };
      return next();
    }

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
 * Middleware to optionally attach DB user if authenticated.
 * Does not fail for anonymous requests.
 */
export async function optionalUser(req: Request, res: Response, next: NextFunction) {
  try {
    if (!hasClerkConfig && config.isDevelopment) {
      req.auth = {
        userId: 'dev-local-user',
        sessionId: 'dev-local-session',
      };
      req.user = await userService.getOrCreateUser(
        req.auth.userId,
        'dev-local-user@local.dev',
        'Development User',
      );
      return next();
    }

    const auth = getAuth(req);
    if (!auth.userId) {
      return next();
    }

    req.auth = {
      userId: auth.userId,
      sessionId: auth.sessionId || '',
    };

    const email = await resolveClerkEmail(auth.userId);
    req.user = await userService.getOrCreateUser(auth.userId, email);
    return next();
  } catch {
    return next();
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
