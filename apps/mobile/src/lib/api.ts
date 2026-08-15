import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@galaxy/api';
import superjson from 'superjson';
import { DEFAULT_LOCAL_URL } from '@galaxy/ui';
import { getAuthHeaders } from './authToken';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? `${DEFAULT_LOCAL_URL}/api/trpc`;

export const trpc = createTRPCClient<AppRouter>({
  links: [httpBatchLink({ url: API_URL, transformer: superjson, headers: getAuthHeaders })],
});
