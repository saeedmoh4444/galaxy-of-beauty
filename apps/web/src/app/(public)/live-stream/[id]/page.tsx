'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/trpc';
import { CardSkeleton, ErrorAlert, Button } from '@galaxy/ui';
import { useAuth } from '@galaxy/ui';
import { Breadcrumbs } from '@/components/Breadcrumbs';

export default function LiveStreamDetailPage(): JSX.Element {
  const { id } = useParams();
  const { user } = useAuth();
  const streamId = parseInt(id as string, 10);
  const chatRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState('');

  const { data: stream, isLoading, isError, refetch } = (api as any).liveStream.get.useQuery({ id: streamId }, { enabled: !isNaN(streamId) }) as {
    data: Record<string, unknown> | null | undefined; isLoading: boolean; isError: boolean; refetch: () => void;
  };
  const { data: chat, refetch: refetchChat } = (api as any).liveStream.chat.useQuery({ streamId }, { enabled: !isNaN(streamId), refetchInterval: 3000 }) as {
    data: Array<Record<string, unknown>> | undefined; refetch: () => void;
  };
  const sendMut = (api as any).liveStream.sendMessage.useMutation({ onSuccess: () => { setMessage(''); refetchChat(); } });

  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [chat]);

  if (isNaN(streamId)) return <div className="py-24 text-center"><ErrorAlert message="معرف غير صالح" /></div>;
  if (isLoading) return <div className="py-24"><CardSkeleton /></div>;
  if (isError || !stream) return <div className="py-24 text-center"><ErrorAlert message="فشل تحميل البث" onRetry={() => refetch()} /><Link href="/live-stream"><Button size="sm" className="mt-4">العودة للبثوث</Button></Link></div>;

  const isLive = (stream.isLive as boolean) ?? false;

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col">
      <div className="px-4 pt-4"><Breadcrumbs items={[{ label: 'البث المباشر', href: '/live-stream' }, { label: stream.titleAr as string }]} /></div>
      <div className="flex flex-1 flex-col lg:flex-row">
      {/* Video Player */}
      <div className="flex-1 bg-black flex items-center justify-center">
        {stream.streamUrl ? (
          <iframe src={stream.streamUrl as string} className="h-full w-full" allow="autoplay; fullscreen" allowFullScreen title={stream.titleAr as string} />
        ) : (
          <div className="text-center text-white/40"><span className="text-8xl">🎥</span><p className="mt-4">انتظري بدء البث...</p></div>
        )}
      </div>

      {/* Chat Sidebar */}
      <div className="flex w-full flex-col border-t border-gray-200 dark:border-gray-800 lg:w-80 lg:border-l lg:border-t-0">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-2">
            {isLive && <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />}
            <h2 className="font-bold text-sm">{isLive ? '🔴 مباشر' : '📅 قادم'}</h2>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{stream.technicianName as string}</p>
          {isLive && <p className="text-xs text-gray-400 mt-0.5">{stream.viewerCount as number} مشاهد</p>}
        </div>

        {/* Messages */}
        <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-2">
          {!chat || chat.length === 0 ? (
            <p className="text-center text-xs text-gray-400 py-8">لا توجد رسائل بعد — كوني أول المتحدثات!</p>
          ) : (
            chat.map((m: Record<string, unknown>) => (
              <div key={m.id as number} className="text-sm">
                <span className="font-bold text-brand-600 text-xs">{m.userName as string}</span>
                <span className="text-gray-400 text-[10px] ml-1">{new Date(m.createdAt as string).toLocaleTimeString('ar-SA', {hour:'2-digit',minute:'2-digit'})}</span>
                <p className="text-gray-700 dark:text-gray-300">{m.message as string}</p>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        {isLive && (
          <div className="border-t border-gray-200 dark:border-gray-800 p-3">
            {user ? (
              <div className="flex gap-2">
                <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && message.trim()) sendMut.mutate({ streamId, message: message.trim() }); }} placeholder="اكتبي رسالة..." maxLength={300} className="flex-1 rounded-lg border px-3 py-2 text-xs dark:border-gray-700 dark:bg-gray-800" />
                <Button size="sm" onClick={() => { if (message.trim()) sendMut.mutate({ streamId, message: message.trim() }); }} loading={sendMut.isPending}>إرسال</Button>
              </div>
            ) : (
              <Link href="/login"><Button size="sm" variant="ghost" className="w-full text-xs">سجّلي دخول للدردشة</Button></Link>
            )}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
