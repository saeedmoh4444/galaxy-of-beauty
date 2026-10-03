/**
 * MyFatoorah gateway client tests — fail-closed config, dev-simulate
 * stubs, the Python-style error mapping, per-endpoint request
 * construction, and the fail-closed payment-state resolver.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getCountries,
  getCities,
  calculateShippingCharge,
  sendPayment,
  executePayment,
  directPayment,
  getPaymentStatus,
  resolvePaymentState,
  FatoorahApiError,
  FatoorahNotConfiguredError,
} from '../lib/fatoorah';

const TOKEN = 'tok_test_123';
const BASE = 'https://apitest.myfatoorah.com';

type FetchStub = ReturnType<typeof vi.fn>;

function jsonFetch(data: unknown, ok = true): FetchStub {
  return vi.fn(async () => ({
    ok,
    status: ok ? 200 : 400,
    json: async () => data,
  })) as unknown as FetchStub;
}

function okData(data: unknown): Record<string, unknown> {
  return { IsSuccess: true, Message: 'Ok', Data: data };
}

describe('fatoorah config', () => {
  afterEach(() => {
    delete process.env['FATOORAH_API_TOKEN'];
    delete process.env['FATOORAH_BASE_URL'];
    delete process.env['FATOORAH_SIMULATE'];
  });

  it('fails closed with no token and no simulate', async () => {
    await expect(getCountries()).rejects.toBeInstanceOf(FatoorahNotConfiguredError);
    await expect(getPaymentStatus({ invoiceId: 'INV-1' })).rejects.toBeInstanceOf(
      FatoorahNotConfiguredError,
    );
  });

  it('serves deterministic dev stubs when FATOORAH_SIMULATE=true outside production', async () => {
    process.env['FATOORAH_SIMULATE'] = 'true';
    const countries = await getCountries();
    expect(countries[0]?.countryCode).toBe('SA');
    const cities = await getCities({ shippingMethod: 1, countryCode: 'SA', searchValue: 'riy' });
    expect(cities).toEqual(['RIYADH']);
    const charge = await calculateShippingCharge({
      shippingMethod: 1,
      countryCode: 'SA',
      cityName: 'RIYADH',
      postalCode: '12345',
      items: [{ name: 'Serum', quantity: 1, weight: 0.5, unitPrice: 5 }],
    });
    expect(charge.shippingCharge).toBe(25);
    const invoice = await sendPayment({
      customerName: 'Dev',
      customerMobile: '0500000000',
      customerEmail: 'dev@example.com',
      invoiceValue: 100,
      invoiceItems: [{ name: 'Serum', quantity: 1, unitPrice: 100 }],
      displayCurrencyIso: 'SAR',
      customerReference: 'GOB-DEV',
      callBackUrl: 'https://example.com/cb',
      errorUrl: 'https://example.com/err',
    });
    expect(invoice.invoiceId).toMatch(/^DEV-/);
    expect(invoice.invoiceURL).toBeTruthy();
    const status = await getPaymentStatus({ invoiceId: invoice.invoiceId });
    expect(resolvePaymentState(status)).toBe('PAID');
  });
});

describe('fatoorah error mapping', () => {
  it('throws FatoorahApiError with ValidationErrors joined', async () => {
    const fetchFn = jsonFetch({
      IsSuccess: false,
      ValidationErrors: [
        { Name: 'CustomerName', Error: 'required' },
        { Name: 'InvoiceValue', Error: 'must be positive' },
      ],
    });
    await expect(
      sendPayment(
        {
          customerName: 'x',
          customerMobile: '0500000000',
          customerEmail: 'a@b.c',
          invoiceValue: 100,
          invoiceItems: [{ name: 'i', quantity: 1, unitPrice: 100 }],
          displayCurrencyIso: 'SAR',
          customerReference: 'R1',
          callBackUrl: 'https://example.com/cb',
          errorUrl: 'https://example.com/err',
        },
        { fetchFn: fetchFn as unknown as typeof fetch, config: { apiToken: TOKEN, baseUrl: BASE } },
      ),
    ).rejects.toMatchObject({
      message: expect.stringContaining('CustomerName: required'),
    });
  });

  it('falls back to Data.ErrorMessage', async () => {
    const fetchFn = jsonFetch({ IsSuccess: false, Data: { ErrorMessage: 'City not serviced' } });
    await expect(
      calculateShippingCharge(
        {
          shippingMethod: 1,
          countryCode: 'SA',
          cityName: 'NOWHERE',
          postalCode: '1',
          items: [{ name: 'i', quantity: 1, weight: 1, unitPrice: 1 }],
        },
        { fetchFn: fetchFn as unknown as typeof fetch, config: { apiToken: TOKEN, baseUrl: BASE } },
      ),
    ).rejects.toMatchObject({ message: expect.stringContaining('City not serviced') });
  });

  it('chains the cause on network failure', async () => {
    const fetchFn = vi.fn(async () => {
      throw new TypeError('fetch failed');
    }) as unknown as FetchStub;
    const promise = getCountries({
      fetchFn: fetchFn as unknown as typeof fetch,
      config: { apiToken: TOKEN, baseUrl: BASE },
    });
    await expect(promise).rejects.toBeInstanceOf(FatoorahApiError);
    await expect(promise).rejects.toMatchObject({
      cause: expect.objectContaining({ message: 'fetch failed' }),
    });
  });
});

describe('fatoorah request construction', () => {
  it('GET /v2/GetCountries with Bearer auth', async () => {
    const fetchFn = jsonFetch(
      okData([
        { CountryId: 1, CountryCode: 'SA', EnglishName: 'Saudi Arabia', ArabicName: 'السعودية' },
      ]),
    );
    const countries = await getCountries({
      fetchFn: fetchFn as unknown as typeof fetch,
      config: { apiToken: TOKEN, baseUrl: BASE },
    });
    expect(countries[0]).toEqual({
      countryId: 1,
      countryCode: 'SA',
      englishName: 'Saudi Arabia',
      arabicName: 'السعودية',
    });
    const [url, init] = fetchFn.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${BASE}/v2/GetCountries`);
    expect(init?.method).toBe('GET');
    expect((init?.headers as Record<string, string>)['Authorization']).toBe(`Bearer ${TOKEN}`);
  });

  it('GET /v2/Getcities with query string', async () => {
    const fetchFn = jsonFetch(okData({ CityNames: ['RIYADH', 'JEDDAH'] }));
    const cities = await getCities(
      { shippingMethod: 1, countryCode: 'SA', searchValue: 'riy' },
      { fetchFn: fetchFn as unknown as typeof fetch, config: { apiToken: TOKEN, baseUrl: BASE } },
    );
    expect(cities).toEqual(['RIYADH', 'JEDDAH']);
    const [url] = fetchFn.mock.calls[0] as [string];
    expect(url).toBe(`${BASE}/v2/Getcities?shippingMethod=1&countryCode=SA&searchValue=riy`);
  });

  it('POST /v2/CalculateShippingCharge with item body', async () => {
    const fetchFn = jsonFetch(okData({ ShippingCharge: 47.5 }));
    const result = await calculateShippingCharge(
      {
        shippingMethod: 1,
        countryCode: 'SA',
        cityName: 'RIYADH',
        postalCode: '12345',
        items: [{ name: 'Serum', quantity: 2, weight: 0.5, unitPrice: 5 }],
      },
      { fetchFn: fetchFn as unknown as typeof fetch, config: { apiToken: TOKEN, baseUrl: BASE } },
    );
    expect(result.shippingCharge).toBe(47.5);
    const [url, init] = fetchFn.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${BASE}/v2/CalculateShippingCharge`);
    expect(init?.method).toBe('POST');
    expect(JSON.parse(String(init?.body))).toEqual({
      ShippingMethod: 1,
      CountryCode: 'SA',
      CityName: 'RIYADH',
      PostalCode: '12345',
      Items: [{ ProductName: 'Serum', Quantity: 2, Weight: 0.5, UnitPrice: 5 }],
    });
  });

  it('POST /v2/SendPayment with shipping consignee', async () => {
    const fetchFn = jsonFetch(
      okData({ InvoiceId: 123456, InvoiceURL: 'https://pay.test/INV-123' }),
    );
    const result = await sendPayment(
      {
        customerName: 'Saeed',
        customerMobile: '0500000000',
        customerEmail: 's@example.com',
        invoiceValue: 100,
        invoiceItems: [{ name: 'Serum', quantity: 1, unitPrice: 100 }],
        displayCurrencyIso: 'SAR',
        customerReference: 'GOB-CHECKOUT-1',
        callBackUrl: 'https://example.com/cb',
        errorUrl: 'https://example.com/err',
        shippingMethod: 1,
        shippingConsignee: {
          personName: 'Saeed',
          mobile: '0500000000',
          lineAddress: 'Street 1',
          cityName: 'RIYADH',
          postalCode: '12345',
          countryCode: 'SA',
        },
      },
      { fetchFn: fetchFn as unknown as typeof fetch, config: { apiToken: TOKEN, baseUrl: BASE } },
    );
    expect(result).toEqual({ invoiceId: '123456', invoiceURL: 'https://pay.test/INV-123' });
    const [, init] = fetchFn.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
    expect(body['NotificationOption']).toBe('LNK');
    expect(body['ShippingMethod']).toBe(1);
    expect(body['ShippingConsignee']).toMatchObject({ CityName: 'RIYADH', CountryCode: 'SA' });
    expect(body['InvoiceItems']).toEqual([{ ItemName: 'Serum', Quantity: 1, UnitPrice: 100 }]);
  });

  it('POST /v2/ExecutePayment with PaymentMethodId', async () => {
    const fetchFn = jsonFetch(okData({ InvoiceId: 10, PaymentId: 'p-10' }));
    const result = await executePayment(
      {
        paymentMethodId: 2,
        customerName: 'Saeed',
        customerMobile: '0500000000',
        customerEmail: 's@example.com',
        invoiceValue: 50,
        invoiceItems: [{ name: 'Serum', quantity: 1, unitPrice: 50 }],
        customerReference: 'R2',
      },
      { fetchFn: fetchFn as unknown as typeof fetch, config: { apiToken: TOKEN, baseUrl: BASE } },
    );
    expect(result).toEqual({ invoiceId: '10', paymentId: 'p-10' });
    const [url, init] = fetchFn.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${BASE}/v2/ExecutePayment`);
    const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
    expect(body['PaymentMethodId']).toBe(2);
  });

  it('POST /v2/DirectPayment with card object and SaveToken', async () => {
    const fetchFn = jsonFetch(okData({ InvoiceId: 11, PaymentId: 'p-11' }));
    const result = await directPayment(
      {
        paymentType: 'card',
        card: {
          number: '4111111111111111',
          expiryMonth: '12',
          expiryYear: '30',
          securityCode: '123',
          cardHolderName: 'Saeed',
        },
        saveToken: true,
        customerName: 'Saeed',
        customerMobile: '0500000000',
        customerEmail: 's@example.com',
        invoiceValue: 50,
        invoiceItems: [{ name: 'Serum', quantity: 1, unitPrice: 50 }],
        customerReference: 'R3',
      },
      { fetchFn: fetchFn as unknown as typeof fetch, config: { apiToken: TOKEN, baseUrl: BASE } },
    );
    expect(result).toEqual({ invoiceId: '11', paymentId: 'p-11' });
    const [url, init] = fetchFn.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${BASE}/v2/DirectPayment`);
    const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
    expect(body['PaymentType']).toBe('card');
    expect(body['Card']).toMatchObject({ Number: '4111111111111111', SecurityCode: '123' });
    expect(body['SaveToken']).toBe(true);
  });

  it('POST /v2/GetPaymentStatus with KeyType selection', async () => {
    const fetchFn = jsonFetch(okData({ InvoiceId: 99, InvoiceStatus: 'Paid', InvoiceValue: 50 }));
    const status = await getPaymentStatus(
      { paymentId: 'p-99' },
      { fetchFn: fetchFn as unknown as typeof fetch, config: { apiToken: TOKEN, baseUrl: BASE } },
    );
    expect(resolvePaymentState(status)).toBe('PAID');
    const [url, init] = fetchFn.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${BASE}/v2/GetPaymentStatus`);
    expect(JSON.parse(String(init?.body))).toEqual({ KeyType: 'PaymentId', Key: 'p-99' });

    const fetchFn2 = jsonFetch(okData({ InvoiceId: 99, InvoiceStatus: 'Pending' }));
    await getPaymentStatus(
      { invoiceId: 'INV-99' },
      { fetchFn: fetchFn2 as unknown as typeof fetch, config: { apiToken: TOKEN, baseUrl: BASE } },
    );
    const [url2, init2] = fetchFn2.mock.calls[0] as [string, RequestInit];
    expect(url2).toBe(`${BASE}/v2/GetPaymentStatus`);
    expect(JSON.parse(String(init2?.body))).toEqual({ KeyType: 'InvoiceId', Key: 'INV-99' });
  });
});

describe('resolvePaymentState — fail closed', () => {
  const base = { invoiceId: '1', invoiceStatus: '' };

  it('maps explicit paid spellings to PAID', () => {
    expect(resolvePaymentState({ ...base, invoiceStatus: 'Paid' })).toBe('PAID');
    expect(
      resolvePaymentState({ ...base, invoiceStatus: 'Pending', transactionStatus: 'Succss' }),
    ).toBe('PAID');
  });

  it('maps explicit failure spellings to FAILED', () => {
    expect(resolvePaymentState({ ...base, invoiceStatus: 'Canceled' })).toBe('FAILED');
    expect(
      resolvePaymentState({ ...base, invoiceStatus: 'Pending', transactionStatus: 'Failed' }),
    ).toBe('FAILED');
  });

  it('never maps unknown statuses to PAID', () => {
    expect(resolvePaymentState({ ...base, invoiceStatus: 'Pending' })).toBe('PENDING');
    expect(resolvePaymentState({ ...base, invoiceStatus: 'Unpaid' })).toBe('PENDING');
    expect(resolvePaymentState({ ...base, invoiceStatus: 'SomethingNew' })).toBe('PENDING');
    expect(resolvePaymentState(base)).toBe('PENDING');
  });
});
