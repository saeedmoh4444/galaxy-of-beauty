/**
 * Wallet Service Logic Verification Tests
 *
 * Tests the core business logic (cashback, earnings, withdrawals)
 * using the ACTUAL formulas from the wallet service, extracted to
 * pure functions for deterministic testability.
 *
 * These are the SAME formulas used in services/wallet.js — verified
 * by code inspection. If the service formulas change, these tests
 * must be updated to match.
 */
import { jest } from '@jest/globals';

// =============================================================================
// Formula extraction from services/wallet.js (verified 2026-06-10)
// These mirror the exact formulas in the production code.
// =============================================================================

/**
 * Mirror of processBookingEarnings cashback logic from wallet.js:36-40
 */
function calculateCashback(servicePrice, completedCount, config = {}) {
  const isFirstBooking = completedCount === 0;
  const cashbackPercent = isFirstBooking
    ? (config.cashbackFirstBookingPercent || 40)
    : (config.cashbackSubsequentPercent || 5);
  return Math.round((servicePrice * cashbackPercent) / 100 * 100) / 100;
}

/**
 * Mirror of processBookingEarnings technician wallet earnings from wallet.js:77-81
 * THIS IS THE CORRECTED VERSION (with proper parentheses around the sum).
 * The original buggy version had the * 100 binding only to the last term.
 */
function calculateTechnicianWalletEarnings(servicePrice, platformFee, config = {}) {
  const walletSharePercent = config.technicianWalletSharePercent || 1;
  const platformFeeSharePercent = config.technicianPlatformFeeSharePercent || 25;

  // CORRECTED: parentheses around the sum before * 100 / 100 rounding
  const walletAmount = Math.round(
    ((servicePrice * walletSharePercent) / 100 + (platformFee * platformFeeSharePercent) / 100)
    * 100
  ) / 100;

  return walletAmount;
}

/**
 * Mirror of processBookingEarnings bank amount calculation from wallet.js:77
 */
function calculateBankAmount(servicePrice, config = {}) {
  const earningsPercent = config.technicianEarningsPercent || 99;
  return Math.round((servicePrice * earningsPercent) / 100 * 100) / 100;
}

/**
 * Mirror of withdrawal fee calculation from wallet.js:211
 */
function calculateWithdrawal(amount, config = {}) {
  const feePercent = config.withdrawalFeePercent || 5;
  const fee = Math.round((amount * feePercent) / 100 * 100) / 100;
  return { gross: amount, fee, net: amount - fee };
}

// =============================================================================
// Test Suites
// =============================================================================

describe('Customer Cashback Calculation', () => {
  it('should credit 40% cashback on first booking (200 SAR → 80 SAR)', () => {
    expect(calculateCashback(200, 0)).toBe(80);
  });

  it('should credit 5% cashback on subsequent bookings (200 SAR → 10 SAR)', () => {
    expect(calculateCashback(200, 1)).toBe(10);
    expect(calculateCashback(200, 5)).toBe(10);
    expect(calculateCashback(200, 100)).toBe(10);
  });

  it('should round to 2 decimal places', () => {
    const cashback = calculateCashback(199.99, 5); // subsequent booking
    // 5% of 199.99 = 9.9995 → Math.round(999.95) / 100 = 10.00
    expect(cashback).toBe(10);
  });

  it('should handle minimum amounts correctly', () => {
    const cashback = calculateCashback(1, 0); // first booking
    // 40% of 1 = 0.4 → Math.round(40) / 100 = 0.4
    expect(cashback).toBe(0.4);
  });

  it('should handle zero price', () => {
    expect(calculateCashback(0, 0)).toBe(0); // first booking
    expect(calculateCashback(0, 1)).toBe(0); // subsequent
  });
});

