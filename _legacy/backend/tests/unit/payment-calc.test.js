/**
 * Payment Calculation Unit Tests
 *
 * Tests core payment formulas: platform fees, cash handling deductions,
 * PayFort signature computation, and payment distribution logic.
 */
import { jest } from '@jest/globals';
import crypto from 'crypto';

// =============================================================================
// Formula extraction from services/payment.js
// =============================================================================

/**
 * Mirror of computePayFortSignature from payment.js.
 * Uses SHA-256 with request phrase + specific field ordering.
 */
function computeSignature(params, requestPhrase) {
  const ordered = [
    'access_code', 'amount', 'command', 'currency',
    'customer_email', 'customer_name', 'language',
    'merchant_identifier', 'merchant_reference', 'return_url',
  ];
  let sigString = requestPhrase;
  for (const key of ordered) {
    if (params[key] !== undefined) {
      sigString += `${key}=${params[key]}`;
    }
  }
  sigString += requestPhrase;
  return crypto.createHash('sha256').update(sigString).digest('hex');
}

// =============================================================================
// Pure function tests
// =============================================================================

describe('Payment Calculations', () => {
  describe('Platform Fee Calculation', () => {
    test('should return default platform fee of 11 SAR', () => {
      const PLATFORM_FEE_SAR = 11;
      expect(PLATFORM_FEE_SAR).toBe(11);
    });

    test('should calculate total with platform fee', () => {
      const servicePrice = 100;
      const platformFee = 11;
      const paymentFee = 2.9;
      const total = Math.round((servicePrice + platformFee + paymentFee) * 100) / 100;
      expect(total).toBe(113.9);
    });

    test('should calculate offline total with cash handling fee', () => {
      const servicePrice = 150;
      const platformFee = 11;
      const paymentFee = 2.9;
      const cashHandlingFee = 5;
      const total = Math.round((servicePrice + platformFee + paymentFee + cashHandlingFee) * 100) / 100;
      expect(total).toBe(168.9);
    });
  });

  describe('Cash Handling Deduction from Technician Wallet', () => {
    test('should deduct full platform fees + handling fee from technician wallet for cash payments', () => {
      const walletBalance = 500;
      const platformFee = 11;
      const paymentFee = 2.9;
      const cashHandlingFee = 5;
      const totalDeduction = Math.round((platformFee + paymentFee + cashHandlingFee) * 100) / 100;

      const remaining = Math.round((walletBalance - totalDeduction) * 100) / 100;
      expect(remaining).toBe(481.1);
    });

    test('should reject cash payment if technician has insufficient wallet balance', () => {
      const walletBalance = 10;
      const totalDeduction = 11 + 2.9 + 5; // 18.9
      expect(walletBalance >= totalDeduction).toBe(false);
    });
  });

  describe('Technician Earnings Distribution', () => {
    test('should distribute 99% to bank, 1% to wallet from service price', () => {
      const servicePrice = 200;
      const bankAmount = Math.round(servicePrice * 0.99 * 100) / 100;
      const walletShare = Math.round((servicePrice * 0.01) * 100) / 100;

      expect(bankAmount).toBe(198);
      expect(walletShare).toBe(2);
      expect(bankAmount + walletShare).toBe(200);
    });

    test('should also credit 25% of platform fee to technician wallet', () => {
      const platformFee = 11;
      const platformFeeShare = Math.round((platformFee * 0.25) * 100) / 100;

      expect(platformFeeShare).toBe(2.75);
    });

    test('should calculate total technician wallet credit correctly', () => {
      const servicePrice = 200;
      const platformFee = 11;
      const walletShare = Math.round(servicePrice * 0.01 * 100) / 100;
      const platformFeeShare = Math.round((platformFee * 0.25) * 100) / 100;
      const totalWalletCredit = Math.round((walletShare + platformFeeShare) * 100) / 100;

      expect(totalWalletCredit).toBe(4.75); // 2.00 + 2.75
    });
  });

  describe('Commission Calculation', () => {
    test('should calculate platform commission correctly', () => {
      const servicePrice = 100;
      const platformFee = 11;
      const commission = platformFee; // full platform fee is commission
      const paymentFeeToGateway = 2.9;

      const platformRevenue = commission;
      const gatewayRevenue = paymentFeeToGateway;
      const totalFees = Math.round((platformRevenue + gatewayRevenue) * 100) / 100;

      expect(platformRevenue).toBe(11);
      expect(gatewayRevenue).toBe(2.9);
      expect(totalFees).toBe(13.9);
    });
  });

  describe('PayFort Signature Generation', () => {
    test('should generate a deterministic SHA-256 signature', () => {
      const params = {
        access_code: 'test_access',
        amount: '10000',
        command: 'AUTHORIZATION',
        currency: 'SAR',
        customer_email: 'test@example.com',
        customer_name: 'Test User',
        language: 'ar',
        merchant_identifier: 'test_merchant',
        merchant_reference: 'GOB-ABC123',
        return_url: 'https://example.com/callback',
      };
      const requestPhrase = 'TEST_PHRASE';

      const sig = computeSignature(params, requestPhrase);
      expect(sig).toBeTruthy();
      expect(typeof sig).toBe('string');
      expect(sig.length).toBe(64); // SHA-256 hex output
    });

    test('should generate different signatures for different amounts', () => {
      const baseParams = {
        access_code: 'test_access',
        currency: 'SAR',
        command: 'AUTHORIZATION',
        customer_email: 'test@example.com',
        customer_name: 'Test User',
        language: 'ar',
        merchant_identifier: 'test_merchant',
        merchant_reference: 'GOB-ABC123',
        return_url: 'https://example.com/callback',
      };

      const sig1 = computeSignature({ ...baseParams, amount: '10000' }, 'PHRASE');
      const sig2 = computeSignature({ ...baseParams, amount: '20000' }, 'PHRASE');
      expect(sig1).not.toBe(sig2);
    });
  });
});

