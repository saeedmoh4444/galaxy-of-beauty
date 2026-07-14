import { Router } from 'express';
import { authLimiter, loginLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';
import { isAuth } from '../middleware/auth.js';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
} from '../validators/auth.js';
import * as authService from '../services/auth.js';
import { AppError } from '../utils/errors.js';
import * as twoFactorService from '../services/twoFactor.js';
import {
  checkIdempotency,
  completeIdempotency,
  releaseIdempotency,
} from '../utils/idempotency.js';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (customer or technician)
 * @access  Public
 */
router.post(
  '/register',
  authLimiter,
  validate({ body: registerSchema }),
  async (req, res, next) => {
    try {
      const idemKey = req.body.idempotencyKey;
      if (idemKey) {
        await checkIdempotency(idemKey);
      }

      const result = await authService.register({
        ...req.body,
        ipAddress: req.ip,
      });

      const response = {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      };

      if (idemKey) {
        await completeIdempotency(idemKey, response);
      }

      res.status(201).json(response);
    } catch (error) {
      if (req.body.idempotencyKey) {
        await releaseIdempotency(req.body.idempotencyKey);
      }
      next(error);
    }
  },
);

/**
 * @route   POST /api/auth/login
 * @desc    Login with email and password
 * @access  Public
 */
router.post(
  '/login',
  loginLimiter,
  validate({ body: loginSchema }),
  async (req, res, next) => {
    try {
      const result = await authService.login(req.body.email, req.body.password);

      res.json({
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token (token rotation)
 * @access  Public
 */
router.post(
  '/refresh',
  validate({ body: refreshTokenSchema }),
  async (req, res, next) => {
    try {
      const tokens = await authService.refreshAccessToken(req.body.refreshToken);
      res.json(tokens);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout - revoke refresh token
 * @access  Authenticated
 */
router.post('/logout', isAuth, async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change password (current password required)
 * @access  Authenticated
 */
router.put(
  '/change-password',
  isAuth,
  validate({ body: changePasswordSchema }),
  async (req, res, next) => {
    try {
      await authService.changePassword(
        req.user.userId,
        req.body.currentPassword,
        req.body.newPassword,
      );
      res.json({ message: 'Password changed. Please login again.' });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify email with token
 * @access  Public
 */
router.post('/verify-email', async (req, res, next) => {
  try {
    const result = await authService.verifyEmail(req.body.token);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend email verification token
 * @access  Authenticated
 */
router.post('/resend-verification', isAuth, async (req, res, next) => {
  try {
    const result = await authService.resendVerificationEmail(req.user.userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset email
 * @access  Public
 */
router.post(
  '/forgot-password',
  authLimiter,
  async (req, res, next) => {
    try {
      const result = await authService.forgotPassword(req.body.email);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using token from email
 * @access  Public
 */
router.post(
  '/reset-password',
  authLimiter,
  async (req, res, next) => {
    try {
      const result = await authService.resetPassword(req.body.token, req.body.newPassword);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @route   POST /api/auth/2fa/setup
 * @desc    Set up 2FA — returns secret + QR URL
 * @access  Authenticated
 */
router.post('/2fa/setup', isAuth, async (req, res, next) => {
  try {

    const result = await twoFactorService.setup2FA(req.user.userId);
    res.json(result);
  } catch (error) { next(error); }
});

/**
 * @route   POST /api/auth/2fa/verify
 * @desc    Verify first TOTP token and enable 2FA
 * @access  Authenticated
 */
router.post('/2fa/verify', isAuth, async (req, res, next) => {
  try {

    const result = await twoFactorService.verifyAndEnable2FA(req.user.userId, req.body.token);
    res.json(result);
  } catch (error) { next(error); }
});

/**
 * @route   POST /api/auth/2fa/disable
 * @desc    Disable 2FA (requires current valid token)
 * @access  Authenticated
 */
router.post('/2fa/disable', isAuth, async (req, res, next) => {
  try {

    const result = await twoFactorService.disable2FA(req.user.userId, req.body.token);
    res.json(result);
  } catch (error) { next(error); }
});

export default router;
