/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/trpc';
import { Button } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLocale } from '@/components/LocaleProvider';
import type { TranslationKey } from '@galaxy/shared';

const TOPICS: {
  key: string;
  emoji: string;
  label: TranslationKey;
  q: TranslationKey;
}[] = [
  { key: 'routine', emoji: '', label: 'beautyAdvisor.topic.routine', q: 'beautyAdvisor.q.routine' },
  { key: 'skin', emoji: '', label: 'beautyAdvisor.topic.skin', q: 'beautyAdvisor.q.skin' },
  { key: 'makeup', emoji: '', label: 'beautyAdvisor.topic.makeup', q: 'beautyAdvisor.q.makeup' },
  { key: 'hair', emoji: '‍️', label: 'beautyAdvisor.topic.hair', q: 'beautyAdvisor.q.hair' },
  { key: 'wedding', emoji: '', label: 'beautyAdvisor.topic.wedding', q: 'beautyAdvisor.q.wedding' },
  { key: 'summer', emoji: '️', label: 'beautyAdvisor.topic.summer', q: 'beautyAdvisor.q.summer' },
];

export default function BeautyAdvisorPage(): JSX.Element {
  const { t } = useLocale();
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
    {
      role: 'assistant',
      content: t('beautyAdvisor.welcome'),
    },
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const askMut = api.aiAssistant.ask.useMutation({
    onSuccess: (aiResponse) => {
      const r = aiResponse as unknown as { answer?: string; message?: string };
      const reply = r.answer ?? r.message ?? t('beautyAdvisor.errorFallback');
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    },
  });
  const isFetching = askMut.isPending;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || isFetching) return;
    setMessages((prev) => [...prev, { role: 'user', content: msg }]);
    setInput('');
    askMut.mutate({ question: msg });
  };

  return (
    <DashboardLayout userRole="CUSTOMER">
      <div className="mx-auto max-w-2xl flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>
        <div>
          <h1 className="text-2xl font-bold">{t('beautyAdvisor.title')}</h1>
          <p className="mt-1 text-sm text-text-secondary">{t('beautyAdvisor.subtitle')}</p>
        </div>

        <div className="flex gap-2 flex-wrap my-3">
          {TOPICS.map((topic) => (
            <button
              key={topic.key}
              onClick={() => handleSend(t(topic.q))}
              className="rounded-full bg-surface-muted hover:bg-brand-100 px-4 py-1.5 text-xs transition-all"
            >
              {topic.emoji} {t(topic.label)}
            </button>
          ))}
        </div>

        <div
          className="flex-1 overflow-y-auto bg-surface rounded-2xl border p-4 mb-3"
          style={{ minHeight: '300px' }}
        >
          <div className="space-y-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${m.role === 'user' ? 'bg-brand-600 text-white rounded-br-md' : 'bg-surface-muted rounded-bl-md'}`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {isFetching && (
              <div className="flex justify-start">
                <div className="bg-surface-muted rounded-2xl rounded-bl-md px-4 py-3 text-sm">
                  {t('beautyAdvisor.typing')}
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>

        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('beautyAdvisor.placeholder')}
            className="flex-1 rounded-xl border px-4 py-3 text-sm dark:border-gray-700 dark:bg-gray-800"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
          />
          <Button onClick={() => handleSend()} loading={isFetching} className="rounded-xl px-6">
            {t('beautyAdvisor.send')}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
