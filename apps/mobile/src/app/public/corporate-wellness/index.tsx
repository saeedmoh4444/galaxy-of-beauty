import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { typedTrpc } from '@/lib/trpc-react';

interface WellnessPlan {
  id?: number;
  emoji?: string;
  nameAr?: string;
  descAr?: string;
}

export default function CorporateWellnessScreen(): JSX.Element {
  const [plans, setPlans] = useState<WellnessPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    typedTrpc()
      .corporateWellness.plans.query()
      .then((d: WellnessPlan[]) => {
        setPlans(d || []);
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
          colors={['#059669']}
        />
      }
    >
      <Text style={styles.t}> عروض الشركات</Text>
      <Text style={styles.sub}>باقات تجميل للشركات والمؤسسات</Text>
      {plans.length === 0 ? (
        <Text style={styles.e}>لا توجد باقات</Text>
      ) : (
        plans.map((p, i) => (
          <View key={i} style={styles.card}>
            <Text style={styles.planEmoji}>{p.emoji ?? ''}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.planName}>{p.nameAr}</Text>
              <Text style={styles.planDesc}>{p.descAr}</Text>
            </View>
            <TouchableOpacity style={styles.inquireBtn}>
              <Text style={styles.inquireText}>استفسار</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfdf5' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#059669', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  planEmoji: { fontSize: 36 },
  planName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  planDesc: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  inquireBtn: {
    backgroundColor: '#059669',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  inquireText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});
