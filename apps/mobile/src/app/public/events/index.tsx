import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { rawTrpc } from '@/lib/trpc-react';

const ET: Record<string, { label: string; emoji: string }> = {
  workshop: { label: 'ورشة عمل', emoji: '' },
  masterclass: { label: 'ماستر كلاس', emoji: '' },
  launch: { label: 'إطلاق منتج', emoji: '' },
  seasonal: { label: 'موسمي', emoji: '' },
};

interface BeautyEvent {
  id?: number;
  eventType?: string;
  nameJson?: { ar?: string; en?: string };
  nameAr?: string;
  startsAt?: string;
  location?: string;
}

export default function EventsScreen(): JSX.Element {
  const [events, setEvents] = useState<BeautyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string | null>(null);
  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    (rawTrpc.beautyEvents.upcoming.query() as unknown as Promise<BeautyEvent[]>)
      .then((d) => {
        setEvents(d || []);
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
  const filtered = filter ? events.filter((e) => e.eventType === filter) : events;
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
      <Text style={styles.t}> الفعاليات</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            onPress={() => setFilter(null)}
            style={[styles.fc, !filter && styles.fca]}
          >
            <Text style={[styles.ft, !filter && styles.fta]}>الكل</Text>
          </TouchableOpacity>
          {Object.entries(ET).map(([key, t]) => (
            <TouchableOpacity
              key={key}
              onPress={() => setFilter(key)}
              style={[styles.fc, filter === key && styles.fca]}
            >
              <Text style={[styles.ft, filter === key && styles.fta]}>
                {t.emoji} {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      {filtered.map((e) => {
        const et = ET[e.eventType ?? ''] ?? { label: e.eventType ?? '', emoji: '' };
        return (
          <View key={e.id} style={styles.card}>
            <Text style={styles.ee}>{et.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.en}>{e.nameJson?.ar ?? e.nameAr ?? ''}</Text>
              <Text style={styles.em}>
                {e.startsAt
                  ? new Date(e.startsAt).toLocaleDateString('ar-SA', {
                      month: 'long',
                      day: 'numeric',
                    })
                  : ''}{' '}
                · {e.location ?? 'أونلاين'}
              </Text>
            </View>
            <TouchableOpacity style={styles.jb}>
              <Text style={styles.jt}>تسجيل</Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 16 },
  fc: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f3f4f6' },
  fca: { backgroundColor: '#7c3aed' },
  ft: { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  fta: { color: '#fff' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  ee: { fontSize: 32 },
  en: { fontSize: 14, fontWeight: '600', color: '#111827' },
  em: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  jb: { backgroundColor: '#7c3aed', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  jt: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
