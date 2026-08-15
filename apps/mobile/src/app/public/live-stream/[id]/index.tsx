import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { SkeletonList } from '@/components/SkeletonCard';
import { typedTrpc } from '@/lib/trpc-react';

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
  const { id } = useLocalSearchParams<{ id: string }>();
  const [stream, setStream] = useState<StreamDetail | null>(null);
  const [messages, setMessages] = useState<StreamMessage[]>([]);
  const [chatText, setChatText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      typedTrpc().liveStream.get.query({ id: parseInt(id, 10) }) as Promise<StreamDetail>,
      typedTrpc().liveStream.messages.query({ streamId: parseInt(id, 10) }) as Promise<StreamMessage[]>,
    ])
      .then(([s, m]) => {
        setStream(s);
        setMessages(m || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const sendMsg = () => {
    if (!chatText.trim()) return;
    (
      typedTrpc().liveStream.sendMessage.mutate({
        streamId: parseInt(id, 10),
        text: chatText.trim(),
      }) as Promise<void>
    ).then(() => {
      setChatText('');
    });
  };

  if (loading) return <SkeletonList count={4} />;
  if (!stream)
    return (
      <View style={styles.c}>
        <Text style={styles.e}>تعذر تحميل البث</Text>
      </View>
    );

  return (
    <View style={styles.c}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.i}>
        <View style={styles.videoPlaceholder}>
          <Text style={styles.playIcon}>▶️</Text>
          <Text style={styles.videoTitle}>
            {stream.titleAr ?? stream.title ?? ''}
          </Text>
          <Text style={styles.videoMeta}>
             {stream.host ?? ''} ·  {stream.viewers ?? 0}
          </Text>
        </View>
        <Text style={styles.chatTitle}> المحادثة المباشرة</Text>
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
          placeholder="اكتبي رسالة..."
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
