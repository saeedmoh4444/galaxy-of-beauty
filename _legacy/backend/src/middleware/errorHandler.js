import { ZodError } from 'zod';
import { AppError } from '../utils/errors.js';
import logger from '../config/logger.js';
import env from '../config/env.js';

/**
 * Map error codes to bilingual (Arabic/English) user-facing messages.
 */
const ARABIC_ERROR_MESSAGES = {
  INTERNAL_ERROR: 'حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.',
  VALIDATION_ERROR: 'البيانات المدخلة غير صالحة. يرجى التحقق منها.',
  DATABASE_ERROR: 'حدث خطأ في قاعدة البيانات.',
  ALREADY_EXISTS: 'هذا السجل موجود مسبقاً.',
  NOT_FOUND: 'السجل غير موجود.',
  PAYLOAD_TOO_LARGE: 'حجم الملف كبير جداً.',
  INVALID_CREDENTIALS: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
  UNAUTHORIZED: 'يرجى تسجيل الدخول أولاً.',
  FORBIDDEN: 'ليس لديك صلاحية للوصول.',
  TOKEN_EXPIRED: 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مجدداً.',
  TOKEN_INVALID: 'رمز التحقق غير صالح.',
  ACCOUNT_SUSPENDED: 'تم تعليق الحساب. يرجى التواصل مع الدعم.',
  ACCOUNT_LOCKED: 'تم قفل الحساب مؤقتاً بسبب محاولات متعددة. يرجى المحاولة لاحقاً.',
  BOOKING_NOT_FOUND: 'الحجز غير موجود.',
  BOOKING_INVALID_STATE: 'لا يمكن تنفيذ هذا الإجراء على الحجز في حالته الحالية.',
  SLOT_NOT_AVAILABLE: 'الموعد غير متاح. يرجى اختيار موعد آخر.',
  PAYMENT_FAILED: 'فشلت عملية الدفع. يرجى المحاولة مرة أخرى.',
  INSUFFICIENT_FUNDS: 'الرصيد غير كافٍ.',
  WALLET_NOT_FOUND: 'المحفظة غير موجودة.',
  BELOW_MINIMUM_BALANCE: 'الرصيد أقل من الحد الأدنى المطلوب.',
  RATE_LIMIT_EXCEEDED: 'طلبات كثيرة جداً. يرجى المحاولة لاحقاً.',
  SERVICE_UNAVAILABLE: 'الخدمة غير متاحة حالياً. يرجى المحاولة لاحقاً.',
  IDEMPOTENCY_KEY_REUSED: 'تم معالجة هذا الطلب مسبقاً.',
  CSRF_INVALID: 'فشل التحقق من الأمان. يرجى تحديث الصفحة.',
  MAINTENANCE_MODE: 'المنصة في وضع الصيانة حالياً. يرجى المحاولة لاحقاً.',
};

/**
 * Central error handler middleware.
 * Formats all errors consistently: { error: { code, message, messageAr, details, requestId } }
 * Logs errors via Winston and strips stack traces in production.
 */
export function errorHandler(err, req, res, _next) {
  const requestId = req.requestId || 'unknown';
  const lang = req.headers['accept-language']?.startsWith('en') ? 'en' : 'ar';

  // Determine status and error code
  let statusCode = 500;
  let errorCode = 'INTERNAL_ERROR';
  let message = 'An unexpected error occurred';
  let details = {};

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorCode = err.errorCode;
    message = err.message;
    details = err.details;
  } else if (err instanceof ZodError) {
    statusCode = 422;
    errorCode = 'VALIDATION_ERROR';
    message = 'Validation failed';
    details = {
      fields: err.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
        code: e.code,
      })),
    };
  } else if (err.name === 'PrismaClientKnownRequestError') {
    statusCode = 400;
    errorCode = 'DATABASE_ERROR';
    message = 'Database operation failed';
    if (err.code === 'P2002') {
      errorCode = 'ALREADY_EXISTS';
      message = 'A record with this value already exists';
      details = { fields: err.meta?.target };
    } else if (err.code === 'P2025') {
      statusCode = 404;
      errorCode = 'NOT_FOUND';
      message = 'Record not found';
    }
    logger.error('Prisma error', { code: err.code, meta: err.meta, requestId });
  } else if (err.type === 'entity.too.large') {
    statusCode = 413;
    errorCode = 'PAYLOAD_TOO_LARGE';
    message = 'Request body too large';
  }

  // Log the error
  const logLevel = statusCode >= 500 ? 'error' : 'warn';
  logger[logLevel](message, {
    requestId,
    statusCode,
    errorCode,
    stack: err.stack,
    details,
  });

  // Build bilingual response
  const messageAr = ARABIC_ERROR_MESSAGES[errorCode] || 'حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.';

  const response = {
    error: {
      code: errorCode,
      message: lang === 'ar' ? messageAr : message,
      ...(lang === 'ar' && message !== messageAr && { messageEn: message }),
      requestId,
    },
  };

  if (Object.keys(details).length > 0) {
    response.error.details = details;
  }

  // Include stack in development
  if (env.NODE_ENV === 'development' && statusCode >= 500) {
    response.error.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

export default errorHandler;
