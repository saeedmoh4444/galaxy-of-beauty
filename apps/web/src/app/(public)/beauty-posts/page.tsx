'use client';

import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import Link from 'next/link';
import { api } from '@/lib/trpc';
import { CardListSkeleton, VerifiedBadge, useAuth, useToast } from '@galaxy/ui';
import { useLocale } from '@/components/LocaleProvider';

type PostRow = {
  id: number;
  imageUrl: string;
  caption: string | null;
  likes: number;
  views: number;
  likedByMe: boolean;
  author: { id: number; name: string; kycStatus: string | null };
  tags: {
    products: Array<{
      id: number;
      nameJson: { ar?: string; en?: string };
      brand: string | null;
      price: number;
    }>;
    services: Array<{
      id: number;
      titleJson: { ar?: string; en?: string };
      basePrice: number;
    }>;
  };
  createdAt: string;
};

function pick(nameJson: { ar?: string; en?: string } | undefined, locale: string): string {
  return locale === 'ar' ? (nameJson?.ar ?? '') : (nameJson?.en ?? '');
}

export default function BeautyPostsPage(): JSX.Element {
  const { t, locale } = useLocale();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const { data, isLoading, refetch } = api.beautyPosts.feed.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const likeMut = api.beautyPosts.like.useMutation({ onSuccess: () => refetch() });
  const addCartMut = api.marketplace.addToCart.useMutation({
    onSuccess: () => addToast('success', t('beautyPosts.addedToCart')),
    onError: () => addToast('error', t('beautyPosts.cartError')),
  });
  const tagClickMut = api.beautyPosts.tagClick.useMutation();
  const commentMut = api.beautyPosts.addComment.useMutation({ onSuccess: () => refetch() });
  const [viewedIds, setViewedIds] = useState<number[]>([]);
  const [openTags, setOpenTags] = useState<number | null>(null);
  const [openComments, setOpenComments] = useState<number | null>(null);
  const [commentText, setCommentText] = useState<Record<number, string>>({});

  const posts = (data ?? []) as unknown as PostRow[];

  // Fire `viewed` once per post per mount (impression tracking is
  // best-effort; the mutation itself is a simple counter increment).
  const viewedMut = api.beautyPosts.viewed.useMutation({});
  useEffect(() => {
    const queue = posts.map((p) => p.id).filter((id) => !viewedIds.includes(id));
    if (queue.length === 0) return;
    setViewedIds((prev) => [...prev, ...queue]);
    for (const id of queue) viewedMut.mutate({ postId: id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts.length]);

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">{t('beautyPosts.title')}</h1>
        <p className="mt-2 text-text-secondary">{t('beautyPosts.subtitle')}</p>
        {isAuthenticated && (
          <Link
            href="/beauty-posts/new"
            className="mt-4 inline-block rounded-full bg-brand-600 px-5 py-2 text-sm font-bold text-white hover:bg-brand-700"
          >
            ✨ {t('beautyPosts.shareLook')}
          </Link>
        )}
      </div>

      {isLoading ? (
        <CardListSkeleton count={3} />
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <article
              key={post.id}
              className="overflow-hidden rounded-2xl bg-surface-elevated shadow-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.imageUrl}
                alt={post.caption ?? ''}
                className="aspect-[4/3] w-full object-cover"
                loading="lazy"
              />
              <div className="space-y-3 p-4">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-text-primary">
                    {post.author.name}
                  </span>
                  {post.author.kycStatus === 'VERIFIED' && (
                    <VerifiedBadge status="VERIFIED" locale={locale} />
                  )}
                  <span className="ms-auto text-xs text-text-tertiary">👁 {post.views}</span>
                </div>

                {post.caption && (
                  <p className="text-sm text-text-primary">
                    {post.caption} <span className="text-brand-600">#MyGalaxyLook</span>
                  </p>
                )}

                {/* Shoppable tags */}
                {(post.tags.products.length > 0 || post.tags.services.length > 0) && (
                  <div className="rounded-xl bg-surface-muted p-3">
                    <button
                      className="text-xs font-bold text-brand-600"
                      onClick={() => setOpenTags(openTags === post.id ? null : post.id)}
                    >
                      {t('beautyPosts.getThisLook')}
                    </button>
                    {openTags === post.id && (
                      <div className="mt-2 space-y-2">
                        {post.tags.products.map((prod) => (
                          <div key={`p${prod.id}`} className="flex items-center gap-2 text-sm">
                            <span className="flex-1 truncate text-text-primary">
                              🛍️ {pick(prod.nameJson, locale)}
                              {prod.brand ? ` · ${prod.brand}` : ''}
                            </span>
                            <span className="text-xs text-text-secondary">SAR {prod.price}</span>
                            <button
                              className="rounded-full bg-brand-600 px-3 py-1 text-xs font-bold text-white"
                              onClick={() => {
                                tagClickMut.mutate({
                                  postId: post.id,
                                  kind: 'product_click',
                                  targetId: prod.id,
                                });
                                addCartMut.mutate({ productId: prod.id });
                              }}
                            >
                              {t('beautyPosts.addToCart')}
                            </button>
                          </div>
                        ))}
                        {post.tags.services.map((svc) => (
                          <div key={`s${svc.id}`} className="flex items-center gap-2 text-sm">
                            <span className="flex-1 truncate text-text-primary">
                              💆‍♀️ {pick(svc.titleJson, locale)}
                            </span>
                            <span className="text-xs text-text-secondary">SAR {svc.basePrice}</span>
                            <Link
                              href={`/bookings/create?serviceId=${svc.id}`}
                              onClick={() =>
                                tagClickMut.mutate({
                                  postId: post.id,
                                  kind: 'service_click',
                                  targetId: svc.id,
                                })
                              }
                              className="rounded-full bg-accent-500 px-3 py-1 text-xs font-bold text-white"
                            >
                              {t('beautyPosts.book')}
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Like + comments actions */}
                <div className="flex items-center gap-3 border-t border-edge-muted pt-3 text-sm">
                  <button
                    className={`font-bold ${post.likedByMe ? 'text-brand-600' : 'text-text-secondary'}`}
                    onClick={() => {
                      if (!isAuthenticated) return;
                      likeMut.mutate({ postId: post.id });
                    }}
                  >
                    {post.likedByMe ? '❤️' : '🤍'} {post.likes}
                  </button>
                  <button
                    className="font-bold text-text-secondary"
                    onClick={() => setOpenComments(openComments === post.id ? null : post.id)}
                  >
                    💬 {t('beautyPosts.comments')}
                  </button>
                </div>

                {openComments === post.id && (
                  <PostComments
                    postId={post.id}
                    commentText={commentText[post.id] ?? ''}
                    setCommentText={(v) => setCommentText((prev) => ({ ...prev, [post.id]: v }))}
                    onSubmit={() => {
                      const content = (commentText[post.id] ?? '').trim();
                      if (!content || !isAuthenticated) return;
                      commentMut.mutate({ postId: post.id, content });
                      setCommentText((prev) => ({ ...prev, [post.id]: '' }));
                    }}
                  />
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function PostComments({
  postId,
  commentText,
  setCommentText,
  onSubmit,
}: {
  postId: number;
  commentText: string;
  setCommentText: (v: string) => void;
  onSubmit: () => void;
}): JSX.Element {
  const { t } = useLocale();
  const { data } = api.beautyPosts.comments.useQuery({ postId });
  const comments =
    (data as unknown as Array<{
      id: number;
      content: string;
      author: { name: string };
      createdAt: string;
    }>) ?? [];

  return (
    <div className="space-y-2">
      {comments.map((c) => (
        <div key={c.id} className="rounded-lg bg-surface-muted px-3 py-2 text-sm">
          <span className="font-semibold text-text-primary">{c.author.name}: </span>
          <span className="text-text-secondary">{c.content}</span>
        </div>
      ))}
      <div className="flex gap-2">
        <input
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder={t('beautyPosts.commentPlaceholder') as string}
          className="flex-1 rounded-lg border border-edge px-3 py-2 text-sm bg-surface-elevated"
        />
        <button
          onClick={onSubmit}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-bold text-white"
        >
          {t('beautyPosts.send') as string}
        </button>
      </div>
    </div>
  );
}
