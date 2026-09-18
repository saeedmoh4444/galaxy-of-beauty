/**
 * Unified AsyncStorage accessor for mobile.
 *
 * @react-native-async-storage/async-storage is a native module — binaries
 * that predate it (OTA-only installs) throw at require time, so the same
 * graceful pattern used across authToken.ts / offlineQueue.ts lives here:
 * real persistence when the module exists, in-memory fallback otherwise.
 *
 * Consumers: authToken (token persistence), offlineQueue (action queue),
 * TRPCProvider (react-query cache persister).
 */

interface StorageLike {
  getItem(k: string): Promise<string | null>;
  setItem(k: string, v: string): Promise<void>;
  removeItem(k: string): Promise<void>;
}

export const AsyncStorage: StorageLike = (() => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('@react-native-async-storage/async-storage').default as StorageLike;
  } catch {
    const store = new Map<string, string>();
    return {
      getItem: async (k: string) => store.get(k) ?? null,
      setItem: async (k: string, v: string) => {
        store.set(k, v);
      },
      removeItem: async (k: string) => {
        store.delete(k);
      },
    };
  }
})();
