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

/** Minimal structural type for the lazily-imported AWS S3 client. */
interface S3ClientLike {
  send(command: unknown): Promise<unknown>;
}

let _s3Client: S3ClientLike | null | undefined = undefined;

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

/**
 * B1 — the private bucket for KYC/identity documents. National IDs and
 * medical licenses must never sit in the public avatar bucket with a
 * permanent unsigned URL; when configured they go to a private bucket
 * and are only ever served through short-lived signed GETs.
 * (Unset → falls back to the main bucket so dev keeps working; the
 * production requirement is documented in .env.example.)
 */
function getKycBucket(): string | null {
  return process.env['AWS_KYC_BUCKET'] || getS3Bucket();
}

function getS3Region(): string {
  return process.env['AWS_REGION'] || 'me-south-1';
}

// ── Local Storage ──────────────────────────────────────────

const LOCAL_UPLOAD_DIR = path.join(
  /*turbopackIgnore: true*/ process.cwd(),
  process.env['UPLOAD_DIR'] || 'uploads',
);

function ensureDir(dir: string): void {
  if (!fs.existsSync(/*turbopackIgnore: true*/ dir))
    fs.mkdirSync(/*turbopackIgnore: true*/ dir, { recursive: true });
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
  opts?: { private?: boolean },
): Promise<UploadResult> {
  const ext = path.extname(originalName) || '.bin';
  const key = `${folder}/${crypto.randomUUID()}${ext}`;

  const s3 = await getS3Client();
  const bucket = opts?.private ? getKycBucket() : getS3Bucket();

  if (!s3 || !bucket) {
    // Local fallback
    const dir = path.join(/*turbopackIgnore: true*/ LOCAL_UPLOAD_DIR, folder);
    ensureDir(dir);
    await fs.promises.writeFile(path.join(/*turbopackIgnore: true*/ LOCAL_UPLOAD_DIR, key), buffer);
    return { url: localUrl(key), key };
  }

  try {
    const sdk = await Function('return import("@aws-sdk/client-s3")')();
    await s3.send(
      new sdk.PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
        // Private objects carry no public cache headers.
        CacheControl: opts?.private ? 'private, max-age=0' : 'public, max-age=31536000, immutable',
      }),
    );

    return {
      // B1: a private object must never expose a permanent public URL —
      // the caller stores the KEY and resolves display URLs on read via
      // getSignedFileUrl (admin KYC review, technician status views).
      url: opts?.private ? key : `https://${bucket}.s3.${getS3Region()}.amazonaws.com/${key}`,
      key,
      bucket,
    };
  } catch (err) {
    // S3 failed — fall back to local
    console.error('[Storage] S3 upload failed, falling back to local:', err);
    const dir = path.join(/*turbopackIgnore: true*/ LOCAL_UPLOAD_DIR, folder);
    ensureDir(dir);
    await fs.promises.writeFile(path.join(/*turbopackIgnore: true*/ LOCAL_UPLOAD_DIR, key), buffer);
    return { url: localUrl(key), key };
  }
}

/**
 * B1 — short-lived signed GET for a private object. Accepts a stored key
 * (or a legacy full URL, which passes through untouched) and resolves it
 * against the private bucket. Local dev falls back to the local uploads
 * route.
 */
export async function getSignedFileUrl(key: string, expiresIn = 900): Promise<string | null> {
  if (key.startsWith('http://') || key.startsWith('https://')) return key;

  const s3 = await getS3Client();
  const bucket = getKycBucket();

  if (!s3 || !bucket) {
    return localUrl(key);
  }

  try {
    const sdk = await Function('return import("@aws-sdk/client-s3")')();
    const presigner = await Function('return import("@aws-sdk/s3-request-presigner")')();
    const cmd = new sdk.GetObjectCommand({ Bucket: bucket, Key: key });
    return await presigner.getSignedUrl(s3, cmd, { expiresIn });
  } catch {
    return null;
  }
}

export async function deleteFile(key: string): Promise<void> {
  const s3 = await getS3Client();
  const bucket = getS3Bucket();

  if (!s3 || !bucket) {
    const fp = path.join(/*turbopackIgnore: true*/ LOCAL_UPLOAD_DIR, key);
    if (fs.existsSync(/*turbopackIgnore: true*/ fp))
      await fs.promises.unlink(/*turbopackIgnore: true*/ fp);
    return;
  }

  try {
    const sdk = await Function('return import("@aws-sdk/client-s3")')();
    await s3.send(new sdk.DeleteObjectCommand({ Bucket: bucket, Key: key }));
  } catch (err) {
    console.error('[Storage] S3 delete failed:', err);
    const fp = path.join(/*turbopackIgnore: true*/ LOCAL_UPLOAD_DIR, key);
    if (fs.existsSync(/*turbopackIgnore: true*/ fp))
      await fs.promises.unlink(/*turbopackIgnore: true*/ fp);
  }
}

/**
 * R2 — object size probe (presigned signatures can't bound size; the
 * post-upload finalize step HEADs the object to enforce the real cap).
 * Returns the size in bytes, or null when the object doesn't exist.
 */
export async function headFile(key: string): Promise<number | null> {
  const s3 = await getS3Client();
  const bucket = getS3Bucket();

  if (!s3 || !bucket) {
    const fp = path.join(/*turbopackIgnore: true*/ LOCAL_UPLOAD_DIR, key);
    try {
      const st = await fs.promises.stat(/*turbopackIgnore: true*/ fp);
      return st.size;
    } catch {
      return null;
    }
  }

  try {
    const sdk = await Function('return import("@aws-sdk/client-s3")')();
    const res = (await s3.send(new sdk.HeadObjectCommand({ Bucket: bucket, Key: key }))) as {
      ContentLength?: number;
    };
    return res.ContentLength ?? null;
  } catch {
    return null;
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
