import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';
import { useAuthState } from '@/hooks/useAuthState';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

export default function NailBarScreen(): JSX.Element {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { t } = useLocale();
  const isAuthed = useAuthState();

  const detailQ = trpc.nailBars.detail.useQuery({ slug: slug ?? '' }, { enabled: !!slug });
  const bar = detailQ.data as Record<string, any> | undefined;

  const window_ = useMemo(() => {
    const from = new Date().toISOString();
    const to = new Date(Date.now() + 30 * 86_400_000).toISOString();
    return { from, to };
  }, []);
  const slotsQ = trpc.nailBars.slots.useQuery(
    { nailBarId: bar?.id ?? 0, from: window_.from, to: window_.to },
    { enabled: !!bar?.id },
  );
  const bookMut = trpc.nailBars.bookSlot.useMutation({
    onSuccess: () => slotsQ.refetch(),
  });

  const slots = (slotsQ.data ?? []) as Array<Record<string, any>>;

  if (detailQ.isLoading) return <SkeletonList count={4} />;
  if (detailQ.isError || !bar)
    return (
      <ErrorAlert message={t('mobile.nailBars.load-error')} onRetry={() => detailQ.refetch()} />
    );

  return (
    <ScrollView
      style={s.c}
      contentContainerStyle={s.i}
      refreshControl={
        <RefreshControl refreshing={slotsQ.isRefetching} onRefresh={() => slotsQ.refetch()} />
      }
    >
      <Text style={s.title}>{bar.storeName ?? ''}</Text>
      <Text style={s.meta}>
        {bar.nailBarType ? t(`nailBars.type.${bar.nailBarType}` as never) : ''} ·{' '}
        {bar.nailBarCity ?? ''} · {bar.nailBarAddress ?? ''}
      </Text>

      <Text style={[s.section, { marginTop: 16 }]}>{t('mobile.nailBars.slots')}</Text>
      {slots.map((slot) => (
        <View key={slot.id} style={s.card}>
          <View style={s.body}>
            <Text style={s.name}>
              {new Date(slot.startAt).toLocaleString()} → {new Date(slot.endAt).toLocaleString()}
            </Text>
            <Text style={s.meta}>{t('mobile.nailBars.spots-left', { n: slot.spotsLeft })}</Text>
          </View>
          <TouchableOpacity
            style={[s.btn, (slot.spotsLeft <= 0 || !isAuthed) && s.btnDisabled]}
            disabled={slot.spotsLeft <= 0 || !isAuthed || bookMut.isPending}
            onPress={() => bookMut.mutate({ slotId: slot.id })}
          >
            <Text style={s.btnText}>
              {slot.spotsLeft <= 0 ? t('mobile.nailBars.full') : t('mobile.nailBars.book')}
            </Text>
          </TouchableOpacity>
        </View>
      ))}
      {slots.length === 0 && <Text style={s.empty}>{t('mobile.nailBars.no-slots')}</Text>}
      <Text style={s.hint}>{t('mobile.nailBars.pay-at-venue')}</Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fff' },
  i: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '800', color: '#111827' },
  meta: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  section: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  body: { flex: 1 },
  name: { fontSize: 14, fontWeight: '700', color: '#111827' },
  btn: {
    backgroundColor: '#db2777',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  btnDisabled: { backgroundColor: '#e5e7eb' },
  btnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 16 },
  hint: { fontSize: 11, color: '#9ca3af', marginTop: 12, textAlign: 'center' },
});
