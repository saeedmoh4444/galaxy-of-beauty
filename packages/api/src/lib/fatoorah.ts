import crypto from 'crypto';

// ── MyFatoorah v2 gateway client ────────────────────────────
// Shipping-aware payment gateway replacing PayFort. Endpoints:
//   GetCountries, Getcities, CalculateShippingCharge, SendPayment
//   (hosted invoice link), ExecutePayment, DirectPayment,
//   GetPaymentStatus (money-integrity status verification).
// Auth: Bearer token. Fail-closed: without a token every call throws
// FatoorahNotConfiguredError unless FATOORAH_SIMULATE=true outside
// production, which serves deterministic dev stubs.

// ── Configuration ──────────────────────────────────────────

export interface FatoorahConfig {
  apiToken: string;
  baseUrl: string;
}

export class FatoorahNotConfiguredError extends Error {
  constructor() {
    super('MyFatoorah gateway not configured (missing FATOORAH_API_TOKEN)');
    this.name = 'FatoorahNotConfiguredError';
  }
}

export class FatoorahApiError extends Error {
  constructor(message: string, opts?: { cause?: unknown }) {
    super(message, opts);
    this.name = 'FatoorahApiError';
  }
}

export function getFatoorahConfig(): FatoorahConfig | null {
  const apiToken = process.env['FATOORAH_API_TOKEN'];
  if (!apiToken) return null;

  const baseUrl =
    process.env['FATOORAH_BASE_URL'] ||
    (process.env['NODE_ENV'] === 'production'
      ? 'https://api.myfatoorah.com'
      : 'https://apitest.myfatoorah.com');

  return { apiToken, baseUrl };
}

export function isFatoorahConfigured(): boolean {
  return getFatoorahConfig() !== null;
}

function simulateActive(): boolean {
  return process.env['FATOORAH_SIMULATE'] === 'true' && process.env['NODE_ENV'] !== 'production';
}

export interface FatoorahCallOptions {
  fetchFn?: typeof fetch;
  config?: FatoorahConfig;
}

function resolveConfig(opts?: FatoorahCallOptions): { config: FatoorahConfig; simulate: boolean } {
  const config = opts?.config ?? getFatoorahConfig();
  if (config) return { config, simulate: false };
  if (simulateActive()) return { config: { apiToken: 'DEV', baseUrl: 'dev' }, simulate: true };
  throw new FatoorahNotConfiguredError();
}

// ── Shared API call + error mapping ─────────────────────────

