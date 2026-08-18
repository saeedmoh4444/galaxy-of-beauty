import type { Metadata } from 'next';
import { getServerCaller, serializeForClient } from '@/lib/server-trpc';
import { BlogPostClient } from './BlogPostClient';
import { getServerLocale } from '@/lib/i18n';
import { t } from '@galaxy/shared';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getServerLocale();
  try {
    const caller = await getServerCaller();
    const post = await caller.blog.getBySlug({ slug });
    if (post) {
      const titleJson = post.titleJson as Record<string, string>;
      const title = titleJson.ar ?? titleJson.en ?? '';
      const bodyJson = post.bodyJson as Record<string, string>;
      const body = bodyJson.ar ?? bodyJson.en ?? '';
      return {
        title: `${title} | ${t('marketing.blog.meta-blog-name', locale)}`,
        description: body.replace(/<[^>]+>/g, '').slice(0, 160),
        openGraph: { title, description: body.replace(/<[^>]+>/g, '').slice(0, 160) },
      };
    }
  } catch {
    /* fall through */
  }
  return {
    title: `${t('marketing.blog.meta-article', locale)} | ${t('marketing.blog.meta-blog-name', locale)}`,
  };
}

export default async function BlogPostPage({ params }: Props): Promise<JSX.Element> {
  const { slug } = await params;
  const locale = await getServerLocale();

  if (!slug) {
    return (
      <BlogPostClient
        slug=""
        initialPost={null}
        fetchError={t('marketing.blog.invalid-link', locale)}
      />
    );
  }

  let post: Record<string, unknown> | null = null;
  let fetchError: string | undefined;

  try {
    const caller = await getServerCaller();
    post = serializeForClient(await caller.blog.getBySlug({ slug })) as unknown as Record<
      string,
      unknown
    > | null;
  } catch (e) {
    fetchError = (e as Error).message || t('marketing.blog.load-error-post', locale);
  }

  return <BlogPostClient slug={slug} initialPost={post} fetchError={fetchError} />;
}
