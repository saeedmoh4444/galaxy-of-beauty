/**
 * Storage factory for file uploads.
 *
 * Provides the appropriate multer storage engine based on environment:
 *   - Production: S3 (multer-s3)  — if AWS credentials are configured
 *   - Development/fallback: Local disk storage
 *
 * Usage:
 *   import { getUploadMiddleware } from '../middleware/storageFactory.js';
 *   router.post('/upload', getUploadMiddleware('kyc'), handler);
 */
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AppError } from '../utils/errors.js';
import env from '../config/env.js';
import logger from '../config/logger.js';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 5;

// Ensure local upload directories exist
['uploads', 'uploads/kyc', 'uploads/avatars'].forEach((dir) => {
  const dirPath = path.resolve(dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

/**
 * Get local disk storage engine for the given category.
 */
function getDiskStorage(category = 'general') {
  return multer.diskStorage({
    destination(_req, _file, cb) {
      const dest = category === 'kyc' ? 'uploads/kyc/' : 'uploads/';
      cb(null, dest);
    },
    filename(_req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname) || '.bin';
      cb(null, `${category}-${uniqueSuffix}${ext}`);
    },
  });
}

/**
 * Get S3 storage engine (if AWS is configured).
 * Falls back to disk storage if S3 is not available.
 */
async function getS3Storage(category = 'general') {
  if (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY || !env.AWS_S3_BUCKET) {
    logger.debug('S3 not configured — falling back to disk storage');
    return getDiskStorage(category);
  }

  try {
    const { S3Client } = await import('@aws-sdk/client-s3');
    const multerS3 = (await import('multer-s3')).default;

    const s3 = new S3Client({
      region: env.AWS_REGION || 'me-south-1',
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
    });

    return multerS3({
      s3,
      bucket: env.AWS_S3_BUCKET,
      metadata(_req, file, cb) {
        cb(null, { fieldName: file.fieldname });
      },
      key(_req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname) || '.bin';
        cb(null, `${category}/${uniqueSuffix}${ext}`);
      },
      contentType: multerS3.AUTO_CONTENT_TYPE,
    });
  } catch (error) {
    logger.warn('Failed to initialize S3 storage, using disk', { error: error.message });
    return getDiskStorage(category);
  }
}

/**
 * Create a multer upload middleware for the specified category.
 *
 * @param {'kyc'|'avatar'|'general'} category - Upload category
 * @returns {import('multer').Multer} Configured multer instance
 */
export async function createUploader(category = 'general') {
  const storage = env.NODE_ENV === 'production'
    ? await getS3Storage(category)
    : getDiskStorage(category);

  return multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE, files: MAX_FILES },
    fileFilter(_req, file, cb) {
      if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new AppError(`File type ${file.mimetype} is not allowed`, 400, 'INVALID_FILE_TYPE'), false);
      }
    },
  });
}

/**
 * Get a pre-configured upload middleware (synchronous, disk-only for simplicity).
 * Use this in route handlers for consistent upload handling.
 *
 * @param {'kyc'|'avatar'|'general'} category
 * @returns {import('multer').Multer}
 */
export function getUploadMiddleware(category = 'general') {
  const storage = env.NODE_ENV === 'production' && env.AWS_S3_BUCKET
    ? getDiskStorage(category) // S3 init is async — use createUploader for S3
    : getDiskStorage(category);

  // If S3 is configured and we're in production, log a notice
  if (env.NODE_ENV === 'production' && env.AWS_S3_BUCKET) {
    logger.info('S3 configured — use createUploader() for async S3 initialization');
  }

  return multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE, files: MAX_FILES },
    fileFilter(_req, file, cb) {
      if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new AppError(`File type ${file.mimetype} is not allowed`, 400, 'INVALID_FILE_TYPE'), false);
      }
    },
  });
}

export default { createUploader, getUploadMiddleware };
