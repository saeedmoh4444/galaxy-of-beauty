import { useState, useEffect, useCallback } from 'react';

interface QueryState<T> {
  data: T | null;
  loading: boolean;
  error: boolean;
  refetch: () => void;
}

/**
 * Typed hook for tRPC queries — replaces the `(trpc as any)` pattern
 * with proper type inference, loading states, and error handling with retry.
 *
 * @example
 * const { data, loading, error, refetch } = useQuery(() => trpc.services.list.query({}));
 */
export function useQuery<T>(queryFn: () => Promise<T>): QueryState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(false);
    queryFn()
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  return { data, loading, error, refetch };
}

/**
 * Typed hook for tRPC mutations.
 *
 * @example
 * const { mutate, loading } = useMutation((input) => trpc.bookings.cancel.mutate(input));
 */
export function useMutation<TInput, TOutput>(
  mutationFn: (input: TInput) => Promise<TOutput>,
): { mutate: (input: TInput) => Promise<TOutput | null>; loading: boolean } {
  const [loading, setLoading] = useState(false);

  const mutate = useCallback(async (input: TInput): Promise<TOutput | null> => {
    setLoading(true);
    try {
      const result = await mutationFn(input);
      setLoading(false);
      return result;
    } catch {
      setLoading(false);
      return null;
    }
  }, [mutationFn]);

  return { mutate, loading };
}
