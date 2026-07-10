import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@galaxy/api';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000/api/trpc';

export const trpc = createTRPCClient<AppRouter>({
  links: [httpBatchLink({ url: API_URL })],
});
