'use client';

import { useState, useCallback, useRef } from 'react';

interface UseRetryOptions {
  maxRetries?: number;
  baseDelayMs?: number;
  exponential?: boolean;
}

interface UseRetryResult {
  retryCount: number;
  isRetrying: boolean;
  retry: () => void;
  reset: () => void;
  /** Execute fn with automatic retry on failure */
  withRetry: <T>(fn: () => Promise<T>) => Promise<T | null>;
}

/**
 * Hook for retry logic with exponential backoff.
 * Used for API call retries and error recovery flows.
 */
export function useRetry({
  maxRetries = 3,
  baseDelayMs = 1000,
  exponential = true,
}: UseRetryOptions = {}): UseRetryResult {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = useCallback(() => {
    setRetryCount(0);
    setIsRetrying(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const retry = useCallback(() => {
    if (retryCount >= maxRetries) return;
    setRetryCount((c) => c + 1);
  }, [retryCount, maxRetries]);

  const withRetry = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T | null> => {
      setIsRetrying(true);

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const result = await fn();
          setIsRetrying(false);
          setRetryCount(0);
          return result;
        } catch (err) {
          if (attempt === maxRetries) {
            setIsRetrying(false);
            return null;
          }
          // Wait with exponential backoff
          const delay = exponential ? baseDelayMs * Math.pow(2, attempt) : baseDelayMs;
          await new Promise((resolve) => {
            timerRef.current = setTimeout(resolve, delay);
          });
        }
      }

      setIsRetrying(false);
      return null;
    },
    [maxRetries, baseDelayMs, exponential],
  );

  return { retryCount, isRetrying, retry, reset, withRetry };
}
