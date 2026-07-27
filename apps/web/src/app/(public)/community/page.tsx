'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, Button } from '@galaxy/shared';

export default function CommunityPage(): JSX.Element {
  const [content, setContent] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, isLoading, refetch } = api.community.feed.useQuery({ page: 1, limit: 20 }) as any;
  const createMut = api.community.create.useMutation({ onSuccess: () => { refetch(); setContent(''); } });
  const likeMut = api.community.toggleLike.useMutation({ onSuccess: () => refetch() });
  const posts = (data ?? []) as Array<Record<string, any>>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">💬 مجتمع الجمال</h1>
      <Card padding="md" className="mb-6">
        <textarea className="w-full rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-700 dark:bg-gray-800" rows={3} value={content} onChange={(e) => setContent(e.target.value)} placeholder="شاركي تجربتكِ، نصيحة، أو إطلالتكِ..." />
        <div className="mt-2 flex justify-end">
          <Button onClick={() => { if (content.trim()) createMut.mutate({ content: content.trim() }); }} loading={createMut.isPending} size="sm">نشر</Button>
        </div>
      </Card>
      {isLoading ? <div className="space-y-4">{Array.from({ length: 5 }, (_, i) => <CardSkeleton key={i} />)}</div> : (
        <div className="space-y-4">
          {posts.map((p: Record<string, any>) => (
            <Card key={p.id} padding="md">
              <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{p.content}</p>
              {p.imageUrl && <img src={p.imageUrl} alt="" className="mt-3 rounded-xl max-h-64 object-cover" />}
              <div className="mt-3 flex items-center gap-4">
                <button onClick={() => likeMut.mutate({ postId: p.id })} className={`flex items-center gap-1 text-sm ${p.likes > 0 ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}>❤️ {p.likes || 0}</button>
                <span className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString('ar-SA')}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
