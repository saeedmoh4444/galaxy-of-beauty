import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';

export default function ChatbotWidget() {
  const { t } = useTranslation();
  const { chatbotOpen, toggleChatbot } = useUIStore();
  const { isAuthenticated } = useAuthStore();
  const [messages, setMessages] = useState([
    { content: 'أهلاً بكِ! 🌸 أنا ليلى، مستشارة التجميل. كيف يمكنني مساعدتكِ اليوم؟', isAi: true },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const chatMutation = useMutation({
    mutationFn: async (message) => {
      const { data } = await api.post('/ai/chat', { message });
      return data.reply;
    },
    onSuccess: (reply) => {
      setMessages((prev) => [...prev, { content: reply, isAi: true }]);
    },
  });

  const sendMessage = () => {
    if (!input.trim() || chatMutation.isPending) return;
    if (!isAuthenticated) {
      setMessages((prev) => [...prev, { content: 'يرجى تسجيل الدخول للتحدث معي! 🌸', isAi: true }]);
      setInput('');
      return;
    }
    setMessages((prev) => [...prev, { content: input, isAi: false }]);
    chatMutation.mutate(input);
    setInput('');
  };

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  return (
    <>
      <button onClick={toggleChatbot}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 active:scale-95 transition-all flex items-center justify-center"
        aria-label={t('ai.chatbotTitle')}>
        {chatbotOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        )}
      </button>

      {chatbotOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="bg-primary-600 text-white px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm">💄</div>
            <div>
              <h3 className="font-semibold text-sm">{t('ai.chatbotTitle')}</h3>
              <p className="text-xs text-white/70">✨ متصلة</p>
            </div>
          </div>

          <div className="h-80 p-4 overflow-y-auto bg-gray-50 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.isAi ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${msg.isAi ? 'bg-white text-gray-700 rounded-tr-none' : 'bg-primary-600 text-white rounded-tl-none'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {chatMutation.isPending && (
              <div className="flex justify-start">
                <div className="bg-white px-4 py-2.5 rounded-2xl rounded-tr-none text-sm text-gray-400">يكتب...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-gray-200">
            <div className="flex gap-2">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={t('ai.chatbotPlaceholder')} className="flex-1 input-field text-sm py-2" />
              <button onClick={sendMessage} disabled={chatMutation.isPending} className="btn-primary text-sm py-2 px-4">إرسال</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
