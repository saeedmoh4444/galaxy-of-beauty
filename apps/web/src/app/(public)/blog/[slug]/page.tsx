import Link from 'next/link';
import { getServerCaller } from '@/lib/server-trpc';
import { ShareButtons } from '@/components/ShareButtons';

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}): Promise<JSX.Element> {
  const { slug } = params;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let post: any = null;

  try {
    const caller = await getServerCaller();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    post = await caller.blog.getBySlug({ slug }) as any;
  } catch { /* not found */ }

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <span className="text-6xl">📝</span>
        <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100">المقال غير موجود</h1>
        <Link href="/blog" className="mt-4 inline-block text-brand-600 hover:underline">العودة للمدونة</Link>
      </div>
    );
  }

  const title = (post.titleJson as Record<string, string>)?.ar || '';
  const body = (post.bodyJson as Record<string, string>)?.ar || '';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tags: string[] = post.tags ?? [];
  const date = post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/blog" className="text-sm text-brand-600 hover:underline">← العودة للمدونة</Link>
      <article className="mt-6">
        {post.imageUrl && <img src={post.imageUrl} alt={title} className="mb-8 h-64 w-full rounded-2xl object-cover" />}
        <div className="mb-4 flex flex-wrap gap-2">{tags.map((t: string) => <span key={t} className="rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-600">{t}</span>)}</div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
        {date && <p className="mt-2 text-sm text-gray-400">{date}</p>}
        <div className="prose prose-brand mt-8 max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: body }} />
        <div className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-800">
          <p className="mb-3 text-sm text-gray-500">شاركي هذا المقال</p>
          <ShareButtons title={title} />
        </div>
      </article>
    </div>
  );
}
