import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

const EVENT_TYPES: Record<string, { label: string; emoji: string }> = {
  workshop: { label: 'ورشة عمل', emoji: '🛠️' },
  masterclass: { label: 'ماستر كلاس', emoji: '👩‍🏫' },
  launch: { label: 'إطلاق منتج', emoji: '🚀' },
  seasonal: { label: 'موسمي', emoji: '🌸' },
};

export default function EventsScreen(): JSX.Element {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    ((trpc as any).beautyEvents.list.query({}) as any).then((d: any) => { setEvents(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#8b5cf6" style={{ marginTop: 40 }} size="large" />;

  const filtered = filter ? events.filter((e: any) => e.eventType === filter) : events;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>📅 الفعاليات</Text>
      <Text style={styles.sub}>ورش وماستر كلاس وفعاليات تجميل</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom:16}}>
        <View style={{flexDirection:'row', gap:8}}>
          <TouchableOpacity onPress={() => setFilter(null)} style={[styles.filterChip, !filter && styles.filterChipActive]}>
            <Text style={[styles.filterText, !filter && styles.filterTextActive]}>الكل</Text>
          </TouchableOpacity>
          {Object.entries(EVENT_TYPES).map(([key, t]) => (
            <TouchableOpacity key={key} onPress={() => setFilter(key)} style={[styles.filterChip, filter === key && styles.filterChipActive]}>
              <Text style={[styles.filterText, filter === key && styles.filterTextActive]}>{t.emoji} {t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {filtered.length === 0 ? <Text style={styles.e}>لا توجد فعاليات</Text> :
        filtered.map((e: any) => {
          const et = EVENT_TYPES[e.eventType as string] ?? { label: e.eventType, emoji: '📅' };
          return (
            <View key={e.id} style={styles.card}>
              <Text style={styles.eventEmoji}>{et.emoji}</Text>
              <View style={{flex:1}}>
                <Text style={styles.eventName}>{(e.nameJson as any)?.ar as string ?? e.nameAr as string}</Text>
                <Text style={styles.eventMeta}>{new Date(e.startsAt as string).toLocaleDateString('ar-SA', { month:'long', day:'numeric' })} · {e.location as string ?? 'أونلاين'}</Text>
                {e.price && <Text style={styles.eventPrice}>{(e.price as number)?.toLocaleString()} ر.س</Text>}
              </View>
              <TouchableOpacity style={styles.joinBtn}><Text style={styles.joinBtnText}>تسجيل</Text></TouchableOpacity>
            </View>
          );
        })
      }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' }, i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 16 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f3f4f6' },
  filterChipActive: { backgroundColor: '#7c3aed' },
  filterText: { fontSize: 12, fontWeight: '600', color: '#6b7280' }, filterTextActive: { color: '#fff' },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8 },
  eventEmoji: { fontSize: 32 }, eventName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  eventMeta: { fontSize: 12, color: '#6b7280', marginTop: 2 }, eventPrice: { fontSize: 13, fontWeight: '700', color: '#7c3aed', marginTop: 4 },
  joinBtn: { backgroundColor: '#7c3aed', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  joinBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
