import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';

export default function EventTicketsScreen(): JSX.Element {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    (trpc as any).eventTickets.list
      .query()
      .then((d: any) => {
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

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetch(true)}
          colors={['#8b5cf6']}
        />
      }
    >
      <Text style={styles.t}>🎟️ تذاكر الفعاليات</Text>
      <Text style={styles.sub}>احجزي تذكرتكِ لأقرب فعالية</Text>
      {events.length === 0 ? (
        <Text style={styles.e}>لا توجد فعاليات</Text>
      ) : (
        events.map((e: any, i: number) => (
          <View key={i} style={styles.card}>
            <Text style={styles.eventEmoji}>{(e.emoji as string) ?? '🎪'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.eventName}>{e.nameAr as string}</Text>
              <Text style={styles.eventDate}>
                {new Date(e.date as string).toLocaleDateString('ar-SA')}
              </Text>
            </View>
            <TouchableOpacity style={styles.bookBtn}>
              <Text style={styles.bookBtnText}>حجز</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 4 },
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
  eventEmoji: { fontSize: 32 },
  eventName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  eventDate: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  bookBtn: {
    backgroundColor: '#7c3aed',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  bookBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
