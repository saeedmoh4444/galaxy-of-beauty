import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function BeautyExpoScreen() {
  const insets = useSafeAreaInsets();
  const [booths, setBooths] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (trpc.beautyExpo.booths.query() as any).then((d: any) => { setBooths(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#8b5cf6" style={{ marginTop: 40 }} size="large" />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}><Text style={styles.title}>🎪 معرض التجميل</Text></View>
      <ScrollView contentContainerStyle={styles.inner}>
        {booths.map((b: Record<string, unknown>, i: number) => (
          <View key={i} style={styles.card}>
            <Text style={styles.brandEmoji}>{b.emoji as string}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.brand}>{b.brand as string}</Text>
              <Text style={styles.desc}>{b.description as string}</Text>
              <View style={styles.products}>{(b.products as string[]).map((p: string) => <Text key={p} style={styles.product}>{p}</Text>)}</View>
              <Text style={styles.visitors}>👥 {(b.visitors as number)?.toLocaleString()} زائر</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#faf5ff' },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#ede9fe', backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '800', color: '#7c3aed', textAlign: 'center' },
  inner: { padding: 16, paddingBottom: 40 },
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, gap: 12, alignItems: 'center' },
  brandEmoji: { fontSize: 40 },
  brand: { fontSize: 16, fontWeight: '700', color: '#111827', textAlign: 'right' },
  desc: { fontSize: 12, color: '#6b7280', textAlign: 'right', marginTop: 4 },
  products: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 8, justifyContent: 'flex-end' },
  product: { fontSize: 10, backgroundColor: '#ede9fe', color: '#7c3aed', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  visitors: { fontSize: 11, color: '#9ca3af', textAlign: 'right', marginTop: 8 },
});