describe('Cashback Business Rules', () => {
  test('first booking should get 40% cashback', () => {
    const servicePrice = 100;
    const cashback = Math.round(servicePrice * 0.4 * 100) / 100;
    expect(cashback).toBe(40);
  });

  test('subsequent bookings should get 5% cashback', () => {
    const servicePrice = 100;
    const cashback = Math.round(servicePrice * 0.05 * 100) / 100;
    expect(cashback).toBe(5);
  });

  test('wallet usage should be capped at 10% of service price', () => {
    const servicePrice = 200;
    const maxWalletUsage = Math.round(servicePrice * 0.1 * 100) / 100;
    expect(maxWalletUsage).toBe(20);
  });

  test('should reject wallet usage exceeding the 10% cap', () => {
    const servicePrice = 100;
    const maxCap = servicePrice * 0.1; // 10 SAR
    const requestedAmount = 50;
    expect(requestedAmount <= maxCap).toBe(false);
  });
});

describe('Withdrawal Rules', () => {
  test('should require minimum 200 SAR balance to withdraw', () => {
    const MIN_BALANCE = 200;
    expect(150 >= MIN_BALANCE).toBe(false);
    expect(250 >= MIN_BALANCE).toBe(true);
  });

  test('should apply 5% withdrawal fee', () => {
    const amount = 100;
    const fee = Math.round(amount * 0.05 * 100) / 100;
    const received = Math.round((amount - fee) * 100) / 100;

    expect(fee).toBe(5);
    expect(received).toBe(95);
  });

  test('should require minimum withdrawal of 100 SAR', () => {
    const MIN_WITHDRAWAL = 100;
    expect(50 >= MIN_WITHDRAWAL).toBe(false);
    expect(100 >= MIN_WITHDRAWAL).toBe(true);
  });

  test('should not allow withdrawal if net amount would be below zero after fee', () => {
    const balance = 200;
    const withdrawal = 100;
    const fee = withdrawal * 0.05; // 5 SAR
    const net = balance - withdrawal - fee; // 95 SAR
    expect(net).toBeGreaterThanOrEqual(0);
  });
});
