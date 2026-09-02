import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useState } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { useLocale } from '@/components/LocaleProvider';
import { useAuthState } from '@/hooks/useAuthState';
import { trpc } from '@/lib/trpc-react';

interface AssistantMessage {
  id?: number;
  content?: string;
  role?: string;
}

export default function AIAssistantScreen(): JSX.Element {
  const { t } = useLocale();
  const isAuthed = useAuthState();
  const [input, setInput] = useState('');
  const q = trpc.liveChat.history.useQuery(undefined, { enabled: isAuthed });
  const messages: AssistantMessage[] = (q.data as AssistantMessage[] | undefined) ?? [];

  if (q.isLoading)
    return (
      <View style={styles.c}>
        <Text style={styles.t}>{t('aiAssistant.title')}</Text>
        <SkeletonList count={4} />
      </View>
    );

  return (
    <View style={styles.c}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.i}
        refreshControl={
          <RefreshControl
            refreshing={q.isRefetching}
            onRefresh={() => q.refetch()}
            colors={['#7c3aed']}
          />
        }
      >
        <Text style={styles.t}>{t('aiAssistant.title')}</Text>
        {messages.map((m, i) => (
          <View key={i} style={[styles.msg, m.role === 'user' ? styles.user : styles.bot]}>
            <Text style={styles.msgText}>{m.content as string}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.inputRow}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder={t('aiAssistant.placeholder')}
          style={styles.input}
          placeholderTextColor="#9ca3af"
        />
        <TouchableOpacity style={styles.sendBtn}>
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
  msg: { maxWidth: '80%', borderRadius: 16, padding: 12, marginBottom: 8 },
  user: { alignSelf: 'flex-end', backgroundColor: '#7c3aed' },
  bot: { alignSelf: 'flex-start', backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb' },
  msgText: { fontSize: 14, color: '#111827' },
  inputRow: {
    flexDirection: 'row',
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
