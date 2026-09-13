'use client';

import { useCallback, useState } from 'react';

/**
 * Generic form hook — provides submit, loading, error, and field-level error management.
 */
export function useForm<T extends Record<string, unknown>>(options: {
  initialValues: T;
  onSubmit: (values: T) => Promise<void>;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
}) {
  const [values, setValues] = useState<T>(options.initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const setFieldValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    if (options.validate) {
      const fieldErrors = options.validate(values);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
        return;
      }
    }
    setStatus('loading');
    setSubmitError(null);
    try {
      await options.onSubmit(values);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setSubmitError(err instanceof Error ? err.message : 'An error occurred');
    }
  }, [values, options]);

  const reset = useCallback(() => {
    setValues(options.initialValues);
    setErrors({});
    setStatus('idle');
    setSubmitError(null);
  }, [options.initialValues]);

  return { values, errors, status, submitError, setFieldValue, handleSubmit, reset };
}
