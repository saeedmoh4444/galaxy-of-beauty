'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, Button } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function CommunityPage(): JSX.Element {
  const { data: feedData, isLoading } = api.community.feed.useQuery({ page: 1, limit: 20 }) as { data: Record<string,unknown> | undefined; isLoading: boolean };
  const { data: myLikes } = api.community.myLikes.useQuery() as { data: Array<Record<string,unknown>> | undefined };
  const { data: trending } = api.community.trending.useQuery() as { data: Array<Record<string,unknown>> | undefined };
  const createMut = api.community.create.useMutation();
  const likeMut = api.community.toggleLike.useMutation();
  const commentMut = api.community.addComment.useMutation();
  const deleteMut = api.community.delete.useMutation();
  const [content, setContent] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [commentPostId, setCommentPostId] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');
  const likedIds = new Set((myLikes ?? []).map((l: Record<string,unknown>) => l.postId as number));
  const posts = (feedData?.items as Array<Record<string,unknown>>) ?? [];

  const handleLike = (postId: number) => { likeMut.mutate({ postId }); };
  const handleComment = () => { if (commentPostId && commentText.trim()) { commentMut.mutate({ postId: commentPostId, content: commentText.trim() }, { onSuccess: () => { setCommentText(''); setCommentPostId(null); } }); } };

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold">💖 مجتمع الجمال</h1><p className="mt-1 text-sm text-gray-500">شاركي تجاربكِ وآرائكِ مع المجتمع</p></div>
          <Button onClick={() => setShowCreate(!showCreate)}>{showCreate ? '✕' : '+ منشور'}</Button>
        </div>

        {showCreate && <Card padding="lg">
          <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="شاركي تجربتكِ أو نصيحة تجميلية..." rows={3} className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />
          <Button onClick={() => { if(content.trim()) createMut.mutate({ content: content.trim() }, { onSuccess: () => { setContent(''); setShowCreate(false); } }); }} loading={createMut.isPending} className="w-full mt-3">📤 نشر</Button>
        </Card>}

        {(trending as Array<Record<string,unknown>>)?.length > 0 && (
          <Card padding="lg"><h3 className="font-bold mb-2">🔥 الأكثر تفاعلاً هذا الأسبوع</h3>
            <div className="flex gap-2 overflow-x-auto pb-2">{(trending as Array<Record<string,unknown>>).slice(0,5).map((p: Record<string,unknown>) => (
              <div key={p.id as number} className="bg-amber-50 rounded-xl px-4 py-3 text-center min-w-[100px]"><p className="text-2xl">💖</p><p className="text-xs font-bold mt-1 line-clamp-1">{(p.user as any)?.name}</p><p className="text-xs text-amber-600">❤️ {p.likes as number}</p></div>
            ))}</div>
          </Card>
        )}

        {isLoading ? <div className="space-y-4">{Array.from({length:3},(_,i)=><CardSkeleton key={i}/>)}</div> :
          posts.length === 0 ? <Card padding="lg" className="text-center py-8"><p className="text-4xl mb-2">💖</p><p className="text-gray-500">كوني أول من يشارك في المجتمع</p></Card> :
          <div className="space-y-4">{posts.map((p: Record<string,unknown>) => {
            const user = p.user as Record<string,unknown> | undefined;
            const isLiked = likedIds.has(p.id as number);
            const commentCount = (p._count as Record<string,number>)?.comments ?? 0;
            return (
              <Card key={p.id as number} padding="lg">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">👩‍🎨</span>
                  <div><p className="font-bold text-sm">{user?.name as string ?? 'مستخدمة'}</p><p className="text-xs text-gray-400">{new Date(p.createdAt as string).toLocaleDateString('ar-SA', {day:'numeric', month:'long', hour:'2-digit', minute:'2-digit'})}</p></div>
                </div>
                <p className="text-sm text-gray-700 mb-3">{p.content as string}</p>
                <div className="flex gap-4 text-sm">
                  <button onClick={() => handleLike(p.id as number)} className={`flex items-center gap-1 ${isLiked ? 'text-red-500 font-bold' : 'text-gray-400'}`}>{isLiked ? '❤️' : '🤍'} {p.likes as number}</button>
                  <button onClick={() => setCommentPostId(commentPostId === p.id ? null : p.id as number)} className="text-gray-400">💬 {commentCount}</button>
                  <button onClick={() => deleteMut.mutate({ id: p.id as number })} className="text-gray-400 mr-auto">🗑</button>
                </div>
                {commentPostId === p.id && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex gap-2"><input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="أضيفي تعليق..." className="flex-1 rounded-lg border px-3 py-1.5 text-xs dark:border-gray-700 dark:bg-gray-800" /><Button size="sm" onClick={handleComment} loading={commentMut.isPending}>تعليق</Button></div>
                  </div>
                )}
              </Card>
            );
          })}</div>
        }
      </div>
    </DashboardLayout>
  );
}
