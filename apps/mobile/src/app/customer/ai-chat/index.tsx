import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useRef } from 'react';

export default function AiChatScreen() {
  const [messages, setMessages] = useState<{ id: string; role: string; content: string; time: string }[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    const userMsg = { id: Date.now().toString(), role: 'user', content: text, time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);
    try {
      const res = await (trpc.ai.chat as any).mutate({ message: text }) as Record<string, unknown>;
      const reply = { id: (Date.now() + 1).toString(), role: 'assistant', content: (res.response ?? res.message ?? '') as string, time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) };
      setMessages((prev) => [...prev, reply]);
    } catch { setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: 'عذراً، حدث خطأ. حاولي مرة أخرى.', time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) }]); }
    finally { setSending(false); }
  };

  return (
    <View style={styles.container}>
      <View style={styles.chatHeader}>
        <Text style={styles.avatar}>🌸</Text>
        <View>
          <Text style={styles.chatTitle}>لايلى</Text>
          <Text style={styles.chatSub}>مستشارة التجميل الذكية</Text>
        </View>
      </View>

      <ScrollView style={styles.messages} ref={scrollRef} onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
        {messages.length === 0 && (
          <View style={styles.centered}>
            <Text style={styles.emptyIcon}>🌸</Text>
            <Text style={styles.empty}>مرحباً بك في لايلى!</Text>
            <Text style={styles.hint}>أنا مستشارة التجميل الذكية، اسأليني عن أي شيء</Text>
          </View>
        )}
        {messages.map((m) => (
          <View key={m.id} style={[styles.msgRow, m.role === 'user' ? styles.msgUser : styles.msgAssistant]}>
            <View style={[styles.msgBubble, m.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant]}>
              {m.role === 'assistant' && <Text style={styles.assistantLabel}>لايلى</Text>}
              <Text style={[styles.msgText, m.role === 'user' && { color: '#fff' }]}>{m.content}</Text>
              <Text style={[styles.msgTime, m.role === 'user' && { color: 'rgba(255,255,255,0.6)' }]}>{m.time}</Text>
            </View>
          </View>
        ))}
        {sending && (
          <View style={styles.msgAssistant}>
            <View style={styles.bubbleAssistant}>
              <Text style={styles.assistantLabel}>لايلى</Text>
              <ActivityIndicator color="#7c3aed" size="small" />
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="اكتب رسالتك..."
          value={input}
          onChangeText={setInput}
          multiline
          textAlignVertical="center"
        />
        <TouchableOpacity style={[styles.sendBtn, (!input.trim() || sending) && { opacity: 0.5 }]} onPress={handleSend} disabled={!input.trim() || sending}>
          <Text style={styles.sendText}>إرسال</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  chatHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', gap: 12 },
  avatar: { fontSize: 36 },
  chatTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  chatSub: { fontSize: 12, color: '#7c3aed' },
  messages: { flex: 1, padding: 16 },
  centered: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 64, marginBottom: 12 },
  empty: { fontSize: 18, fontWeight: '700', color: '#111827' },
  hint: { fontSize: 14, color: '#9ca3af', marginTop: 4, textAlign: 'center' },
  msgRow: { marginBottom: 12 },
  msgUser: { alignItems: 'flex-end' },
  msgAssistant: { alignItems: 'flex-start' },
  msgBubble: { maxWidth: '80%', borderRadius: 16, padding: 12 },
  bubbleUser: { backgroundColor: '#7c3aed', borderBottomRightRadius: 4 },
  bubbleAssistant: { backgroundColor: '#f5f3ff', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#e9d5ff' },
  assistantLabel: { fontSize: 11, fontWeight: '600', color: '#7c3aed', marginBottom: 4 },
  msgText: { fontSize: 14, color: '#374151', lineHeight: 20 },
  msgTime: { fontSize: 10, color: '#9ca3af', marginTop: 4, textAlign: 'left' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb', gap: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, maxHeight: 100, backgroundColor: '#f9fafb', textAlign: 'right' },
  sendBtn: { backgroundColor: '#7c3aed', borderRadius: 16, paddingHorizontal: 20, paddingVertical: 12 },
  sendText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
