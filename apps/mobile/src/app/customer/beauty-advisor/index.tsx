import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useState, useRef } from 'react';
import { trpc } from '@/lib/trpc-react';

const TOPICS = [
  { key: 'روتين', emoji: '', q: 'كيف أبني روتين عناية يومي؟' },
  { key: 'بشرة', emoji: '', q: 'كيف أحدد نوع بشرتي؟' },
  { key: 'مكياج', emoji: '', q: 'كيف أختار كريم الأساس المناسب؟' },
  { key: 'شعر', emoji: '‍️', q: 'كيف أعتني بشعري حسب نوعه؟' },
  { key: 'زواج', emoji: '', q: 'كيف أخطط لجمالي قبل الزفاف؟' },
  { key: 'صيف', emoji: '️', q: 'كيف أحمي بشرتي في الصيف؟' },
];

export default function BeautyAdvisorScreen(): JSX.Element {
  const scrollRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        ' مرحباً! أنا مجرة الجمال، مستشارة جمالكِ الشخصية. اسأليني أي سؤال عن العناية والتجميل!',
    },
  ]);
  const [input, setInput] = useState('');

  const askMut = trpc.aiAssistant.ask.useMutation({
    onSuccess: (r) => {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: r.answer ?? 'عذراً، لم أستطع الإجابة.' },
      ]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'عذراً، حدث خطأ. حاولي مرة أخرى.' },
      ]);
    },
  });

  const handleSend = (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || askMut.isPending) return;
    setMessages((prev) => [...prev, { role: 'user', content: msg }]);
    setInput('');
    askMut.mutate({ question: msg });
  };

  return (
    <KeyboardAvoidingView style={s.c} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.header}>
        <Text style={s.t}> مجرة الجمال</Text>
        <Text style={s.sub}>مستشارة جمالكِ الشخصية</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.topicsRow}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
      >
        {TOPICS.map((t) => (
          <TouchableOpacity key={t.key} onPress={() => handleSend(t.q)} style={s.topic}>
            <Text style={s.topicText}>
              {t.emoji} {t.key}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        ref={scrollRef}
        style={s.chat}
        contentContainerStyle={s.chatInner}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((m, i) => (
          <View
            key={i}
            style={{ alignItems: m.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 12 }}
          >
            <View style={[s.bubble, m.role === 'user' ? s.userBubble : s.assistantBubble]}>
              <Text
                style={[s.bubbleText, m.role === 'user' ? { color: '#fff' } : { color: '#111827' }]}
              >
                {m.content}
              </Text>
            </View>
          </View>
        ))}
        {askMut.isPending && (
          <View style={{ alignItems: 'flex-start', marginBottom: 12 }}>
            <View style={[s.bubble, s.assistantBubble]}>
              <Text style={[s.bubbleText, { color: '#9ca3af' }]}> جاري الكتابة...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={s.inputRow}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="اكتبي سؤالكِ..."
          style={s.inp}
          placeholderTextColor="#9ca3af"
          onSubmitEditing={() => handleSend()}
        />
        <TouchableOpacity onPress={() => handleSend()} style={s.sendBtn}>
          <Text style={s.sendText}></Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  header: { padding: 16, paddingBottom: 8 },
  t: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center' },
  sub: { fontSize: 13, color: '#6b7280', textAlign: 'center', marginTop: 4 },
  topicsRow: { maxHeight: 44, marginBottom: 8 },
  topic: { backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  topicText: { fontSize: 13, color: '#374151' },
  chat: { flex: 1 },
  chatInner: { padding: 16, paddingBottom: 8 },
  bubble: { maxWidth: '80%', borderRadius: 18, paddingHorizontal: 16, paddingVertical: 10 },
  userBubble: { backgroundColor: '#db2777', borderBottomRightRadius: 4 },
  assistantBubble: { backgroundColor: '#fff', borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 14, lineHeight: 22 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  inp: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 14,
    textAlign: 'right',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#db2777',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendText: { fontSize: 18 },
});
