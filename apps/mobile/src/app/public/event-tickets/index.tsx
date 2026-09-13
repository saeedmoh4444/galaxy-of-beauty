import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface TicketEvent {
  id?: number;
  emoji?: string;
  nameAr?: string;
  date?: string;
}

export default function EventTicketsScreen(): JSX.Element {
  const { locale, t } = useLocale();
  const eventsQ = trpc.eventTickets.available.useQuery();

  if (eventsQ.isLoading) return <SkeletonList count={4} />;

  const events = (eventsQ.data ?? []) as TicketEvent[];

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={eventsQ.isRefetching}
          onRefresh={() => eventsQ.refetch()}
          colors={['#8b5cf6']}
        />
      }
    >
      <Text style={styles.t}>{t('mobile.public.event-tickets.title')}</Text>
      <Text style={styles.sub}>{t('mobile.public.event-tickets.subtitle')}</Text>
      {events.length === 0 ? (
        <Text style={styles.e}>{t('mobile.public.event-tickets.empty')}</Text>
      ) : (
        events.map((e, i) => (
          <View key={i} style={styles.card}>
            <Text style={styles.eventEmoji}>{e.emoji ?? ''}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.eventName}>{e.nameAr ?? ''}</Text>
              <Text style={styles.eventDate}>
                {e.date
                  ? new Date(e.date).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US')
                  : ''}
              </Text>
            </View>
            <TouchableOpacity style={styles.bookBtn}>
              <Text style={styles.bookBtnText}>{t('mobile.public.event-tickets.book')}</Text>
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
