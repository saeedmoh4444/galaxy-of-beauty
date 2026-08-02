import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@galaxy/api';
import { DEFAULT_LOCAL_URL } from '@galaxy/shared';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? `${DEFAULT_LOCAL_URL}/api/trpc`;

export const trpc = createTRPCClient<AppRouter>({
  links: [httpBatchLink({ url: API_URL })],
});
