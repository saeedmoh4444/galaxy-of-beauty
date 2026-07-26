import * as platformService from '../services/platform.js';

/**
 * Middleware: block requests if maintenance mode is enabled.
 * Admin routes still work during maintenance.
 */
export async function maintenanceMiddleware(req, res, next) {
  try {
    // Allow health check and admin routes
    if (req.path === '/health' || req.path.startsWith('/admin') || req.path === '/') {
      return next();
    }

    const isMaintenance = await platformService.isMaintenanceMode();
    if (isMaintenance) {
      return res.status(503).json({
        error: {
          code: 'MAINTENANCE_MODE',
          message: 'المنصة في وضع الصيانة حالياً. يرجى المحاولة لاحقاً.',
          messageEn: 'The platform is currently under maintenance. Please try again later.',
        },
      });
    }
    next();
  } catch {
    next(); // Fail open if Redis/DB is down
  }
}

export default maintenanceMiddleware;
