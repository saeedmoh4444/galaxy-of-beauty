import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';
import { localize } from '@galaxy/shared';

interface BeautyEvent {
  id?: number;
  nameJson?: Record<string, string>;
  location?: string | null;
  price?: number | string | null;
  startsAt?: string;
  endsAt?: string;
  isPublished?: boolean;
}

function eventStatus(e: BeautyEvent): 'upcoming' | 'active' | 'completed' {
  const now = Date.now();
  const start = e.startsAt ? new Date(e.startsAt).getTime() : now;
  const end = e.endsAt ? new Date(e.endsAt).getTime() : start;
  if (now < start) return 'upcoming';
  if (now > end) return 'completed';
  return 'active';
}

export default function AdminBeautyEventsScreen(): JSX.Element {
  const { t, locale } = useLocale();
  const q = trpc.beautyEvents.listAll.useQuery();
  const events = (q.data as unknown as BeautyEvent[] | null) ?? [];

  return (
    <ScrollView style={s.c} contentContainerStyle={s.i}>
      <Text style={s.h}>{t('mobile.admin.beauty-events.title')}</Text>
      <Text style={s.sub}>{t('mobile.admin.beauty-events.subtitle')}</Text>
      <View style={{ flexDirection: 'row', gap: 6, marginBottom: 16 }}>
        {['upcoming', 'active', 'completed'].map((st) => (
          <TouchableOpacity
            key={st}
            style={[s.fb, st === 'upcoming' && { backgroundColor: '#dbeafe' }]}
          >
            <Text style={[s.ft, st === 'upcoming' && { color: '#2563eb' }]}>
              {st === 'upcoming'
                ? t('mobile.admin.beauty-events.upcoming')
                : st === 'active'
                  ? t('mobile.admin.beauty-events.active-f')
                  : t('mobile.admin.beauty-events.ended-f')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScreenState
        isLoading={q.isLoading}
        isError={q.isError}
        isEmpty={events.length === 0}
        emptyTitle={t('admin.beauty-events.empty')}
        onRetry={() => q.refetch()}
      >
        {events.map((e) => {
          const status = eventStatus(e);
          const price = e.price != null && Number(e.price) > 0;
          return (
            <View key={e.id} style={s.card}>
              <View style={{ flex: 1 }}>
                <Text style={s.cn}>{localize(e.nameJson, locale)}</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                  <Text style={s.cl}>
                    {e.startsAt
                      ? new Date(e.startsAt).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-GB')
                      : ''}
                  </Text>
                  <Text style={s.cl}>{e.location ?? ''}</Text>
                </View>
                <Text style={s.ca}>
                  {price
                    ? `${Number(e.price).toLocaleString()} ${t('misc.sar')}`
                    : t('admin.beauty-events.free')}
                </Text>
              </View>
              <View
                style={[
                  s.st,
                  {
                    backgroundColor:
                      status === 'upcoming'
                        ? '#dbeafe'
                        : status === 'active'
                          ? '#d1fae5'
                          : '#f3f4f6',
                  },
                ]}
              >
                <Text
                  style={[
                    s.stt,
                    {
                      color:
                        status === 'upcoming'
                          ? '#2563eb'
                          : status === 'active'
                            ? '#059669'
                            : '#6b7280',
                    },
                  ]}
                >
                  {status === 'upcoming'
                    ? t('mobile.admin.beauty-events.upcoming-badge')
                    : status === 'active'
                      ? t('mobile.admin.campaigns.active')
                      : t('mobile.admin.beauty-events.ended')}
                </Text>
              </View>
            </View>
          );
        })}
      </ScreenState>
    </ScrollView>
  );
}
const sc = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingTop: 40, paddingBottom: 60 },
  h: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center' },
  sub: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 16 },
  fb: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#f3f4f6' },
  ft: { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
    gap: 10,
  },
  cn: { fontSize: 15, fontWeight: '700', color: '#111827' },
  cl: { fontSize: 11, color: '#6b7280' },
  ca: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  st: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  stt: { fontSize: 11, fontWeight: '700' },
});
const s = sc;
