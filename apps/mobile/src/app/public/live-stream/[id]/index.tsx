import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { SkeletonList } from '@/components/SkeletonCard';
import { useAuthState } from '@/hooks/useAuthState';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface StreamDetail {
  titleAr?: string;
  title?: string;
  host?: string;
  viewers?: number;
}

interface StreamMessage {
  id?: number;
  user?: string;
  text?: string;
}

export default function LiveStreamDetailScreen(): JSX.Element {
  const { t } = useLocale();
  const isAuthed = useAuthState();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [chatText, setChatText] = useState('');

  const upcomingQ = trpc.liveStream.upcoming.useQuery({});
  const historyQ = trpc.liveChat.history.useQuery(undefined, { enabled: isAuthed });

  const sendMut = trpc.liveChat.send.useMutation({
    onSuccess: () => setChatText(''),
  });

  const stream =
    ((upcomingQ.data as unknown as Array<StreamDetail & { id?: number }> | undefined) ?? []).find(
      (x) => x.id === parseInt(id, 10),
    ) ?? null;
  const messages: StreamMessage[] = (
    (historyQ.data ?? []) as unknown as Array<{ id?: number; userName?: string; message?: string }>
  ).map((msg) => ({ id: msg.id, user: msg.userName, text: msg.message }));
  const loading = upcomingQ.isLoading || historyQ.isLoading;

  const sendMsg = () => {
    if (!chatText.trim()) return;
    sendMut.mutate({
      message: chatText.trim(),
    });
  };

  if (loading) return <SkeletonList count={4} />;
  if (!stream)
    return (
      <View style={styles.c}>
        <Text style={styles.e}>{t('mobile.public.live-stream.load-error')}</Text>
      </View>
    );

  return (
    <View style={styles.c}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.i}>
        <View style={styles.videoPlaceholder}>
          <Text style={styles.playIcon}>▶️</Text>
          <Text style={styles.videoTitle}>{stream.titleAr ?? stream.title ?? ''}</Text>
          <Text style={styles.videoMeta}>
            {stream.host ?? ''} · {stream.viewers ?? 0}
          </Text>
        </View>
        <Text style={styles.chatTitle}>{t('mobile.public.live-stream.chat-title')}</Text>
        {messages.map((m, i) => (
          <View key={m.id ?? i} style={styles.msg}>
            <Text style={styles.msgUser}>{m.user ?? ''}: </Text>
            <Text style={styles.msgText}>{m.text ?? ''}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.chatInput}>
        <TextInput
          value={chatText}
          onChangeText={setChatText}
          placeholder={t('mobile.public.live-stream.chat-placeholder')}
          style={styles.input}
          placeholderTextColor="#9ca3af"
        />
        <TouchableOpacity onPress={sendMsg} style={styles.sendBtn}>
          <Text style={styles.sendBtnText}></Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#18181b' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  videoPlaceholder: {
    backgroundColor: '#27272a',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    marginBottom: 20,
    minHeight: 200,
    justifyContent: 'center',
  },
  playIcon: { fontSize: 48, color: '#ef4444' },
  videoTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginTop: 12 },
  videoMeta: { fontSize: 13, color: '#a1a1aa', marginTop: 4 },
  chatTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 12 },
  msg: { flexDirection: 'row', paddingVertical: 4 },
  msgUser: { fontSize: 12, fontWeight: '700', color: '#ef4444' },
  msgText: { fontSize: 12, color: '#d4d4d8' },
  chatInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#3f3f46',
    backgroundColor: '#18181b',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#3f3f46',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#fff',
    backgroundColor: '#27272a',
  },
  sendBtn: { backgroundColor: '#ef4444', borderRadius: 10, padding: 10 },
  sendBtnText: { fontSize: 18 },
});
