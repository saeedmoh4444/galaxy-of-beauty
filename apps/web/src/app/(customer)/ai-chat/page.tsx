'use client';

import { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardSkeleton, ErrorAlert, EmptyState, Button } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const LAYLA_AVATAR = '🌸';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export default function AiChatPage(): JSX.Element {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMut = api.ai.chat.useMutation({
    onSuccess: (res) => {
      const reply = res as unknown as Record<string, unknown>;
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'assistant', content: (reply.response as string) ?? (reply.message as string) ?? '', createdAt: new Date().toISOString() },
      ]);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || sendMut.isPending) return;
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: trimmed, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    sendMut.mutate({ message: trimmed });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto flex h-[calc(100vh-12rem)] max-w-3xl flex-col">
        <div className="flex items-center gap-3 border-b border-gray-200 pb-4 dark:border-gray-700">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-2xl dark:bg-purple-900">
            {LAYLA_AVATAR}
          </div>
          <div>
            <h1 className="text-xl font-bold">لايلى</h1>
            <p className="text-xs text-purple-600 dark:text-purple-400">مستشارة التجميل الذكية</p>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto py-4">
          {sendMut.isPending && messages.length === 0 ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                  <div className={`w-2/3 space-y-2 ${i % 2 === 0 ? 'pr-8' : 'pl-8'}`}>
                    <CardSkeleton />
                    <CardSkeleton />
                  </div>
                </div>
              ))}
            </div>
          ) : messages.length === 0 && !sendMut.isPending ? (
            <div className="flex flex-col items-center justify-center pt-16 text-center">
              <div className="mb-4 text-6xl">{LAYLA_AVATAR}</div>
              <EmptyState
                title="مرحباً بك في لايلى!"
                description="أنا مستشارة التجميل الذكية، يمكنني مساعدتك في اختيار الخدمات المناسبة، نصائح العناية، وأجوبة على استفساراتك"
              />
              <p className="mt-4 text-sm text-purple-500">اسأليني عن أي شيء يخص التجميل والعناية</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'rounded-br-md bg-brand-600 text-white'
                    : 'rounded-bl-md border border-purple-200 bg-purple-50 text-gray-800 dark:border-purple-800 dark:bg-purple-900/30 dark:text-gray-200'
                }`}>
                  {msg.role === 'assistant' && <span className="mb-1 block text-xs font-medium text-purple-500">لايلى</span>}
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                  <p className={`mt-1 text-[10px] ${msg.role === 'user' ? 'text-white/60' : 'text-gray-400'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
          )}
          {sendMut.isPending && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl rounded-bl-md border border-purple-200 bg-purple-50 px-4 py-3 dark:border-purple-800 dark:bg-purple-900/30">
                <span className="mb-1 block text-xs font-medium text-purple-500">لايلى</span>
                <span className="text-sm text-gray-500">...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
          <div className="flex gap-2">
            <textarea
              className="flex-1 resize-none rounded-xl border border-gray-300 bg-white p-3 text-sm outline-none focus:border-purple-400 dark:border-gray-600 dark:bg-gray-800"
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="اكتب رسالتك هنا..."
              disabled={sendMut.isPending}
            />
            <Button
              className="self-end bg-purple-600 hover:bg-purple-700"
              onClick={handleSend}
              disabled={!input.trim() || sendMut.isPending}
              loading={sendMut.isPending}
            >
              إرسال
            </Button>
          </div>
          <p className="mt-1 text-[10px] text-gray-400">اضغط Enter للإرسال | Shift+Enter لسطر جديد</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
