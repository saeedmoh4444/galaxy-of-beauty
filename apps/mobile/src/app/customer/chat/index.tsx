import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { BULK_PAGE_SIZE } from '@galaxy/ui';
import { typedTrpc } from '@/lib/trpc-react';

export default function ChatScreen(): JSX.Element {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');

  const fetch = useCallback(() => {
    setLoading(true);
    (typedTrpc().chat.messages.query({ bookingId: 1, page: 1, limit: BULK_PAGE_SIZE }) as any)
      .then((d: any) => {
        setMessages(d?.items || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const send = () => {
    if (!text.trim()) return;
    (
      typedTrpc().chat.send.mutate({ receiverId: 1, bookingId: 1, message: text.trim() }) as any
    ).then(() => {
      setText('');
      fetch();
    });
  };

  if (loading) return <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} size="large" />;

  return (
    <View style={styles.c}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.i}>
        <Text style={styles.t}> المحادثات</Text>
        {messages.length === 0 ? (
          <Text style={styles.e}>لا توجد رسائل</Text>
        ) : (
          messages.map((m) => (
            <View
              key={m.id}
              style={[styles.msg, m.senderId === 1 ? styles.msgSent : styles.msgReceived]}
            >
              <Text style={styles.msgText}>{m.message as string}</Text>
              <Text style={styles.msgTime}>
                {new Date(m.createdAt as string).toLocaleTimeString('ar-SA', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
      <View style={styles.inputRow}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="اكتبي رسالة..."
          style={styles.input}
          placeholderTextColor="#9ca3af"
        />
        <TouchableOpacity onPress={send} style={styles.sendBtn}>
          <Text style={styles.sendBtnText}></Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 20 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  msg: { maxWidth: '80%', borderRadius: 16, padding: 12, marginBottom: 8 },
  msgSent: { alignSelf: 'flex-end', backgroundColor: '#7c3aed' },
  msgReceived: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  msgText: { fontSize: 14, color: '#111827' },
  msgTime: { fontSize: 10, color: '#9ca3af', marginTop: 4, textAlign: 'right' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  sendBtn: {
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnText: { fontSize: 18 },
});
