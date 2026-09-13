import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface QAItem {
  id?: number;
  emoji?: string;
  questionAr?: string;
  categoryAr?: string;
  technicianName?: string;
  answerAr?: string;
}

export default function TechnicianQAScreen(): JSX.Element {
  const { t } = useLocale();
  const q = trpc.technicianQA.list.useQuery({});

  if (q.isLoading) return <SkeletonList count={4} />;

  const questions = ((q.data as unknown as { items?: QAItem[] } | null)?.items ?? []) as QAItem[];

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={q.isRefetching}
          onRefresh={() => q.refetch()}
          colors={['#2563eb']}
        />
      }
    >
      <Text style={styles.t}>{t('mobile.public.technician-qa.title')}</Text>
      <Text style={styles.sub}>{t('mobile.public.technician-qa.subtitle')}</Text>
      {questions.length === 0 ? (
        <Text style={styles.e}>{t('mobile.public.technician-qa.empty')}</Text>
      ) : (
        questions.map((q) => (
          <View key={q.id} style={styles.card}>
            <Text style={styles.qEmoji}>{q.emoji ?? ''}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.qText}>{q.questionAr ?? ''}</Text>
              <Text style={styles.qMeta}>
                {q.categoryAr ?? ''} · {q.technicianName ?? ''}
              </Text>
              {q.answerAr ? (
                <View style={styles.answer}>
                  <Text style={styles.answerLabel}>{t('mobile.public.technician-qa.answer')}</Text>
                  <Text style={styles.answerText}>{q.answerAr}</Text>
                </View>
              ) : (
                <Text style={styles.waiting}>{t('mobile.public.technician-qa.waiting')}</Text>
              )}
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#eff6ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#2563eb', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  qEmoji: { fontSize: 26 },
  qText: { fontSize: 14, fontWeight: '600', color: '#111827' },
  qMeta: { fontSize: 11, color: '#6b7280', marginTop: 4 },
  answer: { backgroundColor: '#f0fdf4', borderRadius: 10, padding: 10, marginTop: 8 },
  answerLabel: { fontSize: 12, fontWeight: '600', color: '#059669' },
  answerText: { fontSize: 13, color: '#374151', marginTop: 2, lineHeight: 20 },
  waiting: { fontSize: 11, color: '#f59e0b', marginTop: 6 },
});
