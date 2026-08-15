import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { rawTrpc } from '@/lib/trpc-react';

interface BeautyProfileData {
  skinType?: string;
  hairType?: string;
}

export default function BeautyProfileScreen(): JSX.Element {
  const [data, setData] = useState<BeautyProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    rawTrpc.beautyProfile.get
      .query()
      .then((d) => {
        setData((d ?? null) as unknown as BeautyProfileData);
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
  if (loading) return <SkeletonList count={3} />;
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetch(true)}
          colors={['#ec4899']}
        />
      }
    >
      <Text style={styles.t}> ملف الجمال</Text>
      {data && (
        <View style={styles.card}>
          <Text style={styles.label}>نوع البشرة: {data.skinType}</Text>
          <Text style={styles.label}>نوع الشعر: {data.hairType}</Text>
        </View>
      )}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  label: { fontSize: 15, color: '#374151', paddingVertical: 6 },
});
