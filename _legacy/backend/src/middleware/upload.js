import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AppError } from '../utils/errors.js';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Ensure upload directories exist
const uploadDirs = ['uploads', 'uploads/kyc', 'uploads/avatars'];
for (const dir of uploadDirs) {
  const dirPath = path.resolve(dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Disk storage engine — saves files to the local filesystem.
 * In production, files should be uploaded to S3 via multer-s3.
 *
 * KYC documents → uploads/kyc/
 * Avatars/profiles → uploads/avatars/
 */
const diskStorage = multer.diskStorage({
  destination(_req, file, cb) {
    // Route KYC documents and other uploads to appropriate directories
    const isKyc = file.fieldname === 'documents' || file.originalname.match(/kyc|id_|passport/i);
    const dest = isKyc ? 'uploads/kyc/' : 'uploads/';
    cb(null, dest);
  },
  filename(_req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

/**
 * Multer instance configured for disk storage.
 * Upgrade path: swap to multer-s3 S3 storage for production deployments.
 */
const upload = multer({
  storage: diskStorage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 5,
  },
  fileFilter(_req, file, cb) {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError(`File type ${file.mimetype} is not allowed`, 400, 'INVALID_FILE_TYPE'), false);
    }
  },
});

export default upload;
