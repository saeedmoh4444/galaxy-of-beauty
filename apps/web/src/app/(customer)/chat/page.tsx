'use client';
import { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, Button , ErrorAlert } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function ChatPage(): JSX.Element {
  const { data: conversations, isLoading: convLoading } = api.chat.conversations.useQuery() as { data: Array<Record<string,unknown>> | undefined; isLoading: boolean; isError: boolean; refetch: () => void };
  const sendMut = api.chat.send.useMutation();
  const [selectedConv, setSelectedConv] = useState<number | null>(null);
  const { data: messages, isLoading: msgLoading } = api.chat.messages.useQuery({ bookingId: selectedConv ?? 0 }, { enabled: !!selectedConv }) as { data: Array<Record<string,unknown>> | undefined; isLoading: boolean; isError: boolean; refetch: () => void };
  const [content, setContent] = useState('');
  const convs = conversations ?? [];
  const msgs = messages ?? [];
  const selectedMsgs = msgs.filter((m: Record<string,unknown>) => {
    if (!selectedConv) return false;
    return m.bookingId === selectedConv || m.senderId === selectedConv || m.receiverId === selectedConv;
  });

  const handleSend = (receiverId: number, bookingId?: number) => {
    if (!content.trim()) return;
    sendMut.mutate({ receiverId, bookingId, content: content.trim() }, { onSuccess: () => setContent('') });
  };

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-5xl space-y-6">
        <div><h1 className="text-2xl font-bold">💬 المحادثات</h1><p className="mt-1 text-sm text-gray-500">تواصلي مع الفنيات مباشرة</p></div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card padding="lg" className="lg:col-span-1">
            <h3 className="font-bold mb-3">📋 المحادثات النشطة</h3>
            {convLoading ? <CardSkeleton/> : convs.length === 0 ? <p className="text-sm text-gray-400">لا توجد محادثات</p> :
              <div className="space-y-1">{convs.map((c: Record<string,unknown>) => {
                const other = c.otherParty as Record<string,unknown> | undefined;
                return (
                  <button key={c.bookingId as number} onClick={() => setSelectedConv(c.bookingId as number)} className={`w-full rounded-lg p-3 text-right transition-all ${selectedConv===c.bookingId?'bg-brand-50 border-l-4 border-brand-600':'hover:bg-gray-50'}`}>
                    <p className="font-bold text-sm">{other?.name as string ?? 'محادثة'}</p>
                    <p className="text-xs text-gray-500">{c.bookingCode as string}</p>
                  </button>
                );
              })}</div>
            }
          </Card>

          <Card padding="lg" className="lg:col-span-2 flex flex-col min-h-[400px]">
            {!selectedConv ? <p className="text-sm text-gray-400 text-center py-16">اختاري محادثة من القائمة</p> :
              <>
                <div className="flex-1 space-y-3 overflow-y-auto max-h-[500px] mb-4">
                  {msgLoading ? <CardSkeleton/> : selectedMsgs.length === 0 ? <p className="text-sm text-gray-400 text-center">لا توجد رسائل</p> :
                    selectedMsgs.map((m: Record<string,unknown>) => {
                      const sender = m.sender as Record<string,unknown> | undefined;
                      return (
                        <div key={m.id as number} className={`flex ${sender?.id === (m as any).currentUserId ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] rounded-xl p-3 ${sender?.id === (m as any).currentUserId ? 'bg-brand-600 text-white' : 'bg-gray-100'}`}>
                            <p className="text-sm">{m.content as string}</p>
                            <p className="text-xs opacity-70 mt-1">{new Date(m.createdAt as string).toLocaleTimeString('ar-SA', {hour:'2-digit', minute:'2-digit'})}</p>
                          </div>
                        </div>
                      );
                    })
                  }
                </div>
                <div className="flex gap-2">
                  <input value={content} onChange={e => setContent(e.target.value)} placeholder="اكتبي رسالتكِ..." className="flex-1 rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" onKeyDown={e => { if (e.key === 'Enter' && content.trim()) { const conv = convs.find(c => c.bookingId === selectedConv); if (conv) handleSend((conv.otherParty as Record<string,unknown>)?.id as number, selectedConv); } }} />
                  <Button onClick={() => { const conv = convs.find(c => c.bookingId === selectedConv); if (conv) handleSend((conv.otherParty as Record<string,unknown>)?.id as number, selectedConv); }} loading={sendMut.isPending}>📤</Button>
                </div>
              </>
            }
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
