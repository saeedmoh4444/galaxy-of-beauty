import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function EventTicketsScreen() {
  const insets = useSafeAreaInsets();
  const [events, setEvents] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (trpc.eventTickets.available.query() as any).then((d: any) => { setEvents(d || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#f59e0b" style={{ marginTop: 40 }} size="large" />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}><Text style={styles.title}>🎟️ تذاكر الفعاليات</Text></View>
      <ScrollView contentContainerStyle={styles.inner}>
        {events.length === 0 ? <Text style={styles.empty}>لا توجد فعاليات قادمة</Text> :
          events.map((e: Record<string, unknown>, i: number) => (
            <TouchableOpacity key={i} style={styles.card} activeOpacity={0.8}>
              <Text style={styles.cardEmoji}>{['workshop','masterclass','launch','seasonal'].includes(e.eventType as string) ? ({workshop:'🛠️',masterclass:'👩‍🏫',launch:'🚀',seasonal:'🌸'} as any)[e.eventType as string] : '📅'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{(e.nameJson as Record<string,string>)?.ar}</Text>
                <Text style={styles.date}>{new Date(e.startsAt as string).toLocaleDateString('ar-SA', { month: 'long', day: 'numeric' })}</Text>
              </View>
              <Text style={styles.price}>{Number(e.price) > 0 ? `${Number(e.price)} ر.س` : 'مجاناً'}</Text>
            </TouchableOpacity>
          ))
        }
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fffbeb' },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#fde68a', backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '800', color: '#d97706', textAlign: 'center' },
  inner: { padding: 16, paddingBottom: 40 },
  empty: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, gap: 12 },
  cardEmoji: { fontSize: 36 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#111827', textAlign: 'right' },
  date: { fontSize: 12, color: '#6b7280', textAlign: 'right', marginTop: 4 },
  price: { fontSize: 16, fontWeight: '800', color: '#d97706' },
});
