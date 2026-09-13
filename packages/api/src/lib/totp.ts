import crypto from 'crypto';

// ── Configuration ──────────────────────────────────────────
const TOTP_STEP = 30; // 30-second time window
const TOTP_WINDOW = 1; // Allow ±1 step drift
const TOTP_DIGITS = 6;

// ── Base32 (RFC 4648, unpadded uppercase) ──────────────────
// Authenticator apps (Google Authenticator, Authy, 1Password) expect
// the otpauth secret to be base32 — a base64 secret produces QR codes
// that never verify.

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
/** otpauth issuer label — invariant brand name shown in authenticator apps. */
const TOTP_ISSUER = 'GalaxyOfBeauty';

function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = '';
  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  return output;
}

function base32Decode(input: string): Buffer {
  const clean = input.toUpperCase().replace(/=+$/, '').replace(/\s+/g, '');
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (const char of clean) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index === -1) throw new Error(`Invalid base32 character: ${char}`);
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

// ── TOTP Implementation ───────────────────────────────────

/**
 * Generate a cryptographically random TOTP secret as base32, suitable
 * for authenticator apps, plus the otpauth:// URI for QR codes.
 */
export function generateTotpSecret(email: string): { secret: string; otpauthUrl: string } {
  // 20 bytes = 160 bits, standard for TOTP
  const secretBytes = crypto.randomBytes(20);
  const secret = base32Encode(secretBytes);
  const otpauthUrl = `otpauth://totp/${TOTP_ISSUER}:${encodeURIComponent(email)}?secret=${secret}&issuer=${TOTP_ISSUER}&algorithm=SHA1&digits=${TOTP_DIGITS}&period=${TOTP_STEP}`;
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
  const hmac = crypto.createHmac('sha1', base32Decode(secret));
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

  const binary = ((b0 & 0x7f) << 24) | ((b1 & 0xff) << 16) | ((b2 & 0xff) << 8) | (b3 & 0xff);

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
      if (crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expectedToken))) {
        return true;
      }
    }

    return false;
  } catch {
    // Invalid secret format or other error
    return false;
  }
}