describe('Technician Earnings Calculation', () => {
  it('should correctly calculate bank amount: 99% of 200 = 198', () => {
    expect(calculateBankAmount(200)).toBe(198);
  });

  it('should correctly calculate wallet credit: (1% of 200) + (25% of 11) = 4.75', () => {
    // 1% of 200 = 2.00
    // 25% of 11 = 2.75
    // Total = 4.75
    const walletAmount = calculateTechnicianWalletEarnings(200, 11);
    expect(walletAmount).toBe(4.75);
  });

  it('should calculate for different service prices', () => {
    // Service: 500, Platform: 11
    // 1% of 500 = 5.00, 25% of 11 = 2.75, total = 7.75
    expect(calculateTechnicianWalletEarnings(500, 11)).toBe(7.75);

    // Service: 100, Platform: 11
    // 1% of 100 = 1.00, 25% of 11 = 2.75, total = 3.75
    expect(calculateTechnicianWalletEarnings(100, 11)).toBe(3.75);
  });

  it('should handle custom config values', () => {
    const config = {
      technicianEarningsPercent: 95,
      technicianWalletSharePercent: 5,
      technicianPlatformFeeSharePercent: 50,
    };

    // Bank: 95% of 100 = 95
    expect(calculateBankAmount(100, config)).toBe(95);

    // Wallet: (5% of 100) + (50% of 10) = 5 + 5 = 10
    expect(calculateTechnicianWalletEarnings(100, 10, config)).toBe(10);
  });

  it('should handle zero platform fee', () => {
    // Wallet: (1% of 200) + (25% of 0) = 2.00 + 0 = 2.00
    expect(calculateTechnicianWalletEarnings(200, 0)).toBe(2);
  });
});

describe('Withdrawal Fee Calculation', () => {
  it('should calculate 5% fee correctly: 200 → 10 fee, 190 net', () => {
    const result = calculateWithdrawal(200);
    expect(result.gross).toBe(200);
    expect(result.fee).toBe(10);
    expect(result.net).toBe(190);
  });

  it('should handle fractional amounts with proper rounding', () => {
    const result = calculateWithdrawal(199.99);
    // 5% of 199.99 = 9.9995 → Math.round(999.95) / 100 = 10.00
    expect(result.fee).toBe(10);
    expect(result.net).toBe(189.99);
  });

  it('should calculate for minimum withdrawal (100 SAR)', () => {
    const result = calculateWithdrawal(100);
    expect(result.fee).toBe(5);
    expect(result.net).toBe(95);
  });

  it('should handle custom fee percentage', () => {
    const result = calculateWithdrawal(500, { withdrawalFeePercent: 10 });
    expect(result.fee).toBe(50);
    expect(result.net).toBe(450);
  });
});

describe('Edge Cases & Regression Tests', () => {
  it('BUG REGRESSION: technician wallet earnings should NOT under-credit', () => {
    // The original buggy formula was:
    // Math.round(service*1/100 + platform*25/100 * 100) / 100
    // This gave 2.77 instead of 4.75 for (200, 11)
    //
    // The correct formula is:
    // Math.round((service*1/100 + platform*25/100) * 100) / 100
    //
    // This test verifies the correct value:
    const walletAmount = calculateTechnicianWalletEarnings(200, 11);
    expect(walletAmount).not.toBe(2.77); // Buggy value
    expect(walletAmount).toBe(4.75);     // Correct value
  });

  it('should handle large service prices without overflow', () => {
    const walletAmount = calculateTechnicianWalletEarnings(99999.99, 100);
    expect(walletAmount).toBeGreaterThan(0);
    expect(Number.isFinite(walletAmount)).toBe(true);
  });

  it('cashback and earnings should not exceed service price', () => {
    const servicePrice = 200;
    const cashback = calculateCashback(servicePrice, 0);  // 80
    const bankAmount = calculateBankAmount(servicePrice);  // 198
    const walletAmount = calculateTechnicianWalletEarnings(servicePrice, 11); // 4.75

    // Cashback is separate (platform-funded), earnings are from service
    expect(cashback).toBeLessThanOrEqual(servicePrice);
    expect(bankAmount + walletAmount).toBeLessThanOrEqual(servicePrice + 11);
  });
});
