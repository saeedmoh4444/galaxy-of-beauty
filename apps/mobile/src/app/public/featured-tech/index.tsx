import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function FeaturedTechScreen() {
  const insets = useSafeAreaInsets();
  const [tech, setTech] = useState<Record<string, unknown> | null>(null);
  const [past, setPast] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (trpc.featuredTech.current.query() as any),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (trpc.featuredTech.past.query() as any),
    ]).then(([c, p]) => { setTech(c); setPast(p || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#f59e0b" style={{ marginTop: 40 }} size="large" />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}><Text style={styles.title}>🌟 فنية الأسبوع</Text></View>
      <ScrollView contentContainerStyle={styles.inner}>
        {tech ? (
          <View style={styles.featuredCard}>
            <Text style={styles.bigEmoji}>{tech.emoji as string}</Text>
            <Text style={styles.techName}>{tech.name as string}</Text>
            <Text style={styles.techTitle}>{tech.titleAr as string}</Text>
            <Text style={styles.bio}>{tech.bio as string}</Text>
            <View style={styles.highlights}>
              {(tech.highlights as string[]).map((h: string, i: number) => <Text key={i} style={styles.highlight}>✨ {h}</Text>)}
            </View>
            {(tech.interview as Record<string, string>) && (
              <View style={styles.interview}>
                <Text style={styles.iq}>س: {(tech.interview as Record<string, string>).q}</Text>
                <Text style={styles.ia}>ج: {(tech.interview as Record<string, string>).a}</Text>
              </View>
            )}
          </View>
        ) : null}
        {past.length > 0 && <Text style={styles.section}>⭐ سابقات</Text>}
        {past.map((t: Record<string, unknown>, i: number) => (
          <View key={i} style={styles.pastItem}>
            <Text>{t.emoji as string} {t.name as string}</Text>
            <Text style={styles.pastDate}>{new Date(t.weekOf as string).toLocaleDateString('ar-SA')}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fffbeb' },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#fde68a', backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '800', color: '#d97706', textAlign: 'center' },
  inner: { padding: 16, paddingBottom: 40 },
  featuredCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 20, alignItems: 'center' },
  bigEmoji: { fontSize: 64, marginBottom: 8 },
  techName: { fontSize: 22, fontWeight: '800', color: '#111827' },
  techTitle: { fontSize: 14, color: '#d97706', marginTop: 4 },
  bio: { fontSize: 13, color: '#6b7280', marginTop: 12, textAlign: 'center', lineHeight: 22 },
  highlights: { marginTop: 16, gap: 4 },
  highlight: { fontSize: 13, color: '#374151', textAlign: 'center', marginBottom: 4 },
  interview: { marginTop: 16, backgroundColor: '#fef3c7', borderRadius: 12, padding: 14, width: '100%' },
  iq: { fontSize: 13, fontWeight: '700', color: '#92400e', textAlign: 'right' },
  ia: { fontSize: 13, color: '#78350f', marginTop: 8, textAlign: 'right', lineHeight: 22 },
  section: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 10, textAlign: 'right' },
  pastItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  pastDate: { fontSize: 12, color: '#9ca3af' },
});
