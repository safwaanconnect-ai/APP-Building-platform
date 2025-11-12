import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    subscriptionTier: string;
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    const token = authHeader.substring(7);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        subscriptionTier: true,
        emailVerified: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }

    if (!user.emailVerified) {
      return res.status(401).json({
        success: false,
        error: 'Email not verified'
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      subscriptionTier: user.subscriptionTier
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        error: 'Token expired'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Authentication error'
    });
  }
};

export const requireSubscription = (requiredTier: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user!;

    const tiers = {
      'free': 0,
      'pro': 1,
      'enterprise': 2
    };

    const userTierLevel = tiers[user.subscriptionTier as keyof typeof tiers] || 0;
    const requiredTierLevel = tiers[requiredTier as keyof typeof tiers] || 0;

    if (userTierLevel < requiredTierLevel) {
      return res.status(403).json({
        success: false,
        error: `This feature requires a ${requiredTier} subscription or higher`
      });
    }

    next();
  };
};

export { AuthRequest };