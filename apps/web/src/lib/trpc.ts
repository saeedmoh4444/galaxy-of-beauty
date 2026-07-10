import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@galaxy/api';

export const api = createTRPCReact<AppRouter>();
