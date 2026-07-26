/**
 * Token Encryption Utility
 *
 * Encrypts sensitive tokens (e.g., Google Calendar refresh tokens)
 * before storing in the database. Uses AES-256-GCM with a key derived
 * from the JWT_ACCESS_SECRET (already 32+ chars).
 *
 * Usage:
 *   const encrypted = encrypt(googleRefreshToken);
 *   const decrypted = decrypt(encrypted);
 */

import crypto from 'crypto';
import env from '../config/env.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const KEY = Buffer.from(env.JWT_ACCESS_SECRET.slice(0, 32), 'utf-8');

/**
 * Encrypt a plaintext string.
 * Returns: iv + ciphertext + authTag as hex
 *
 * @param {string} text - Plaintext to encrypt
 * @returns {string} Hex-encoded encrypted payload
 */
export function encrypt(text) {
  if (!text) return null;

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

  let encrypted = cipher.update(text, 'utf-8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return iv.toString('hex') + ':' + encrypted + ':' + authTag;
}

/**
 * Decrypt a hex-encoded encrypted payload.
 *
 * @param {string} encryptedText - Hex payload from encrypt()
 * @returns {string} Decrypted plaintext
 */
export function decrypt(encryptedText) {
  if (!encryptedText) return null;

  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) return null;

    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const authTag = Buffer.from(parts[2], 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
  } catch {
    return null; // Decryption failed (wrong key, tampered data)
  }
}

export default { encrypt, decrypt };
