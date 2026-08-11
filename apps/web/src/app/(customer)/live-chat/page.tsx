'use client';
import { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/trpc';
import { Card, Button } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function LiveChatPage(): JSX.Element {
  const [msg, setMsg] = useState('');
  const { data: history, refetch } = api.liveChat.history.useQuery() as {
    data: Array<Record<string, unknown>> | undefined;
    refetch: () => void;
  };
  const sendMut = api.liveChat.send.useMutation({
    onSuccess: () => {
      setMsg('');
      refetch();
    },
  });
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const msgs = history ?? [];

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-2xl space-y-4">
        <div>
          <h1 className="text-2xl font-bold">💬 الدعم المباشر</h1>
          <p className="mt-1 text-sm text-text-secondary">تحدثي مع فريق الدعم مباشرة</p>
        </div>
        <Card padding="md" className="h-[60vh] flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-3 p-2">
            {msgs.map((m: Record<string, unknown>) => (
              <div
                key={m.id as number}
                className={`flex ${m.isAgent ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${m.isAgent ? 'bg-surface-muted dark:bg-gray-800 rounded-tl-none' : 'bg-brand-600 text-white rounded-tr-none'}`}
                >
                  <p>{m.message as string}</p>
                  <p
                    className={`text-[10px] mt-1 ${m.isAgent ? 'text-text-tertiary' : 'text-white/60'}`}
                  >
                    {m.userName as string} ·{' '}
                    {new Date(m.createdAt as string).toLocaleTimeString('ar-SA', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div className="flex gap-2 mt-3 pt-3 border-t dark:border-gray-700">
            <input
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              onKeyDown={(e) =>
                e.key === 'Enter' && msg.trim() && sendMut.mutate({ message: msg.trim() })
              }
              placeholder="اكتبي رسالتك..."
              className="flex-1 rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
            <Button
              onClick={() => msg.trim() && sendMut.mutate({ message: msg.trim() })}
              loading={sendMut.isPending}
            >
              إرسال
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
