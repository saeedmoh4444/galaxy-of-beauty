import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface GroupBooking {
  id?: number;
  organizerId?: number;
  name?: string;
  theme?: string | null;
  status?: string;
  totalAmount?: number;
  createdAt?: string;
  members?: Array<Record<string, unknown>>;
}

export default function AdminGroupBookingsScreen(): JSX.Element {
  const { t, locale } = useLocale();
  const q = trpc.groupBookings.listAll.useQuery({ page: 1, limit: 20 });
  const groups = (q.data as unknown as { items?: GroupBooking[] } | null)?.items ?? [];

  return (
    <ScrollView style={s.c} contentContainerStyle={s.i}>
      <Text style={s.h}>{t('mobile.admin.group-bookings.title')}</Text>
      <Text style={s.sub}>{t('admin.group-bookings.subtitle')}</Text>
      <ScreenState
        isLoading={q.isLoading}
        isError={q.isError}
        isEmpty={groups.length === 0}
        emptyTitle={t('admin.group-bookings.empty')}
        onRetry={() => q.refetch()}
      >
        {groups.map((g) => {
          const confirmed = g.status !== 'PENDING';
          const memberCount = g.members?.length ?? 0;
          return (
            <View key={g.id} style={s.card}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Text style={s.cn}>{g.name}</Text>
                <View style={[s.st, { backgroundColor: confirmed ? '#d1fae5' : '#fef3c7' }]}>
                  <Text style={[s.stt, { color: confirmed ? '#059669' : '#d97706' }]}>
                    {confirmed
                      ? t('mobile.admin.group-bookings.confirmed')
                      : t('mobile.admin.group-bookings.pending')}
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                <Text style={s.cl}>#{g.organizerId ?? 0}</Text>
                <Text style={s.cl}>
                  {t('mobile.admin.group-bookings.people', { count: memberCount })}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
                <Text style={s.cl}>
                  {g.createdAt
                    ? new Date(g.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-GB')
                    : ''}
                </Text>
                <Text style={s.cl}>{g.theme ?? ''}</Text>
              </View>
              <Text style={s.cp}>
                {(g.totalAmount ?? 0).toLocaleString()} {t('misc.sar')}
              </Text>
            </View>
          );
        })}
      </ScreenState>
    </ScrollView>
  );
}
const sc = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#f9fafb' },
  i: { padding: 16, paddingTop: 40, paddingBottom: 60 },
  h: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center' },
  sub: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10 },
  cn: { fontSize: 16, fontWeight: '700', color: '#111827' },
  cl: { fontSize: 12, color: '#6b7280' },
  cp: { fontSize: 20, fontWeight: '800', color: '#7c3aed', marginTop: 8 },
  st: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  stt: { fontSize: 11, fontWeight: '700' },
});
const s = sc;
