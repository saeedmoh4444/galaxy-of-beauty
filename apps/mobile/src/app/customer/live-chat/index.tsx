import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';
import { trpc, typedTrpc } from '@/lib/trpc-react';

interface ChatMessage {
  message?: string;
  userName?: string;
  isAgent?: boolean;
}

export default function LiveChatScreen() {
  const [msg, setMsg] = useState('');
  const { data, refetch } = trpc.liveChat.history.useQuery() as {
    data?: ChatMessage[];
    refetch: () => void;
  };
  const messages = data ?? [];

  const send = () => {
    if (!msg.trim()) return;
    (typedTrpc().liveChat.send.mutate({ message: msg.trim() }) as Promise<unknown>).then(() => {
      setMsg('');
      refetch();
    });
  };

  return (
    <View style={styles.c}>
      <Text style={styles.t}> الدعم المباشر</Text>
      <ScrollView style={styles.list} contentContainerStyle={{ padding: 12, paddingBottom: 8 }}>
        {messages.map((m, i) => (
          <View key={i} style={[styles.bubble, m.isAgent ? styles.agent : styles.user]}>
            <Text style={[styles.bubbleText, m.isAgent ? styles.agentText : styles.userText]}>
              {m.message ?? ''}
            </Text>
            <Text style={styles.bubbleTime}>{m.userName ?? ''}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={msg}
          onChangeText={setMsg}
          onSubmitEditing={send}
          placeholder="اكتبي..."
          textAlign="right"
        />
        <TouchableOpacity style={styles.sendBtn} onPress={send}>
          <Text style={styles.sendText}>إرسال</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fff' },
  t: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  list: { flex: 1 },
  bubble: { maxWidth: '80%', borderRadius: 14, padding: 10, marginBottom: 8 },
  agent: { alignSelf: 'flex-start', backgroundColor: '#f3f4f6' },
  user: { alignSelf: 'flex-end', backgroundColor: '#7c3aed' },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  agentText: { color: '#111827' },
  userText: { color: '#fff' },
  bubbleTime: { fontSize: 10, marginTop: 4 },
  inputRow: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 10,
    fontSize: 14,
  },
  sendBtn: {
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  sendText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
