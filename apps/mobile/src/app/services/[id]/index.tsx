import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { typedTrpc } from '@/lib/trpc-react';

interface ServiceDetail {
  emoji?: string;
  titleJson?: { ar?: string; en?: string };
  descriptionJson?: { ar?: string; en?: string };
  basePrice?: number;
  durationMin?: number;
}

export default function ServiceDetailScreen(): JSX.Element {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [data, setData] = useState<ServiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetch = useCallback(
    (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      (typedTrpc().services.getById.query({ id: parseInt(id, 10) }) as Promise<ServiceDetail>)
        .then((d: ServiceDetail) => {
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
        <Text style={styles.e}>الخدمة غير موجودة</Text>
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
          colors={['#db2777']}
        />
      }
    >
      <Text style={styles.t}>
        {data.emoji ?? '‍️'} {data.titleJson?.ar}
      </Text>
      <View style={styles.card}>
        <Text style={styles.price}>{data.basePrice?.toLocaleString()} ر.س</Text>
        <Text style={styles.dur}>️ {data.durationMin} دقيقة</Text>
      </View>
      {data.descriptionJson && <Text style={styles.desc}>{data.descriptionJson?.ar}</Text>}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 22, fontWeight: '800', color: '#111827', textAlign: 'right', marginBottom: 16 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  price: { fontSize: 24, fontWeight: '800', color: '#db2777' },
  dur: { fontSize: 14, color: '#6b7280' },
  desc: { fontSize: 14, color: '#374151', lineHeight: 24, textAlign: 'right' },
});
