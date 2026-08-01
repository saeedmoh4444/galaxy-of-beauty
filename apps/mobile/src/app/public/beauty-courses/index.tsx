import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useQuery } from '@/lib/useQuery';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';

export default function BeautyCoursesScreen(): JSX.Element {
  const { data: courses, loading, error, refreshing, refetch, refresh } = useQuery(() => trpc.beautyCourses.list.query() as any);

  if (loading) return <View style={styles.container}><View style={styles.header}><Text style={styles.title}>🎓 دورات التجميل</Text></View><SkeletonList count={4} /></View>;
  if (error) return <ErrorAlert message="فشل تحميل الدورات" onRetry={refetch} />;

  const items = (courses ?? []) as Record<string, unknown>[];

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.title}>🎓 دورات التجميل</Text></View>
      <ScrollView contentContainerStyle={styles.inner} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} colors={['#7c3aed']} />}>
        {items.map((c: Record<string, unknown>, i: number) => (
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
