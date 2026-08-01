'use client';
import { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/trpc';
import { Card, Button } from '@galaxy/shared';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

interface Message { role: 'user' | 'assistant'; content: string }

const TOPICS = [
  { key: 'روتين', emoji: '🧴', q: 'كيف أبني روتين عناية يومي؟' },
  { key: 'بشرة', emoji: '✨', q: 'كيف أحدد نوع بشرتي؟' },
  { key: 'مكياج', emoji: '💄', q: 'كيف أختار كريم الأساس المناسب؟' },
  { key: 'شعر', emoji: '💇‍♀️', q: 'كيف أعتني بشعري حسب نوعه؟' },
  { key: 'زواج', emoji: '👰', q: 'كيف أخطط لجمالي قبل الزفاف؟' },
  { key: 'صيف', emoji: '☀️', q: 'كيف أحمي بشرتي في الصيف؟' },
];

export default function BeautyAdvisorPage(): JSX.Element {
  const askMut = api.aiAssistant.ask.useMutation();
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', content: '👋 مرحباً! أنا ليلى، مستشارة جمالكِ الشخصية. اسأليني أي سؤال عن العناية بالبشرة، المكياج، الشعر، أو أي نصيحة تجميلية!' }]);
  const [input, setInput] = useState('');
  const [activeTopic, setActiveTopic] = useState<string|null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || askMut.isPending) return;
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setInput('');
    askMut.mutate({ question: msg }, { onSuccess: (r) => {
      const reply = (r as Record<string,unknown>).answer as string ?? (r as Record<string,unknown>).message as string ?? 'عذراً، لم أستطع الإجابة. حاولي مرة أخرى.';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    }});
  };

  return (
    <DashboardLayout role="CUSTOMER">
      <div className="mx-auto max-w-2xl space-y-4" style={{height:'calc(100vh - 120px)'}}>
        <div><h1 className="text-2xl font-bold">🤖 ليلى — مستشارة جمالكِ</h1><p className="mt-1 text-sm text-gray-500">اسأليني عن أي شيء يخص العناية والتجميل</p></div>

        <div className="flex gap-2 flex-wrap">
          {TOPICS.map(t => (
            <button key={t.key} onClick={() => { setActiveTopic(t.key); handleSend(t.q); }} className={`rounded-full px-4 py-1.5 text-xs transition-all ${activeTopic===t.key?'bg-brand-600 text-white':'bg-gray-100 hover:bg-brand-100'}`}>{t.emoji} {t.key}</button>
          ))}
        </div>

        <Card padding="md" className="flex-1 overflow-y-auto" style={{minHeight:'300px'}}>
          <div className="space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role==='user'?'justify-end':'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${m.role==='user'?'bg-brand-600 text-white rounded-br-md':'bg-gray-100 rounded-bl-md'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {askMut.isPending && <div className="flex justify-start"><div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3 text-sm">💭 جاري الكتابة...</div></div>}
            <div ref={chatEndRef} />
          </div>
        </Card>

        <div className="flex gap-2">
          <input value={input} onChange={e => setInput(e.target.value)} placeholder="اكتبي سؤالكِ..." className="flex-1 rounded-xl border px-4 py-3 text-sm dark:border-gray-700 dark:bg-gray-800" onKeyDown={e => { if (e.key==='Enter') handleSend(); }} />
          <Button onClick={() => handleSend()} loading={askMut.isPending} className="rounded-xl px-6">📤</Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
