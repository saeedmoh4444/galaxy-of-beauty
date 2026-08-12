import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';

export default function BeautyFaqScreen(): JSX.Element {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    ((trpc as any).beautyFaq.list.query() as any)
      .then((d: any) => {
        setFaqs(d || []);
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
  if (loading) return <SkeletonList count={5} />;
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetch(true)}
          colors={['#7c3aed']}
        />
      }
    >
      <Text style={styles.t}>❓ الأسئلة الشائعة</Text>
      {faqs.map((f: any, i: number) => (
        <View key={i} style={styles.card}>
          <Text style={styles.fq}>{f.questionAr as string}</Text>
          <Text style={styles.fa}>{f.answerAr as string}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10 },
  fq: { fontSize: 15, fontWeight: '700', color: '#111827', textAlign: 'right' },
  fa: { fontSize: 13, color: '#6b7280', marginTop: 8, textAlign: 'right', lineHeight: 20 },
});
