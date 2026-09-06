import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';
import { useLocale } from '@/components/LocaleProvider';
import { useAuthState } from '@/hooks/useAuthState';
import { trpc } from '@/lib/trpc-react';
import { localize } from '@galaxy/shared';

interface EventNameJson {
  ar?: string;
  en?: string;
}

interface BeautyEvent {
  id: number;
  eventType: string;
  nameJson?: EventNameJson;
  location?: string;
  startsAt: string;
  price?: number;
}

interface EventRegistration {
  id: number;
  eventId?: number;
  event?: { nameJson?: EventNameJson };
}

export default function BeautyEventsScreen(): JSX.Element {
  const { locale, t } = useLocale();
  const isAuthed = useAuthState();
  const typeLabels: Record<string, string> = {
    workshop: t('beautyEvents.type-workshop'),
    masterclass: t('beautyEvents.type-masterclass'),
    launch: t('beautyEvents.type-launch'),
    seasonal: t('beautyEvents.type-seasonal'),
  };
  const eventsQ = trpc.beautyEvents.upcoming.useQuery();
  const myRegsQ = trpc.beautyEvents.myRegistrations.useQuery(undefined, { enabled: isAuthed });
  const myRegs = (myRegsQ.data ?? []) as EventRegistration[];
  const registeredIds = new Set(myRegs.map((r) => r.eventId));

  const registerMut = trpc.beautyEvents.register.useMutation({
    onSuccess: () => {
      void eventsQ.refetch();
    },
  });
  const cancelMut = trpc.beautyEvents.cancelRegistration.useMutation({
    onSuccess: () => {
      void eventsQ.refetch();
    },
  });
  const handleRegister = (id: number) => {
    registerMut.mutate({ eventId: id });
  };
  const handleCancel = (id: number) => {
    cancelMut.mutate({ eventId: id });
  };

  if (eventsQ.isLoading) return <SkeletonList count={4} />;
  if (eventsQ.isError)
    return <ErrorAlert message={t('beautyEvents.load-error')} onRetry={() => eventsQ.refetch()} />;

  const items: BeautyEvent[] = Array.isArray(eventsQ.data) ? eventsQ.data : [];

  return (
    <ScrollView
      style={s.c}
      contentContainerStyle={s.i}
      refreshControl={
        <RefreshControl
          refreshing={eventsQ.isRefetching || myRegsQ.isRefetching}
          onRefresh={() => {
            void eventsQ.refetch();
            void myRegsQ.refetch();
          }}
          colors={['#db2777']}
        />
      }
    >
      <Text style={s.t}>{t('beautyEvents.title')}</Text>
      <Text style={s.sub}>{t('beautyEvents.subtitle')}</Text>

      {myRegs.length > 0 && (
        <View
          style={{ backgroundColor: '#ecfdf5', borderRadius: 12, padding: 12, marginBottom: 16 }}
        >
          <Text style={{ fontWeight: '700', color: '#059669', marginBottom: 4 }}>
            {t('beautyEvents.registered-count', { count: myRegs.length })}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
            {myRegs.map((r) => (
              <View
                key={r.id}
                style={{
                  backgroundColor: '#d1fae5',
                  borderRadius: 12,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                }}
              >
                <Text style={{ fontSize: 11, color: '#047857' }}>
                  {r.event?.nameJson ? localize(r.event.nameJson, locale) : ''}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {items.length === 0 && (
        <View style={{ alignItems: 'center', padding: 30 }}>
          <Text style={{ fontSize: 40 }}></Text>
          <Text style={{ color: '#6b7280', marginTop: 8 }}>{t('beautyEvents.empty')}</Text>
        </View>
      )}

      {items.map((e) => {
        const isReg = registeredIds.has(e.id);
        return (
          <View key={e.id} style={s.card}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 36 }}>{''}</Text>
              <Text style={{ fontWeight: '800', fontSize: 16, marginTop: 8 }}>
                {e.nameJson ? localize(e.nameJson, locale) : ''}
              </Text>
              <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                {typeLabels[e.eventType]}
              </Text>
              <Text style={{ fontSize: 12, color: '#6b7280' }}>
                {e.location} ·{' '}
                {new Date(e.startsAt).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US')}
              </Text>
              <Text style={{ fontWeight: '800', fontSize: 20, color: '#db2777', marginTop: 6 }}>
                {e.price ? t('beautyEvents.price', { price: e.price }) : t('beautyEvents.free')}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => (isReg ? handleCancel(e.id) : handleRegister(e.id))}
              style={[s.btn, isReg && { backgroundColor: '#e5e7eb' }]}
            >
              <Text style={[s.btnText, isReg && { color: '#374151' }]}>
                {isReg ? t('beautyEvents.cancel') : t('beautyEvents.register')}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 8 },
  sub: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 12 },
  btn: {
    backgroundColor: '#db2777',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  btnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
