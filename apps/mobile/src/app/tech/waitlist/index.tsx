import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';
import { localize } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';

// The waitlist router has no tech-side entry list (notifyNext/claim take an
// entryId but nothing lists entries for a technician). Mirrors the web page:
// the pending-requests listing is bookings.getTechnicianPending (REQUESTED
// bookings).
export default function TechWaitlistScreen(): JSX.Element {
  const { locale, t } = useLocale();
  const pending = trpc.bookings.getTechnicianPending.useQuery();
  const bookings = pending.data ?? [];

  return (
    <ScreenState
      isLoading={pending.isLoading}
      isError={pending.isError}
      isEmpty={bookings.length === 0}
      emptyTitle={t('tech.waitlist.empty')}
      errorMessage={t('tech.bookings.load-error')}
      onRetry={() => pending.refetch()}
    >
      <ScrollView style={s.c} contentContainerStyle={s.i}>
        <Text style={s.h}>{t('mobile.tech.waitlist.title')}</Text>
        <Text style={s.sub}>{t('mobile.tech.waitlist.subtitle')}</Text>
        {bookings.map((b) => (
          <View key={b.id} style={s.card}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={[s.pos, { backgroundColor: '#fef3c7' }]}>
                <Text style={[s.pn, { color: '#b45309' }]}>{b.id}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.cn}>
                  {localize(b.service?.titleJson, locale) ||
                    t('tech.waitlist.booking-ref', { id: b.id })}
                </Text>
                <Text style={s.cd}>
                  {new Date(b.startAt).toLocaleDateString(locale === 'en' ? 'en-GB' : 'ar-SA', {
                    day: 'numeric',
                    month: 'long',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  · {b.bookingCode}
                  {b.customer?.name ? ` · ${b.customer.name}` : ''}
                </Text>
              </View>
              <Text style={s.badge}>{t('tech.waitlist.pending')}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </ScreenState>
  );
}
const sc = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#f9fafb' },
  i: { padding: 16, paddingTop: 40, paddingBottom: 60 },
  h: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center' },
  sub: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10 },
  pos: { borderRadius: 20, width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  pn: { fontSize: 13, fontWeight: '800', color: '#374151' },
  cn: { fontSize: 15, fontWeight: '700', color: '#111827' },
  cd: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  badge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#b45309',
    backgroundColor: '#fef3c7',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
});
const s = sc;
