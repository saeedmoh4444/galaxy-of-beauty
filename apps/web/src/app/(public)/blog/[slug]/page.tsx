import type { Metadata } from 'next';
import { getServerCaller, serializeForClient } from '@/lib/server-trpc';
import { BlogPostClient } from './BlogPostClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const caller = await getServerCaller();
    const post = await (caller as any).blog.getBySlug({ slug });
    if (post) {
      const title = post.titleJson?.ar ?? post.titleJson?.en ?? '';
      const body = post.bodyJson?.ar ?? post.bodyJson?.en ?? '';
      return {
        title: `${title} | مدونة الجمال`,
        description: body.replace(/<[^>]+>/g, '').slice(0, 160),
        openGraph: { title, description: body.replace(/<[^>]+>/g, '').slice(0, 160) },
      };
    }
  } catch {
    /* fall through */
  }
  return { title: 'المقال | مدونة الجمال' };
}

export default async function BlogPostPage({ params }: Props): Promise<JSX.Element> {
  const { slug } = await params;

  if (!slug) {
    return <BlogPostClient slug="" initialPost={null} fetchError="رابط غير صالح" />;
  }

  let post: Record<string, unknown> | null = null;
  let fetchError: string | undefined;

  try {
    const caller = await getServerCaller();
    post = serializeForClient(await (caller as any).blog.getBySlug({ slug }));
  } catch (e) {
    fetchError = (e as Error).message || 'فشل تحميل المقال';
  }

  return <BlogPostClient slug={slug} initialPost={post} fetchError={fetchError} />;
}
