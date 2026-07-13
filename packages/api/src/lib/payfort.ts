import crypto from 'crypto';

// ── Configuration ──────────────────────────────────────────

interface PayFortConfig {
  merchantId: string;
  accessCode: string;
  shaRequestPhrase: string;
  shaResponsePhrase: string;
  sandbox: boolean;
}

function getConfig(): PayFortConfig | null {
  const merchantId = process.env['PAYFORT_MERCHANT_ID'];
  const accessCode = process.env['PAYFORT_ACCESS_KEY'];
  const shaRequest = process.env['PAYFORT_SHA_REQUEST_PHRASE'];
  const shaResponse = process.env['PAYFORT_SHA_RESPONSE_PHRASE'];
  const sandbox = process.env['PAYFORT_SANDBOX'] !== 'false';

  if (!merchantId || !accessCode || !shaRequest || !shaResponse) {
    // PayFort not configured
    return null;
  }

  return {
    merchantId,
    accessCode,
    shaRequestPhrase: shaRequest,
    shaResponsePhrase: shaResponse,
    sandbox,
  };
}

function getBaseUrl(sandbox: boolean): string {
  return sandbox
    ? 'https://sbcheckout.payfort.com/FortAPI/paymentPage'
    : 'https://checkout.payfort.com/FortAPI/paymentPage';
}

// ── Signature Generation ───────────────────────────────────

/**
 * Generate a PayFort signature.
 *
 * 1. Concatenate all params (sorted alphabetically by key) with format:
 *    KEY=VALUE (skip signature field itself)
 * 2. Append the SHA phrase at the end
 * 3. SHA-256 hash the result
 */
export function generateRequestSignature(
  params: Record<string, string>,
  phrase: string,
): string {
  const sorted = Object.keys(params)
    .filter((k) => k !== 'signature' && params[k] !== undefined && params[k] !== '')
    .sort();

  const concat = sorted.map((k) => `${k}=${params[k]}`).join('');
  const toHash = phrase ? `${concat}${phrase}` : concat;

  return crypto.createHash('sha256').update(toHash).digest('hex');
}

/**
 * Verify a webhook/response signature from PayFort.
 */
export function verifyResponseSignature(
  params: Record<string, string>,
  phrase: string,
  receivedSignature: string,
): boolean {
  const calculated = generateRequestSignature(params, phrase);
  return crypto.timingSafeEqual(
    Buffer.from(calculated),
    Buffer.from(receivedSignature),
  );
}

// ── Authorization ──────────────────────────────────────────

interface AuthorizationResult {
  success: boolean;
  paymentUrl: string | null;
  gatewayRef: string | null;
  fortId: string | null;
  message: string;
}

/**
 * Send an AUTHORIZATION request to PayFort/APS.
 *
 * Returns a redirect URL for the customer to complete 3D Secure
 * or indicates success if no 3DS is required.
 */
export async function authorizePayment(params: {
  amount: number; // in SAR (e.g., 150.00 = 15000 in minor units)
  currency?: string;
  customerEmail: string;
  customerName: string;
  merchantReference: string; // our internal booking ID
  returnUrl: string;
}): Promise<AuthorizationResult> {
  const config = getConfig();

  if (!config) {
    // PayFort not configured — return stub (development mode)
    return {
      success: true,
      paymentUrl: null,
      gatewayRef: `DEV-${crypto.randomUUID().slice(0, 20)}`,
      fortId: null,
      message: 'Payment gateway not configured. Using development stub.',
    };
  }

  const amountInMinor = Math.round(params.amount * 100); // Convert SAR to halalas

  const requestParams: Record<string, string> = {
    command: 'AUTHORIZATION',
    access_code: config.accessCode,
    merchant_identifier: config.merchantId,
    merchant_reference: params.merchantReference,
    amount: String(amountInMinor),
    currency: params.currency || 'SAR',
    language: 'ar',
    customer_email: params.customerEmail,
    customer_name: params.customerName,
    return_url: params.returnUrl,
  };

  const signature = generateRequestSignature(requestParams, config.shaRequestPhrase);
  requestParams['signature'] = signature;

  try {
    const response = await fetch(getBaseUrl(config.sandbox), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestParams),
    });

    const data = (await response.json()) as Record<string, string>;

    const responseCode = data['response_code'] || data['status'];
    const isSuccess = responseCode === '20064'; // 20064 = 3DS redirect needed (success path)

    return {
      success: isSuccess || responseCode === '20000',
      paymentUrl: data['3ds_url'] || null,
      gatewayRef: data['fort_id'] || null,
      fortId: data['fort_id'] || null,
      message: data['response_message'] || 'Unknown response',
    };
  } catch (err) {
    return {
      success: false,
      paymentUrl: null,
      gatewayRef: null,
      fortId: null,
      message: `Payment gateway request failed: ${(err as Error).message}`,
    };
  }
}

/**
 * Verify a PayFort webhook notification signature.
 */
export function verifyWebhookSignature(
  params: Record<string, string>,
  receivedSignature: string,
): boolean {
  const config = getConfig();
  if (!config) return false;
  return verifyResponseSignature(params, config.shaResponsePhrase, receivedSignature);
}

/**
 * Check whether the PayFort payment gateway is configured.
 */
export function isPayFortConfigured(): boolean {
  return getConfig() !== null;
}