async function callApi(
  method: 'GET' | 'POST',
  path: string,
  opts?: FatoorahCallOptions & {
    query?: Record<string, string | number | undefined>;
    body?: unknown;
  },
): Promise<Record<string, unknown>> {
  const { config } = resolveConfig(opts);
  const fetchFn = opts?.fetchFn ?? fetch;

  const qs = Object.entries(opts?.query ?? {})
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join('&');
  const url = `${config.baseUrl}${path}${qs ? `?${qs}` : ''}`;

  let response: Response;
  try {
    response = await fetchFn(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiToken}`,
      },
      ...(opts?.body !== undefined ? { body: JSON.stringify(opts.body) } : {}),
    });
  } catch (err) {
    throw new FatoorahApiError(`MyFatoorah request failed: ${path}`, { cause: err });
  }

  if (!response.ok) {
    throw new FatoorahApiError(`MyFatoorah HTTP ${response.status} for ${path}`);
  }

  const data = (await response.json()) as Record<string, unknown>;

  // Mirrors the official sample's handle_response: IsSuccess true →
  // success; otherwise map ValidationErrors / ErrorMessage / Message /
  // Data.ErrorMessage into the thrown error.
  if (data['IsSuccess'] === true) return data;

  const validationErrors = data['ValidationErrors'];
  if (Array.isArray(validationErrors) && validationErrors.length > 0) {
    const joined = validationErrors
      .map((v) => {
        const e = v as { Name?: unknown; Error?: unknown };
        return `${String(e.Name ?? '')}: ${String(e.Error ?? '')}`;
      })
      .join('; ');
    throw new FatoorahApiError(joined);
  }

  const dataError = data['Data'] as Record<string, unknown> | undefined;
  const fallback =
    (data['ErrorMessage'] as string | undefined) ??
    (data['Message'] as string | undefined) ??
    (dataError?.['ErrorMessage'] as string | undefined) ??
    `An error has occurred. API response: ${JSON.stringify(data).slice(0, 300)}`;
  throw new FatoorahApiError(fallback);
}

// ── Endpoints ───────────────────────────────────────────────

export type ShippingMethod = 1 | 2; // 1 = DHL, 2 = Aramex

export interface FatoorahCountry {
  countryId: number;
  countryCode: string;
  englishName: string;
  arabicName: string;
}

export interface FatoorahShipItem {
  name: string;
  quantity: number;
  weight: number;
  unitPrice: number;
}

export interface FatoorahInvoiceItem {
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface FatoorahShippingConsignee {
  personName: string;
  mobile: string;
  lineAddress: string;
  cityName: string;
  postalCode: string;
  countryCode: string;
}

export interface FatoorahPaymentStatus {
  invoiceId: string;
  invoiceStatus: string;
  transactionStatus?: string;
  error?: string;
  invoiceValue?: number;
}

export async function getCountries(opts?: FatoorahCallOptions): Promise<FatoorahCountry[]> {
  if (resolveConfig(opts).simulate) {
    return [
      { countryId: 1, countryCode: 'SA', englishName: 'Saudi Arabia', arabicName: 'السعودية' },
    ];
  }
  const data = await callApi('GET', '/v2/GetCountries', opts);
  const list = (data['Data'] as Record<string, unknown>[]) ?? [];
  return list.map((c) => ({
    countryId: Number(c['CountryId'] ?? 0),
    countryCode: String(c['CountryCode'] ?? ''),
    englishName: String(c['EnglishName'] ?? c['CountryName'] ?? ''),
    arabicName: String(c['ArabicName'] ?? ''),
  }));
}

export async function getCities(
  params: { shippingMethod: ShippingMethod; countryCode: string; searchValue?: string },
  opts?: FatoorahCallOptions,
): Promise<string[]> {
  if (resolveConfig(opts).simulate) {
    return ['RIYADH'];
  }
  const data = await callApi('GET', '/v2/Getcities', {
    ...opts,
    query: {
      shippingMethod: params.shippingMethod,
      countryCode: params.countryCode,
      searchValue: params.searchValue,
    },
  });
  const cityNames = (data['Data'] as Record<string, unknown>)?.['CityNames'];
  return Array.isArray(cityNames) ? cityNames.map((c) => String(c)) : [];
}

export async function calculateShippingCharge(
  params: {
    shippingMethod: ShippingMethod;
    countryCode: string;
    cityName: string;
    postalCode: string;
    items: FatoorahShipItem[];
  },
  opts?: FatoorahCallOptions,
): Promise<{ shippingCharge: number }> {
  if (resolveConfig(opts).simulate) {
    return { shippingCharge: 25 };
  }
  const data = await callApi('POST', '/v2/CalculateShippingCharge', {
    ...opts,
    body: {
      ShippingMethod: params.shippingMethod,
      CountryCode: params.countryCode,
      CityName: params.cityName,
      PostalCode: params.postalCode,
      Items: params.items.map((i) => ({
        ProductName: i.name,
        Quantity: i.quantity,
        Weight: i.weight,
        UnitPrice: i.unitPrice,
      })),
    },
  });
  return {
    shippingCharge: Number((data['Data'] as Record<string, unknown>)?.['ShippingCharge'] ?? 0),
  };
}

interface PaymentBaseParams {
  customerName: string;
  customerMobile: string;
  customerEmail: string;
  invoiceValue: number;
  invoiceItems: FatoorahInvoiceItem[];
  shippingMethod?: ShippingMethod;
  shippingConsignee?: FatoorahShippingConsignee;
  callBackUrl?: string;
  errorUrl?: string;
  customerReference: string;
}

function invoiceBody(params: PaymentBaseParams): Record<string, unknown> {
  return {
    CustomerName: params.customerName,
    CustomerMobile: params.customerMobile,
    CustomerEmail: params.customerEmail,
    InvoiceValue: params.invoiceValue,
    DisplayCurrencyIso: 'SAR',
    MobileCountryCode: '+966',
    InvoiceItems: params.invoiceItems.map((i) => ({
      ItemName: i.name,
      Quantity: i.quantity,
      UnitPrice: i.unitPrice,
    })),
    CustomerReference: params.customerReference,
    CallBackUrl: params.callBackUrl,
    ErrorUrl: params.errorUrl,
    Language: 'ar',
    ...(params.shippingMethod !== undefined ? { ShippingMethod: params.shippingMethod } : {}),
    ...(params.shippingConsignee
      ? {
          ShippingConsignee: {
            PersonName: params.shippingConsignee.personName,
            Mobile: params.shippingConsignee.mobile,
            LineAddress: params.shippingConsignee.lineAddress,
            CityName: params.shippingConsignee.cityName,
            PostalCode: params.shippingConsignee.postalCode,
            CountryCode: params.shippingConsignee.countryCode,
          },
        }
      : {}),
  };
}

function devInvoiceId(): string {
  return `DEV-${crypto.randomUUID().slice(0, 20)}`;
}

/**
 * SendPayment — hosted invoice link (NotificationOption LNK). The
 * customer pays on MyFatoorah's page and is redirected to callBackUrl.
 */
export async function sendPayment(
  params: PaymentBaseParams & { displayCurrencyIso: 'SAR' },
  opts?: FatoorahCallOptions,
): Promise<{ invoiceId: string; invoiceURL: string }> {
  if (resolveConfig(opts).simulate) {
    return { invoiceId: devInvoiceId(), invoiceURL: 'https://apitest.myfatoorah.com/dev' };
  }
  const data = await callApi('POST', '/v2/SendPayment', {
    ...opts,
    body: { ...invoiceBody(params), NotificationOption: 'LNK' },
  });
  const payload = data['Data'] as Record<string, unknown>;
  return {
    invoiceId: String(payload?.['InvoiceId'] ?? ''),
    invoiceURL: String(payload?.['InvoiceURL'] ?? ''),
  };
}

/**
 * ExecutePayment — hosted gateway card page for a specific payment
 * method (PaymentMethodId). Lib-only: UI uses the invoice-link flow.
 */
export async function executePayment(
  params: PaymentBaseParams & { paymentMethodId: number },
  opts?: FatoorahCallOptions,
): Promise<{ invoiceId: string; paymentId: string }> {
  if (resolveConfig(opts).simulate) {
    return { invoiceId: devInvoiceId(), paymentId: `DEV-PAY-${crypto.randomUUID().slice(0, 12)}` };
  }
  const data = await callApi('POST', '/v2/ExecutePayment', {
    ...opts,
    body: { PaymentMethodId: params.paymentMethodId, ...invoiceBody(params) },
  });
  const payload = data['Data'] as Record<string, unknown>;
  return {
    invoiceId: String(payload?.['InvoiceId'] ?? ''),
    paymentId: String(payload?.['PaymentId'] ?? ''),
  };
}

export interface FatoorahCard {
  number: string;
  expiryMonth: string;
  expiryYear: string;
  securityCode: string;
  cardHolderName: string;
}

/**
 * DirectPayment — raw card charge (PCI scope). Lib-only: UI uses the
 * hosted invoice-link flow, which keeps card data off our servers.
 */
export async function directPayment(
  params: PaymentBaseParams & {
    paymentType: 'card';
    card: FatoorahCard;
    saveToken?: boolean;
  },
  opts?: FatoorahCallOptions,
): Promise<{ invoiceId: string; paymentId: string }> {
  if (resolveConfig(opts).simulate) {
    return { invoiceId: devInvoiceId(), paymentId: `DEV-PAY-${crypto.randomUUID().slice(0, 12)}` };
  }
  const data = await callApi('POST', '/v2/DirectPayment', {
    ...opts,
    body: {
      PaymentType: params.paymentType,
      Card: {
        Number: params.card.number,
        expiryMonth: params.card.expiryMonth,
        expiryYear: params.card.expiryYear,
        SecurityCode: params.card.securityCode,
        CardHolderName: params.card.cardHolderName,
      },
      SaveToken: params.saveToken ?? false,
      ...invoiceBody(params),
    },
  });
  const payload = data['Data'] as Record<string, unknown>;
  return {
    invoiceId: String(payload?.['InvoiceId'] ?? ''),
    paymentId: String(payload?.['PaymentId'] ?? ''),
  };
}

/**
 * GetPaymentStatus — server-side verification of an invoice/payment.
 * Money-integrity: never trust the redirect alone; always re-check here.
 */
export async function getPaymentStatus(
  params: { paymentId?: string; invoiceId?: string },
  opts?: FatoorahCallOptions,
): Promise<FatoorahPaymentStatus> {
  if (resolveConfig(opts).simulate) {
    return {
      invoiceId: params.invoiceId ?? params.paymentId ?? '',
      invoiceStatus: 'Paid',
    };
  }
  if (!params.paymentId && !params.invoiceId) {
    throw new FatoorahApiError('getPaymentStatus requires paymentId or invoiceId');
  }
  const data = await callApi('POST', '/v2/GetPaymentStatus', {
    ...opts,
    body: {
      KeyType: params.paymentId ? 'PaymentId' : 'InvoiceId',
      Key: params.paymentId ?? params.invoiceId,
    },
  });
  const payload = data['Data'] as Record<string, unknown>;
  const transactions = Array.isArray(payload?.['InvoiceTransactions'])
    ? (payload['InvoiceTransactions'] as Record<string, unknown>[])
    : [];
  const firstTxn = transactions[0];
  return {
    invoiceId: String(payload?.['InvoiceId'] ?? ''),
    invoiceStatus: String(payload?.['InvoiceStatus'] ?? ''),
    transactionStatus: firstTxn ? String(firstTxn['TransactionStatus'] ?? '') : undefined,
    error: payload?.['Error']
      ? String((payload['Error'] as Record<string, unknown>)['Error'] ?? '')
      : undefined,
    invoiceValue:
      payload?.['InvoiceValue'] !== undefined ? Number(payload['InvoiceValue']) : undefined,
  };
}

/**
 * Fail-closed payment-state normalization. Only explicit Paid/Succss
 * spellings map to PAID; unknown values stay PENDING — never trust a
 * redirect without gateway confirmation.
 */
export function resolvePaymentState(s: FatoorahPaymentStatus): 'PAID' | 'FAILED' | 'PENDING' {
  const invoice = s.invoiceStatus.trim();
  const txn = (s.transactionStatus ?? '').trim();
  if (invoice === 'Paid' || txn === 'Succss') return 'PAID';
  if (invoice === 'Canceled' || txn === 'Failed') return 'FAILED';
  return 'PENDING';
}
