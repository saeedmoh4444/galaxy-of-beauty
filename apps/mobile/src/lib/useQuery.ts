import { useState, useEffect, useCallback } from 'react';

interface QueryState<T> {
  data: T | null;
  loading: boolean;
  error: boolean;
  refreshing: boolean;
  refetch: () => void;
  refresh: () => void;
}

/**
 * Typed hook for tRPC queries — replaces the `(trpc as any)` pattern
 * with proper type inference, loading states, error handling with retry,
 * and pull-to-refresh support via `refreshing` + `refresh()`.
 *
 * @example
 * const { data, loading, error, refreshing, refetch, refresh } = useQuery(() => trpc.services.list.query({}));
 * // In ScrollView: refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
 */
export function useQuery<T>(queryFn: () => Promise<T>): QueryState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const execute = useCallback((isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(false);
    queryFn()
      .then((d) => { setData(d); setLoading(false); setRefreshing(false); })
      .catch(() => { setError(true); setLoading(false); setRefreshing(false); });
  }, []);

  const refetch = useCallback(() => execute(false), [execute]);
  const refresh = useCallback(() => execute(true), [execute]);

  useEffect(() => { execute(false); }, [execute]);

  return { data, loading, error, refreshing, refetch, refresh };
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
