import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface ClinicItem {
  id?: number;
  storeName?: string;
  storeSlug?: string;
  clinicType?: string | null;
  consultationPrice?: number;
  ratingAvg?: number;
  totalReviews?: number;
}

export default function ClinicsScreen(): JSX.Element {
  const { t } = useLocale();
  const router = useRouter();
  const clinicsQ = trpc.clinics.list.useQuery({ page: 1, limit: 50 });

  const clinics: ClinicItem[] = Array.isArray(
    (clinicsQ.data as unknown as { items?: ClinicItem[] } | null)?.items,
  )
    ? ((clinicsQ.data as unknown as { items: ClinicItem[] }).items as ClinicItem[])
    : [];

  if (clinicsQ.isLoading) return <SkeletonList count={6} />;
  if (clinicsQ.isError)
    return (
      <ErrorAlert message={t('mobile.clinics.load-error')} onRetry={() => clinicsQ.refetch()} />
    );

  return (
    <ScrollView
      style={s.c}
      contentContainerStyle={s.i}
      refreshControl={
        <RefreshControl refreshing={clinicsQ.isRefetching} onRefresh={() => clinicsQ.refetch()} />
      }
    >
      <Text style={s.title}>{t('mobile.clinics.title')}</Text>
      {clinics.map((clinic) => (
        <TouchableOpacity
          key={clinic.id}
          style={s.card}
          onPress={() => router.push(`/customer/clinics/${clinic.storeSlug ?? ''}`)}
        >
          <View style={s.icon}>
            <Text style={s.iconText}>🩺</Text>
          </View>
          <View style={s.body}>
            <Text style={s.name}>{clinic.storeName ?? ''}</Text>
            <Text style={s.meta}>
              {t(`clinics.treatment.${clinic.clinicType ?? ''}` as never)} ·{' '}
              {t('mobile.clinics.price', { price: Number(clinic.consultationPrice ?? 0) })}
            </Text>
            <Text style={s.badge}>{t('mobile.clinics.verified')}</Text>
          </View>
        </TouchableOpacity>
      ))}
      {clinics.length === 0 && <Text style={s.empty}>{t('mobile.clinics.empty')}</Text>}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fff' },
  i: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 16 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: { fontSize: 22 },
  body: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: '#111827' },
  meta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  badge: {
    fontSize: 11,
    color: '#047857',
    backgroundColor: '#d1fae5',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    marginTop: 4,
    overflow: 'hidden',
  },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 24 },
});
