import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function BeautyCoursesScreen() {
  const insets = useSafeAreaInsets();
  const [courses, setCourses] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (trpc.beautyCourses.list.query() as any).then((d: any) => { setCourses(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#8b5cf6" style={{ marginTop: 40 }} size="large" />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}><Text style={styles.title}>🎓 دورات التجميل</Text></View>
      <ScrollView contentContainerStyle={styles.inner}>
        {courses.map((c: Record<string, unknown>, i: number) => (
          <TouchableOpacity key={i} style={styles.card} activeOpacity={0.8}>
            <Text style={styles.cardEmoji}>{c.emoji as string}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{c.titleAr as string}</Text>
              <Text style={styles.desc}>{c.descAr as string}</Text>
              <View style={styles.meta}>
                <Text style={styles.metaItem}>👩‍🏫 {c.instructor as string}</Text>
                <Text style={styles.metaItem}>📚 {c.lessons as number} دروس</Text>
                <Text style={styles.metaItem}>⭐ {c.rating as number}</Text>
              </View>
            </View>
          </TouchableOpacity>
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
  cardEmoji: { fontSize: 40 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#111827', textAlign: 'right' },
  desc: { fontSize: 12, color: '#6b7280', textAlign: 'right', marginTop: 4 },
  meta: { flexDirection: 'row', gap: 8, marginTop: 8, justifyContent: 'flex-end' },
  metaItem: { fontSize: 11, color: '#9ca3af' },
});
