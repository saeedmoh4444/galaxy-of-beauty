/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/trpc';
import { Button } from '@galaxy/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const TOPICS = [
  { key: 'روتين', emoji: '🧴', q: 'كيف أبني روتين عناية يومي؟' },
  { key: 'بشرة', emoji: '✨', q: 'كيف أحدد نوع بشرتي؟' },
  { key: 'مكياج', emoji: '💄', q: 'كيف أختار كريم الأساس المناسب؟' },
  { key: 'شعر', emoji: '💇‍♀️', q: 'كيف أعتني بشعري حسب نوعه؟' },
  { key: 'زواج', emoji: '👰', q: 'كيف أخطط لجمالي قبل الزفاف؟' },
  { key: 'صيف', emoji: '☀️', q: 'كيف أحمي بشرتي في الصيف؟' },
];

export default function BeautyAdvisorPage(): JSX.Element {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
    {
      role: 'assistant',
      content:
        '👋 مرحباً! أنا ليلى، مستشارة جمالكِ الشخصية. اسأليني أي سؤال عن العناية بالبشرة، المكياج، الشعر، أو أي نصيحة تجميلية!',
    },
  ]);
  const [input, setInput] = useState('');
  const [question, setQuestion] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { data: aiResponse, isFetching } = api.aiAssistant.ask.useQuery(
    { question },
    { enabled: !!question },
  ) as { data: Record<string, unknown> | undefined; isFetching: boolean };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  useEffect(() => {
    if (aiResponse && question) {
      const reply =
        (aiResponse.answer as string) ?? (aiResponse as any).message ?? 'عذراً، لم أستطع الإجابة.';
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
      setQuestion('');
    }
  }, [aiResponse, question]);

  const handleSend = (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || isFetching) return;
    setMessages((prev) => [...prev, { role: 'user', content: msg }]);
    setInput('');
    setQuestion(msg);
  };

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-2xl flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>
        <div>
          <h1 className="text-2xl font-bold">🤖 ليلى — مستشارة جمالكِ</h1>
          <p className="mt-1 text-sm text-text-secondary">اسأليني عن أي شيء يخص العناية والتجميل</p>
        </div>

        <div className="flex gap-2 flex-wrap my-3">
          {TOPICS.map((t) => (
            <button
              key={t.key}
              onClick={() => handleSend(t.q)}
              className="rounded-full bg-surface-muted hover:bg-brand-100 px-4 py-1.5 text-xs transition-all"
            >
              {t.emoji} {t.key}
            </button>
          ))}
        </div>

        <div
          className="flex-1 overflow-y-auto bg-white rounded-2xl border p-4 mb-3"
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
                  💭 جاري الكتابة...
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
            placeholder="اكتبي سؤالكِ..."
            className="flex-1 rounded-xl border px-4 py-3 text-sm dark:border-gray-700 dark:bg-gray-800"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
          />
          <Button onClick={() => handleSend()} loading={isFetching} className="rounded-xl px-6">
            📤
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
