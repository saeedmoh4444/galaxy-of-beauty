import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { typedTrpc } from '@/lib/trpc-react';

const BD: Record<number, number> = { 2: 10, 3: 15, 4: 20, 5: 25 };

interface BundleService {
  id: number;
  emoji?: string;
  nameJson?: { ar?: string; en?: string };
  nameAr?: string;
  slug?: string;
  _count?: { services?: number };
}

export default function BundlesScreen(): JSX.Element {
  const [services, setServices] = useState<BundleService[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    typedTrpc()
      .categories.list.query()
      .then((d: BundleService[]) => {
        setServices(d || []);
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
  const toggle = (id: number) => {
    const n = new Set(selected);
    n.has(id) ? n.delete(id) : n.size < 5 && n.add(id);
    setSelected(n);
  };
  const count = selected.size;
  const discount = BD[count] || 0;
  if (loading) return <SkeletonList count={5} />;
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetch(true)}
          colors={['#f59e0b']}
        />
      }
    >
      <Text style={styles.t}> اصنعي باقتكِ</Text>
      {count > 0 && (
        <View style={styles.db}>
          <Text style={styles.dt}>
            خصم {discount}% على {count} خدمات!
          </Text>
        </View>
      )}
      {services.slice(0, 15).map((s) => {
        const isSel = selected.has(s.id);
        return (
          <TouchableOpacity
            key={s.id}
            onPress={() => toggle(s.id)}
            style={[styles.card, isSel && styles.ca]}
          >
            <Text style={styles.se}>{s.emoji ?? '‍️'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.sn}>{s.nameJson?.ar ?? s.nameAr ?? s.slug}</Text>
              <Text style={styles.sm}>{s._count?.services ?? 0} خدمات</Text>
            </View>
            <View style={[styles.ch, isSel && styles.cha]}>
              <Text style={[styles.cht, isSel && styles.chta]}>{isSel ? '' : '+'}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fffbeb' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#d97706', textAlign: 'center', marginBottom: 16 },
  db: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  dt: { fontSize: 15, fontWeight: '700', color: '#d97706' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  ca: { borderWidth: 2, borderColor: '#f59e0b', backgroundColor: '#fffbeb' },
  se: { fontSize: 28 },
  sn: { fontSize: 14, fontWeight: '600', color: '#111827' },
  sm: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  ch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cha: { backgroundColor: '#f59e0b' },
  cht: { fontSize: 16, fontWeight: '700', color: '#6b7280' },
  chta: { color: '#fff' },
});
