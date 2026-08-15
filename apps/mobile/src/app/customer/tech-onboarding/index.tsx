import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { typedTrpc } from '@/lib/trpc-react';

interface OnboardingStep {
  key?: string;
  titleAr?: string;
  descAr?: string;
  nameAr?: string;
  desc?: string;
  emoji?: string;
  completed?: boolean;
}

interface OnboardingData {
  steps?: OnboardingStep[];
  completed?: number;
  total?: number;
  readyForReview?: boolean;
}

export default function TechOnboardingScreen(): JSX.Element {
  const [data, setData] = useState<OnboardingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    (typedTrpc().techOnboarding.steps.query() as Promise<OnboardingData>)
      .then((d: OnboardingData) => {
        setData(d);
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
  const submitDoc = (stepKey: string) => {
    (typedTrpc().techOnboarding.submitDoc.mutate({
      stepKey,
      url: 'document-url',
    }) as Promise<unknown>).then(() => fetch());
  };
  if (loading) return <SkeletonList count={4} />;
  const steps = (data?.steps as OnboardingStep[] | undefined) ?? [];
  const completed = data?.completed ?? 0;
  const total = data?.total ?? 5;
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetch(true)}
          colors={['#059669']}
        />
      }
    >
      <Text style={styles.t}> التسجيل كفنية</Text>
      <View style={styles.pc}>
        <Text style={styles.pe}></Text>
        <Text style={styles.pt}>
          {completed}/{total} مكتملة
        </Text>
        <View style={styles.pb}>
          <View style={[styles.pf, { width: `${(completed / total) * 100}%` }]} />
        </View>
      </View>
      {steps.map((s, i) => (
        <View key={s.key ?? i} style={[styles.step, s.completed && styles.sd]}>
          <Text style={styles.se}>{s.completed ? '' : '⭕'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.stt, s.completed && styles.sttd]}>{s.titleAr}</Text>
            <Text style={styles.sdesc}>{s.descAr}</Text>
          </View>
          {!s.completed && (
            <TouchableOpacity onPress={() => submitDoc(s.key ?? '')} style={styles.ub}>
              <Text style={styles.ut}>رفع</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfdf5' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#059669', textAlign: 'center', marginBottom: 20 },
  pc: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  pe: { fontSize: 40 },
  pt: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 8 },
  pb: { height: 8, backgroundColor: '#f3f4f6', borderRadius: 4, width: '100%', marginTop: 12 },
  pf: { height: 8, backgroundColor: '#059669', borderRadius: 4 },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  sd: { opacity: 0.6 },
  se: { fontSize: 24 },
  stt: { fontSize: 14, fontWeight: '600', color: '#111827' },
  sttd: { textDecorationLine: 'line-through' },
  sdesc: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  ub: { backgroundColor: '#059669', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  ut: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
