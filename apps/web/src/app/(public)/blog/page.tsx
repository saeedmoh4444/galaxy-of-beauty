import { getServerCaller, serializeForClient } from '@/lib/server-trpc';
import { BlogClient } from './BlogClient';

export default async function BlogPage(): Promise<JSX.Element> {
  let initialPosts: unknown[] = [];
  let initialTotal = 0;

  try {
    const caller = await getServerCaller();
    const result = await (caller as any).blog.list({ page: 1, limit: 9 });
    initialPosts = serializeForClient(result.items ?? []);
    initialTotal = serializeForClient(result.total ?? 0);
  } catch {
    /* client will retry */
  }

  return <BlogClient initialPosts={initialPosts} initialTotal={initialTotal} />;
}
