import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useState } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { localize } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';

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
  const { locale, t } = useLocale();
  const [filter, setFilter] = useState<string | null>(null);
  const eventsQ = trpc.beautyEvents.upcoming.useQuery();

  if (eventsQ.isLoading) return <SkeletonList count={4} />;

  const events = (eventsQ.data ?? []) as BeautyEvent[];
  const filtered = filter ? events.filter((e) => e.eventType === filter) : events;
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={eventsQ.isRefetching}
          onRefresh={() => eventsQ.refetch()}
          colors={['#7c3aed']}
        />
      }
    >
      <Text style={styles.t}>{t('mobile.public.events.title')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            onPress={() => setFilter(null)}
            style={[styles.fc, !filter && styles.fca]}
          >
            <Text style={[styles.ft, !filter && styles.fta]}>{t('marketing.events.all')}</Text>
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
              <Text style={styles.en}>{localize(e.nameJson, locale) ?? e.nameAr ?? ''}</Text>
              <Text style={styles.em}>
                {e.startsAt
                  ? new Date(e.startsAt).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
                      month: 'long',
                      day: 'numeric',
                    })
                  : ''}{' '}
                · {e.location ?? t('mobile.public.events.online')}
              </Text>
            </View>
            <TouchableOpacity style={styles.jb}>
              <Text style={styles.jt}>{t('mobile.public.events.register')}</Text>
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
