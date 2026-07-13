import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// ── Types ──────────────────────────────────────────────────

export interface UploadResult {
  url: string;
  key: string;
  bucket?: string;
}

// ── S3 (lazy-loaded via dynamic import to avoid requiring AWS SDK at install) ─

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _s3Client: any = undefined;

async function getS3Client() {
  if (_s3Client !== undefined) return _s3Client;

  const bucket = process.env['AWS_S3_BUCKET'];
  const accessKey = process.env['AWS_ACCESS_KEY_ID'];
  const secretKey = process.env['AWS_SECRET_ACCESS_KEY'];
  const region = process.env['AWS_REGION'] || 'me-south-1';

  if (!bucket || !accessKey || !secretKey) {
    _s3Client = null;
    return null;
  }

  try {
    // Dynamic import — AWS SDK is an optional dependency
    const sdk = await Function('return import("@aws-sdk/client-s3")')();
    _s3Client = new sdk.S3Client({
      region,
      credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
    });
    return _s3Client;
  } catch {
    _s3Client = null;
    return null;
  }
}

function getS3Bucket(): string | null {
  return process.env['AWS_S3_BUCKET'] || null;
}

function getS3Region(): string {
  return process.env['AWS_REGION'] || 'me-south-1';
}

// ── Local Storage ──────────────────────────────────────────

const LOCAL_UPLOAD_DIR = path.join(process.cwd(), process.env['UPLOAD_DIR'] || 'uploads');

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function localUrl(key: string): string {
  return `${process.env['NEXT_PUBLIC_APP_URL'] || 'http://localhost:3000'}/uploads/${key}`;
}

// ── Public API ─────────────────────────────────────────────

export async function uploadFile(
  buffer: Buffer,
  originalName: string,
  folder: string,
  mimeType = 'application/octet-stream',
): Promise<UploadResult> {
  const ext = path.extname(originalName) || '.bin';
  const key = `${folder}/${crypto.randomUUID()}${ext}`;

  const s3 = await getS3Client();
  const bucket = getS3Bucket();

  if (!s3 || !bucket) {
    // Local fallback
    const dir = path.join(LOCAL_UPLOAD_DIR, folder);
    ensureDir(dir);
    await fs.promises.writeFile(path.join(LOCAL_UPLOAD_DIR, key), buffer);
    return { url: localUrl(key), key };
  }

  try {
    const sdk = await Function('return import("@aws-sdk/client-s3")')();
    await s3.send(new sdk.PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      CacheControl: 'public, max-age=31536000, immutable',
    }));

    return {
      url: `https://${bucket}.s3.${getS3Region()}.amazonaws.com/${key}`,
      key,
      bucket,
    };
  } catch (err) {
    // S3 failed — fall back to local
    // eslint-disable-next-line no-console
    console.error('[Storage] S3 upload failed, falling back to local:', err);
    const dir = path.join(LOCAL_UPLOAD_DIR, folder);
    ensureDir(dir);
    await fs.promises.writeFile(path.join(LOCAL_UPLOAD_DIR, key), buffer);
    return { url: localUrl(key), key };
  }
}

export async function deleteFile(key: string): Promise<void> {
  const s3 = await getS3Client();
  const bucket = getS3Bucket();

  if (!s3 || !bucket) {
    const fp = path.join(LOCAL_UPLOAD_DIR, key);
    if (fs.existsSync(fp)) await fs.promises.unlink(fp);
    return;
  }

  try {
    const sdk = await Function('return import("@aws-sdk/client-s3")')();
    await s3.send(new sdk.DeleteObjectCommand({ Bucket: bucket, Key: key }));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[Storage] S3 delete failed:', err);
    const fp = path.join(LOCAL_UPLOAD_DIR, key);
    if (fs.existsSync(fp)) await fs.promises.unlink(fp);
  }
}

export async function generatePresignedUrl(
  folder: string,
  contentType: string,
  expiresIn = 3600,
): Promise<{ url: string; key: string } | null> {
  const s3 = await getS3Client();
  const bucket = getS3Bucket();
  if (!s3 || !bucket) return null;

  try {
    const sdk = await Function('return import("@aws-sdk/client-s3")')();
    const presigner = await Function('return import("@aws-sdk/s3-request-presigner")')();
    const s3Key = `${folder}/${crypto.randomUUID()}`;
    const cmd = new sdk.PutObjectCommand({ Bucket: bucket, Key: s3Key, ContentType: contentType });
    const url = await presigner.getSignedUrl(s3, cmd, { expiresIn });
    return { url, key: s3Key };
  } catch {
    return null;
  }
}
