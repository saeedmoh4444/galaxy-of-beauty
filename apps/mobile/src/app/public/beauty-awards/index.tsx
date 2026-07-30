import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function BeautyAwardsScreen() {
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (trpc.beautyAwards.current.query() as any).then((d: any) => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const cats = (data?.categories ?? []) as Record<string, unknown>[];

  if (loading) return <ActivityIndicator color="#f59e0b" style={{ marginTop: 40 }} size="large" />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}><Text style={styles.title}>🏆 جوائز الجمال</Text><Text style={styles.subtitle}>{data?.month as string}</Text></View>
      <ScrollView contentContainerStyle={styles.inner}>
        {cats.map((c: Record<string, unknown>, i: number) => (
          <View key={i} style={styles.category}>
            <Text style={styles.catTitle}>{c.emoji as string} {c.nameAr as string}</Text>
            {(c.nominees as Record<string, unknown>[]).map((n: Record<string, unknown>, j: number) => (
              <View key={j} style={styles.nominee}>
                <Text style={[styles.rank, { color: j === 0 ? '#f59e0b' : '#9ca3af' }]}>{['🥇','🥈','🥉'][j] ?? `#${j+1}`}</Text>
                <Text style={styles.name}>{n.name as string}</Text>
                <Text style={styles.votes}>{(n.votes as number)?.toLocaleString()} صوت</Text>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fffbeb' },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#fde68a', backgroundColor: '#fff', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: '#d97706' },
  subtitle: { fontSize: 13, color: '#9ca3af', marginTop: 4 },
  inner: { padding: 16, paddingBottom: 40 },
  category: { marginBottom: 20 },
  catTitle: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 10, textAlign: 'right' },
  nominee: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 6, gap: 8 },
  rank: { fontSize: 20, width: 36, textAlign: 'center' },
  name: { flex: 1, fontSize: 14, fontWeight: '600', color: '#111827', textAlign: 'right' },
  votes: { fontSize: 12, color: '#9ca3af' },
});
