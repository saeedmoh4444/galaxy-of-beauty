import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { SkeletonList } from '@/components/SkeletonCard';

export default function TutorialDetailScreen(): JSX.Element {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetch = useCallback(
    (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      ((trpc as any).tutorials.get.query({ id: parseInt(id, 10) }) as any)
        .then((d: any) => {
          setData(d);
          setLoading(false);
          setRefreshing(false);
        })
        .catch(() => {
          setLoading(false);
          setRefreshing(false);
        });
    },
    [id],
  );
  useEffect(() => {
    fetch();
  }, [fetch]);
  if (loading) return <SkeletonList count={4} />;
  if (!data)
    return (
      <View style={styles.c}>
        <Text style={styles.e}>تعذر تحميل الدرس</Text>
      </View>
    );
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
      <View style={styles.vp}>
        <Text style={styles.pi}>▶️</Text>
      </View>
      <Text style={styles.t}>
        {(data.emoji as string) ?? ''} {data.titleAr as string}
      </Text>
      <View style={styles.meta}>
        <Text style={styles.mi}>{data.categoryAr as string}</Text>
        <Text style={styles.mi}>{data.difficultyAr as string}</Text>
        <Text style={styles.mi}>️ {data.duration as string}</Text>
      </View>
      <Text style={styles.desc}>{data.descAr as string}</Text>
      {data.steps && (
        <View style={styles.sec}>
          <Text style={styles.st}> الخطوات</Text>
          {(data.steps as any[]).map((s: any, i: number) => (
            <View key={i} style={styles.step}>
              <View style={styles.sn}>
                <Text style={styles.snt}>{i + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stt}>{s.titleAr as string}</Text>
                <Text style={styles.sd}>{s.descAr as string}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' },
  i: { padding: 16, paddingTop: 20, paddingBottom: 40 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  vp: {
    backgroundColor: '#1e1b4b',
    borderRadius: 16,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  pi: { fontSize: 48, color: '#fff' },
  t: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 10 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  mi: {
    fontSize: 12,
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  desc: { fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 20 },
  sec: { marginBottom: 20 },
  st: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10 },
  step: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  sn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  snt: { color: '#fff', fontSize: 13, fontWeight: '700' },
  stt: { fontSize: 14, fontWeight: '600', color: '#111827' },
  sd: { fontSize: 12, color: '#6b7280', marginTop: 2 },
});
