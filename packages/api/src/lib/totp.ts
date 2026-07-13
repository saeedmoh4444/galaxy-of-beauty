import crypto from 'crypto';

// ── Configuration ──────────────────────────────────────────
const TOTP_STEP = 30; // 30-second time window
const TOTP_WINDOW = 1; // Allow ±1 step drift
const TOTP_DIGITS = 6;

// ── TOTP Implementation ───────────────────────────────────

/**
 * Generate a cryptographically random TOTP secret.
 * Returns the secret as a base32-like hex string suitable for authenticator apps,
 * and the otpauth:// URI for QR code generation.
 */
export function generateTotpSecret(email: string): { secret: string; otpauthUrl: string } {
  // 20 bytes = 160 bits, standard for TOTP
  const secretBytes = crypto.randomBytes(20);
  const secret = secretBytes.toString('base64');
  const otpauthUrl = `otpauth://totp/GalaxyOfBeauty:${encodeURIComponent(email)}?secret=${secret}&issuer=GalaxyOfBeauty&algorithm=SHA1&digits=${TOTP_DIGITS}&period=${TOTP_STEP}`;
  return { secret, otpauthUrl };
}

/**
 * Generate a TOTP token for a given secret and time counter.
 */
function generateToken(secret: string, counter: number): string {
  // Convert counter to 8-byte big-endian buffer
  const counterBuf = Buffer.alloc(8);
  counterBuf.writeBigInt64BE(BigInt(counter), 0);

  // HMAC-SHA1
  const hmac = crypto.createHmac('sha1', Buffer.from(secret, 'base64'));
  hmac.update(counterBuf);
  const digest = hmac.digest();

  // Dynamic truncation (RFC 4226, section 5.4)
  const lastByte = digest[digest.length - 1];
  if (lastByte === undefined) return '000000';

  const offset = lastByte & 0x0f;
  const b0 = digest[offset];
  const b1 = digest[offset + 1];
  const b2 = digest[offset + 2];
  const b3 = digest[offset + 3];

  if (b0 === undefined || b1 === undefined || b2 === undefined || b3 === undefined) {
    return '000000';
  }

  const binary =
    ((b0 & 0x7f) << 24) |
    ((b1 & 0xff) << 16) |
    ((b2 & 0xff) << 8) |
    (b3 & 0xff);

  // Mod 10^DIGITS
  const token = binary % 10 ** TOTP_DIGITS;
  return token.toString().padStart(TOTP_DIGITS, '0');
}

/**
 * Verify a 6-digit TOTP token against a stored secret.
 * Returns true if the token is valid within the allowed time window.
 */
export function verifyTotpToken(token: string, secret: string): boolean {
  try {
    // Validate input format
    if (!/^\d{6}$/.test(token)) return false;

    const now = Math.floor(Date.now() / 1000);
    const counter = Math.floor(now / TOTP_STEP);

    // Check tokens within the allowed window (current step ± drift)
    for (let offset = -TOTP_WINDOW; offset <= TOTP_WINDOW; offset++) {
      const expectedToken = generateToken(secret, counter + offset);
      if (crypto.timingSafeEqual(
        Buffer.from(token),
        Buffer.from(expectedToken),
      )) {
        return true;
      }
    }

    return false;
  } catch {
    // Invalid secret format or other error
    return false;
  }
}
