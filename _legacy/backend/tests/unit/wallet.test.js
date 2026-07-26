/**
 * Unit tests for wallet business logic.
 * Tests cashback calculations, withdrawal rules, and fee computations.
 */
import { AppError } from '../../src/utils/errors.js';

// ---- Wallet Business Logic (pure functions for unit testing) ----

/**
 * Calculate customer cashback amount.
 * First booking: 40%, subsequent: 5%.
 */
function calculateCashback(servicePrice, isFirstBooking, config = {}) {
  const cashbackPercent = isFirstBooking
    ? (config.cashbackFirstBookingPercent || 40)
    : (config.cashbackSubsequentPercent || 5);
  return Math.round((servicePrice * cashbackPercent) / 100 * 100) / 100;
}

/**
 * Calculate max wallet usage for a booking (10% of service price).
 */
function calculateMaxWalletUsage(servicePrice, config = {}) {
  const maxPercent = config.walletUsageMaxPercent || 10;
  return Math.round((servicePrice * maxPercent) / 100 * 100) / 100;
}

/**
 * Calculate technician earnings from a booking.
 * 99% to bank (payout), 1% + 25% of platform fee to wallet.
 */
function calculateTechnicianEarnings(servicePrice, platformFee, config = {}) {
  const earningsPercent = config.technicianEarningsPercent || 99;
  const walletSharePercent = config.technicianWalletSharePercent || 1;
  const platformFeeSharePercent = config.technicianPlatformFeeSharePercent || 25;

  const bankAmount = Math.round((servicePrice * earningsPercent) / 100 * 100) / 100;
  const walletAmount = Math.round((servicePrice * walletSharePercent) / 100 * 100) / 100
    + Math.round((platformFee * platformFeeSharePercent) / 100 * 100) / 100;

  return { bankAmount, walletAmount };
}

/**
 * Validate withdrawal eligibility.
 * Minimum balance: 200 SAR, minimum amount: 100 SAR.
 */
function validateWithdrawal(walletBalance, amount, config = {}) {
  const minBalance = config.minWithdrawalBalance || 200;
  const minAmount = config.minWithdrawalAmount || 100;
  const feePercent = config.withdrawalFeePercent || 5;

  if (amount < minAmount) {
    throw new AppError(`Minimum withdrawal is ${minAmount} SAR`, 400, 'BELOW_MINIMUM_AMOUNT');
  }
  if (walletBalance < minBalance) {
    throw new AppError(`Minimum balance of ${minBalance} SAR required`, 400, 'BELOW_MINIMUM_BALANCE');
  }
  if (amount > walletBalance) {
    throw new AppError('Insufficient balance', 400, 'INSUFFICIENT_FUNDS');
  }

  const fee = Math.round((amount * feePercent) / 100 * 100) / 100;
  const netAmount = amount - fee;

  return { gross: amount, fee, net: netAmount };
}

// ---- Tests ----

describe('Cashback Calculation', () => {
  it('should give 40% cashback on first booking', () => {
    const cashback = calculateCashback(200, true);
    expect(cashback).toBe(80); // 40% of 200
  });

  it('should give 5% cashback on subsequent bookings', () => {
    const cashback = calculateCashback(200, false);
    expect(cashback).toBe(10); // 5% of 200
  });

  it('should round to 2 decimal places', () => {
    const cashback = calculateCashback(199.99, false);
    expect(cashback).toBe(10.00);
  });

  it('should give correct first booking cashback for edge case', () => {
    const cashback = calculateCashback(1, true);
    expect(cashback).toBe(0.40);
  });
});

describe('Max Wallet Usage', () => {
  it('should limit wallet usage to 10% of service price', () => {
    expect(calculateMaxWalletUsage(200)).toBe(20);
  });

  it('should handle small amounts', () => {
    expect(calculateMaxWalletUsage(50)).toBe(5);
  });

  it('should handle zero', () => {
    expect(calculateMaxWalletUsage(0)).toBe(0);
  });
});

describe('Technician Earnings', () => {
  it('should split earnings correctly: 99% bank, 1% + platform fee share to wallet', () => {
    const { bankAmount, walletAmount } = calculateTechnicianEarnings(200, 11);
    expect(bankAmount).toBe(198); // 99% of 200
    expect(walletAmount).toBe(4.75); // 1% of 200 = 2, + 25% of 11 = 2.75, total 4.75
  });

  it('should handle custom config values', () => {
    const { bankAmount, walletAmount } = calculateTechnicianEarnings(100, 10, {
      technicianEarningsPercent: 95,
      technicianWalletSharePercent: 5,
      technicianPlatformFeeSharePercent: 50,
    });
    expect(bankAmount).toBe(95);
    expect(walletAmount).toBe(10); // 5% of 100 = 5, + 50% of 10 = 5, total 10
  });
});

describe('Withdrawal Validation', () => {
  it('should reject withdrawal below 100 SAR', () => {
    expect(() => validateWithdrawal(500, 50)).toThrow(AppError);
  });

  it('should reject withdrawal when balance below 200', () => {
    expect(() => validateWithdrawal(150, 100)).toThrow(AppError);
  });

  it('should reject withdrawal exceeding balance', () => {
    expect(() => validateWithdrawal(300, 350)).toThrow(AppError);
  });

  it('should calculate 5% fee correctly', () => {
    const result = validateWithdrawal(500, 200);
    expect(result.gross).toBe(200);
    expect(result.fee).toBe(10); // 5% of 200
    expect(result.net).toBe(190);
  });

  it('should allow withdrawal at exactly minimum values', () => {
    const result = validateWithdrawal(200, 100);
    expect(result.net).toBe(95); // 100 - 5% fee
  });
});
