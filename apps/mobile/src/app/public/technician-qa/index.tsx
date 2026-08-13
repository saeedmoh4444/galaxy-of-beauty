import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { typedTrpc } from '@/lib/trpc-react';

interface QAItem {
  id?: number;
  emoji?: string;
  questionAr?: string;
  categoryAr?: string;
  technicianName?: string;
  answerAr?: string;
}

export default function TechnicianQAScreen(): JSX.Element {
  const [questions, setQuestions] = useState<QAItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    (typedTrpc().technicianQA.list.query() as Promise<QAItem[]>)
      .then((d) => {
        setQuestions(d || []);
        setLoading(false);
        setRefreshing(false);
      })
      .catch(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  if (loading) return <SkeletonList count={4} />;

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetch(true)}
          colors={['#2563eb']}
        />
      }
    >
      <Text style={styles.t}> اسألي الفنيات</Text>
      <Text style={styles.sub}>اطرحي أسئلتك على خبراء التجميل</Text>
      {questions.length === 0 ? (
        <Text style={styles.e}>لا توجد أسئلة</Text>
      ) : (
        questions.map((q) => (
          <View key={q.id} style={styles.card}>
            <Text style={styles.qEmoji}>{q.emoji ?? ''}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.qText}>{q.questionAr ?? ''}</Text>
              <Text style={styles.qMeta}>
                {q.categoryAr ?? ''} ·  {q.technicianName ?? ''}
              </Text>
              {q.answerAr ? (
                <View style={styles.answer}>
                  <Text style={styles.answerLabel}> الإجابة:</Text>
                  <Text style={styles.answerText}>{q.answerAr}</Text>
                </View>
              ) : (
                <Text style={styles.waiting}> في انتظار الرد...</Text>
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
