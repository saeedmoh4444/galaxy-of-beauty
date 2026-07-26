/**
 * Circuit Breaker Pattern
 *
 * Prevents cascading failures by detecting when an external service
 * is unhealthy and "opening the circuit" — failing fast instead of
 * waiting for timeouts on every request.
 *
 * States:
 *   CLOSED     → Normal operation. Failures increment counter.
 *   OPEN       → Circuit is open. All calls fail fast.
 *   HALF_OPEN  → After timeoutMs, allow one probe request.
 *
 * Usage:
 *   const payFortBreaker = new CircuitBreaker('payfort', {
 *     failureThreshold: 5,
 *     timeoutMs: 30000,
 *   });
 *
 *   const result = await payFortBreaker.call(async () => {
 *     return await payFortApi.authorize(params);
 *   });
 */

import logger from '../config/logger.js';

const STATE = { CLOSED: 'CLOSED', OPEN: 'OPEN', HALF_OPEN: 'HALF_OPEN' };

export class CircuitBreaker {
  /**
   * @param {string} name - Service name for logging
   * @param {object} options
   * @param {number} options.failureThreshold - Failures before opening circuit (default: 5)
   * @param {number} options.timeoutMs - Time before trying half-open (default: 30000)
   * @param {number} options.successThreshold - Successes in half-open to close (default: 2)
   */
  constructor(name, options = {}) {
    this.name = name;
    this.failureThreshold = options.failureThreshold || 5;
    this.timeoutMs = options.timeoutMs || 30000;
    this.successThreshold = options.successThreshold || 2;

    this.state = STATE.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.lastFailureError = null;
  }

  /**
   * Execute a function with circuit breaker protection.
   *
   * @param {() => Promise<any>} fn - Async function to execute
   * @param {() => any} [fallback] - Optional fallback function if circuit is open
   * @returns {Promise<any>}
   */
  async call(fn, fallback = null) {
    // Circuit OPEN — fail fast
    if (this.state === STATE.OPEN) {
      if (Date.now() - this.lastFailureTime >= this.timeoutMs) {
        // Transition to HALF_OPEN to test the waters
        this.state = STATE.HALF_OPEN;
        this.successCount = 0;
        logger.info(`Circuit ${this.name}: OPEN → HALF_OPEN (timeout elapsed)`);
      } else {
        if (fallback) return fallback();
        throw new CircuitBreakerError(
          `Service ${this.name} is temporarily unavailable. Please try again later.`,
          this.name,
        );
      }
    }

    try {
      const result = await fn();

      // Success — reset on CLOSED, count on HALF_OPEN
      this.onSuccess();
      return result;

    } catch (error) {
      this.onFailure(error);

      if (fallback) return fallback();
      throw error;
    }
  }

  /**
   * Record a successful call.
   */
  onSuccess() {
    if (this.state === STATE.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        // Circuit closes — service is healthy again
        this.state = STATE.CLOSED;
        this.failureCount = 0;
        logger.info(`Circuit ${this.name}: HALF_OPEN → CLOSED (${this.successCount} successes)`);
      }
    } else if (this.state === STATE.CLOSED) {
      // Reset failure count on success in CLOSED state
      this.failureCount = 0;
    }
  }

  /**
   * Record a failed call.
   */
  onFailure(error) {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    this.lastFailureError = error.message;

    if (this.state === STATE.HALF_OPEN) {
      // Failure in half-open — reopen circuit
      this.state = STATE.OPEN;
      logger.warn(`Circuit ${this.name}: HALF_OPEN → OPEN (probe failed: ${error.message})`);
    } else if (this.state === STATE.CLOSED && this.failureCount >= this.failureThreshold) {
      // Threshold reached — open circuit
      this.state = STATE.OPEN;
      logger.error(`Circuit ${this.name}: CLOSED → OPEN (${this.failureCount} failures, last: ${error.message})`);
    }
  }

  /**
   * Get current circuit status.
   */
  getStatus() {
    return {
      name: this.name,
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime ? new Date(this.lastFailureTime).toISOString() : null,
      lastFailureError: this.lastFailureError,
    };
  }

  /**
   * Force reset the circuit to CLOSED (for admin/manual intervention).
   */
  reset() {
    this.state = STATE.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.lastFailureError = null;
    logger.info(`Circuit ${this.name}: manually reset to CLOSED`);
  }
}

/**
 * Error thrown when circuit is open.
 */
export class CircuitBreakerError extends Error {
  constructor(message, serviceName) {
    super(message);
    this.name = 'CircuitBreakerError';
    this.serviceName = serviceName;
    this.isCircuitOpen = true;
  }
}

// =============================================================================
// Pre-configured circuit breakers for Galaxy of Beauty services
// =============================================================================

export const payFortBreaker = new CircuitBreaker('payfort', {
  failureThreshold: 3,
  timeoutMs: 60000,  // 1 minute before retrying PayFort
});

export const openAIBreaker = new CircuitBreaker('openai', {
  failureThreshold: 5,
  timeoutMs: 30000,
});

export const emailBreaker = new CircuitBreaker('email', {
  failureThreshold: 5,
  timeoutMs: 30000,
});

/**
 * Get status of all circuit breakers (for admin health check).
 */
export function getAllCircuitStatus() {
  return {
    payfort: payFortBreaker.getStatus(),
    openai: openAIBreaker.getStatus(),
    email: emailBreaker.getStatus(),
  };
}

export default { CircuitBreaker, CircuitBreakerError, payFortBreaker, openAIBreaker, emailBreaker, getAllCircuitStatus };
