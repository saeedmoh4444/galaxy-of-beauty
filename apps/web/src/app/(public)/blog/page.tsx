import Link from 'next/link';
import { getServerCaller } from '@/lib/server-trpc';

export default async function BlogPage(): Promise<JSX.Element> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let posts: any[] = [];
  try {
    const caller = await getServerCaller();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await caller.blog.list({ page: 1, limit: 9 }) as any;
    posts = result.items ?? [];
  } catch { /* empty */ }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">مدونة الجمال</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">نصائح، اتجاهات، وأسرار العناية بالجمال</p>
      </div>
      {posts.length === 0 ? (
        <p className="text-center text-gray-400">لا توجد مقالات بعد. تابعينا قريباً!</p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post: Record<string, any>) => {
            const title = (post.titleJson as Record<string, string>)?.ar || '';
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const tags: string[] = post.tags ?? [];
            const date = post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
            return (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white transition-shadow hover:shadow-lg dark:border-gray-800 dark:bg-gray-900">
                  <div className="flex h-48 items-center justify-center bg-gradient-to-br from-brand-100 to-accent-100 text-5xl dark:from-brand-900 dark:to-accent-900">
                    {post.imageUrl ? <img src={post.imageUrl} alt={title} className="h-full w-full object-cover" loading="lazy" /> : <span>✨</span>}
                  </div>
                  <div className="p-5">
                    <div className="mb-2 flex flex-wrap gap-1">
                      {tags.slice(0, 3).map((t: string) => <span key={t} className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-600 dark:bg-brand-950">{t}</span>)}
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 group-hover:text-brand-600 dark:text-gray-100">{title}</h2>
                    {date && <p className="mt-2 text-xs text-gray-400">{date}</p>}
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
