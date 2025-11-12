import express from 'express';
import { authService } from '../services/auth';
import { validate, schemas } from '../middleware/validation';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Register new user
router.post('/register', validate(schemas.userRegistration), async (req, res) => {
  try {
    const result = await authService.register(req.body);

    res.status(201).json({
      success: true,
      data: result,
      message: 'User registered successfully. Please check your email for verification.'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Login user
router.post('/login', validate(schemas.userLogin), async (req, res) => {
  try {
    const result = await authService.login(req.body);

    res.json({
      success: true,
      data: result,
      message: 'Login successful'
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: error.message
    });
  }
});

// Refresh access token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token required'
      });
    }

    const result = await authService.refreshToken(refreshToken);

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: error.message
    });
  }
});

// Verify email
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Verification token required'
      });
    }

    const result = await authService.verifyEmail(token);

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Request password reset
router.post('/request-password-reset', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email required'
      });
    }

    const result = await authService.requestPasswordReset(email);

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Token and new password required'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long'
      });
    }

    const result = await authService.resetPassword(token, newPassword);

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Get current user info
router.get('/me', authenticate, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        subscriptionTier: true,
        emailVerified: true,
        lastLogin: true,
        createdAt: true
      }
    });

    res.json({
      success: true,
      data: user
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;