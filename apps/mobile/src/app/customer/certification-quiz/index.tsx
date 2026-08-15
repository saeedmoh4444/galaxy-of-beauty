import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';

interface QuizSummary {
  id?: string;
  titleAr?: string;
  descAr?: string;
}

export default function CertificationQuizScreen(): JSX.Element {
  const q = trpc.certificationQuiz.quizzes.useQuery();
  const data: QuizSummary[] = (q.data as unknown as QuizSummary[] | undefined) ?? [];

  if (q.isLoading) return <SkeletonList count={4} />;

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={q.isRefetching}
          onRefresh={() => q.refetch()}
          colors={['#0891b2']}
        />
      }
    >
      <Text style={styles.t}> اختبار الشهادة</Text>
      {data.map((q, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.qTitle}>{q.titleAr}</Text>
          <Text style={styles.qDesc}>{q.descAr}</Text>
          <TouchableOpacity style={styles.startBtn}>
            <Text style={styles.startText}>بدء</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfeff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#0891b2', textAlign: 'center', marginBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10 },
  qTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  qDesc: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  startBtn: {
    alignSelf: 'flex-end',
    backgroundColor: '#0891b2',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginTop: 8,
  },
  startText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
