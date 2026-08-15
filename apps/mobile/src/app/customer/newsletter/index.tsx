import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useState } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';

interface NewsletterIssue {
  id?: number;
  title?: string;
  date?: string;
}

export default function NewsletterScreen(): JSX.Element {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const issuesQ = trpc.newsletter.issues.useQuery();
  const issues: NewsletterIssue[] =
    (issuesQ.data as unknown as NewsletterIssue[] | undefined) ?? [];
  if (issuesQ.isLoading) return <SkeletonList count={4} />;
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={issuesQ.isRefetching}
          onRefresh={() => issuesQ.refetch()}
          colors={['#2563eb']}
        />
      }
    >
      <Text style={styles.t}> النشرة البريدية</Text>
      {!subscribed ? (
        <View style={styles.card}>
          <View style={styles.sr}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="بريدكِ الإلكتروني"
              keyboardType="email-address"
              style={styles.inp}
              placeholderTextColor="#9ca3af"
            />
            <TouchableOpacity
              onPress={() => {
                if (email.includes('@')) setSubscribed(true);
              }}
              style={styles.sb}
            >
              <Text style={styles.sbt}>اشتراك</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={[styles.card, styles.sc]}>
          <Text style={{ fontSize: 48 }}></Text>
          <Text style={styles.st}>تم الاشتراك!</Text>
        </View>
      )}
      {issues.map((i, idx) => (
        <View key={idx} style={styles.issue}>
          <Text style={styles.it}>{i.title ?? ''}</Text>
          <Text style={styles.id}>
            {i.date ? new Date(i.date).toLocaleDateString('ar-SA') : ''}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#eff6ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#2563eb', textAlign: 'center', marginBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 20 },
  sc: { alignItems: 'center', borderWidth: 2, borderColor: '#86efac' },
  st: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 8 },
  sr: { flexDirection: 'row', gap: 8 },
  inp: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  sb: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  sbt: { color: '#fff', fontSize: 14, fontWeight: '600' },
  issue: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  it: { fontSize: 14, fontWeight: '600', color: '#111827' },
  id: { fontSize: 11, color: '#9ca3af' },
});
