import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useState } from 'react';
import { BULK_PAGE_SIZE } from '@galaxy/ui';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';
import { useAuthState } from '@/hooks/useAuthState';

interface ChatMessage {
  id?: number;
  senderId?: number;
  message?: string;
  createdAt?: string;
}

export default function ChatScreen(): JSX.Element {
  const isAuthed = useAuthState();
  const { locale, t } = useLocale();
  const [text, setText] = useState('');
  const q = trpc.chat.messages.useQuery(
    { bookingId: 1, page: 1, limit: BULK_PAGE_SIZE },
    { enabled: isAuthed },
  );
  const messages: ChatMessage[] = (q.data?.items ?? []) as unknown as ChatMessage[];

  const sendMut = trpc.chat.send.useMutation({
    onSuccess: () => {
      setText('');
      void q.refetch();
    },
  });

  const send = () => {
    if (!text.trim()) return;
    sendMut.mutate({ receiverId: 1, bookingId: 1, content: text.trim() });
  };

  if (q.isLoading || q.isRefetching)
    return <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} size="large" />;

  return (
    <View style={styles.c}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.i}>
        <Text style={styles.t}>{t('chat.title')}</Text>
        {messages.length === 0 ? (
          <Text style={styles.e}>{t('chat.empty')}</Text>
        ) : (
          messages.map((m) => (
            <View
              key={m.id}
              style={[styles.msg, m.senderId === 1 ? styles.msgSent : styles.msgReceived]}
            >
              <Text style={styles.msgText}>{m.message}</Text>
              <Text style={styles.msgTime}>
                {new Date(m.createdAt ?? '').toLocaleTimeString(
                  locale === 'ar' ? 'ar-SA' : 'en-US',
                  {
                    hour: '2-digit',
                    minute: '2-digit',
                  },
                )}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
      <View style={styles.inputRow}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={t('chat.placeholder')}
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
