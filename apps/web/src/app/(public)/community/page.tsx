'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, EmptyState, Button, Spinner, Pagination } from '@galaxy/shared';
import { useAuth } from '@galaxy/shared';
import Link from 'next/link';

interface Post {
  id: number;
  userId: number;
  content: string;
  imageUrl: string | null;
  likes: number;
  createdAt: string;
  userName: string;
  userAvatar: string | null;
}

const POSTS_PER_PAGE = 10;

function PostCard({
  post,
  isLiked,
  onToggleLike,
  onDelete,
  likePending,
  deletePending,
  currentUserId,
}: {
  post: Post;
  isLiked: boolean;
  onToggleLike: (postId: number) => void;
  onDelete: (postId: number) => void;
  likePending: boolean;
  deletePending: boolean;
  currentUserId: number | null;
}): JSX.Element {
  const isOwner = currentUserId === post.userId;
  const timeAgo = getTimeAgo(post.createdAt);

  return (
    <Card padding="md" className="transition-all hover:shadow-md">
      {/* Author Row */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white text-sm font-bold">
          {post.userAvatar ? (
            <img src={post.userAvatar} alt="" className="h-10 w-10 rounded-full object-cover" />
          ) : (
            (post.userName || 'م')[0]
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
            {post.userName || 'مستخدم'}
          </p>
          <p className="text-xs text-gray-400">{timeAgo}</p>
        </div>
        {isOwner && (
          <button
            onClick={() => onDelete(post.id)}
            disabled={deletePending}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
            title="حذف"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      {/* Content */}
      <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap leading-relaxed">
        {post.content}
      </p>

      {/* Image */}
      {post.imageUrl && (
        <div className="mt-3 overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800">
          <img
            src={post.imageUrl}
            alt="صورة المنشور"
            className="max-h-72 w-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* Actions */}
      <div className="mt-3 flex items-center gap-4 border-t border-gray-100 pt-3 dark:border-gray-800">
        <button
          onClick={() => onToggleLike(post.id)}
          disabled={likePending}
          className={`flex items-center gap-1.5 text-sm font-medium transition-all active:scale-95 disabled:opacity-50 ${
            isLiked
              ? 'text-red-500 hover:text-red-600'
              : 'text-gray-400 hover:text-red-500'
          }`}
        >
          <svg
            className={`h-5 w-5 transition-transform ${isLiked ? 'scale-110' : ''}`}
            fill={isLiked ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <span>{post.likes}</span>
        </button>
        <span className="text-xs text-gray-400">{timeAgo}</span>
      </div>
    </Card>
  );
}

function getTimeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'الآن';
  if (diffMin < 60) return `منذ ${diffMin} د`;
  if (diffHr < 24) return `منذ ${diffHr} س`;
  if (diffDay < 7) return `منذ ${diffDay} يوم`;
  if (diffDay < 30) return `منذ ${Math.floor(diffDay / 7)} أسبوع`;
  return new Date(dateStr).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function CommunityPage(): JSX.Element {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [page, setPage] = useState(1);
  const [optimisticLikes, setOptimisticLikes] = useState<Record<number, { liked: boolean; count: number }>>({});

  const { data, isLoading, isError, refetch } = api.community.feed.useQuery(
    { page, limit: POSTS_PER_PAGE },
  ) as { data: { posts: Post[]; total: number; hasMore: boolean } | undefined; isLoading: boolean; isError: boolean; refetch: () => void };
  const { data: myLikes } = api.community.myLikes.useQuery() as { data: Set<number> | undefined };
  const createMut = api.community.create.useMutation({
    onSuccess: () => {
      setContent('');
      setPage(1);
      refetch();
    },
  });
  const likeMut = api.community.toggleLike.useMutation();
  const deleteMut = api.community.delete.useMutation({ onSuccess: () => refetch() });

  const currentUserId = user?.id ?? null;
  const totalPages = data ? Math.ceil((data.total || 0) / POSTS_PER_PAGE) : 1;

  const handleToggleLike = useCallback(
    (postId: number): void => {
      const current = optimisticLikes[postId];
      const isCurrentlyLiked = current?.liked ?? myLikes?.has(postId) ?? false;
      const currentCount = current?.count ?? data?.posts?.find((p) => p.id === postId)?.likes ?? 0;

      // Optimistic update
      setOptimisticLikes((prev) => ({
        ...prev,
        [postId]: {
          liked: !isCurrentlyLiked,
          count: isCurrentlyLiked ? Math.max(0, currentCount - 1) : currentCount + 1,
        },
      }));

      likeMut.mutate({ postId }, { onError: () => refetch() });
    },
    [myLikes, data, likeMut, refetch, optimisticLikes],
  );

  const handleDelete = useCallback(
    (postId: number): void => {
      if (!confirm('هل أنتِ متأكدة من حذف هذا المنشور؟')) return;
      deleteMut.mutate({ id: postId });
    },
    [deleteMut],
  );

  const handleSubmit = (): void => {
    const trimmed = content.trim();
    if (!trimmed) return;
    createMut.mutate({ content: trimmed });
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit();
    }
  };

  const posts: Post[] = data?.posts ?? [];
  const hasMore = data?.hasMore ?? false;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">💬 مجتمع الجمال</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            شاركي تجاربكِ، نصائحكِ، وإطلالاتكِ مع مجتمع جالكسي بيوتي
          </p>
        </div>
        {data && (
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500 dark:bg-gray-800">
            {data.total} منشور
          </span>
        )}
      </div>

      {/* Create Post */}
      {user ? (
        <Card padding="md" className="mb-6">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white text-sm font-bold">
              {user.name?.[0] ?? user.email?.[0] ?? '👤'}
            </div>
            <div className="flex-1">
              <textarea
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:placeholder:text-gray-500"
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="شاركي تجربتكِ، نصيحة، أو إطلالتكِ..."
                maxLength={500}
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {content.length}/500 · Ctrl+Enter للنشر
                </span>
                <div className="flex gap-2">
                  {content.trim() && (
                    <button
                      onClick={() => setContent('')}
                      className="rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      إلغاء
                    </button>
                  )}
                  <Button
                    onClick={handleSubmit}
                    loading={createMut.isPending}
                    disabled={!content.trim()}
                    size="sm"
                  >
                    نشر ✨
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <Card padding="lg" className="mb-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            👋 سجّلي الدخول للمشاركة في مجتمع الجمال
          </p>
          <Link href="/login" className="mt-3 inline-block">
            <Button size="sm">تسجيل الدخول</Button>
          </Link>
        </Card>
      )}

      {/* Posts Feed */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }, (_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <ErrorAlert
          message="فشل تحميل المنشورات"
          onRetry={() => refetch()}
        />
      ) : posts.length === 0 ? (
        <EmptyState
          title="لا توجد منشورات بعد"
          description="كوني أول من يشارك في مجتمع الجمال! 🌸"
          action={
            user
              ? { label: 'اكتبي منشوراً', onPress: () => document.querySelector('textarea')?.focus() }
              : undefined
          }
        />
      ) : (
        <>
          <div className="space-y-4">
            {posts.map((post) => {
              const optimistic = optimisticLikes[post.id];
              const displayLikes = optimistic?.count ?? post.likes;
              const displayLiked = optimistic?.liked ?? (myLikes as Set<number>)?.has(post.id) ?? false;

              return (
                <PostCard
                  key={post.id}
                  post={{ ...post, likes: displayLikes }}
                  isLiked={displayLiked}
                  onToggleLike={handleToggleLike}
                  onDelete={handleDelete}
                  likePending={likeMut.isPending}
                  deletePending={deleteMut.isPending}
                  currentUserId={currentUserId}
                />
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}

          {/* Load More (for infinite-scroll style) */}
          {hasMore && totalPages <= 1 && (
            <div className="mt-6 text-center">
              <Button
                onClick={() => setPage((p) => p + 1)}
                loading={isLoading}
                variant="ghost"
                size="sm"
              >
                عرض المزيد
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
