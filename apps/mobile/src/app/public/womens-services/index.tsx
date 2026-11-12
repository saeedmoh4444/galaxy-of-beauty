import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';
import { useState } from 'react';
import type { JSX } from 'react';
import { useRouter } from 'expo-router';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';
import { useAuthState } from '@/hooks/useAuthState';
import { useToast } from '@/components/Toast';

interface WomensServiceItem {
  id: string;
  nameAr?: string;
  nameEn?: string;
  price?: number;
  durationMin?: number;
  emoji?: string;
}

// v4 uuid (no crypto module on RN — Math.random entropy is fine for
// client idempotency keys; same helper as the W2-3 booking detail screen).
function randomUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function WomensServicesScreen(): JSX.Element {
  const { t } = useLocale();
  const router = useRouter();
  const isAuthed = useAuthState();
  const { showToast } = useToast();
  const catsQ = trpc.womensServices.categories.useQuery();
  const [selectedCatKey, setSelectedCatKey] = useState<string | null>(null);
  const catQ = trpc.womensServices.byCategory.useQuery(
    { category: selectedCatKey ?? '' },
    { enabled: !!selectedCatKey },
  );
  const [selectedService, setSelectedService] = useState<WomensServiceItem | null>(null);
  const addressesQ = trpc.addresses.list.useQuery(undefined, { enabled: isAuthed });
  const [addressId, setAddressId] = useState<number | null>(null);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const bookMut = trpc.womensServices.book.useMutation({
    onSuccess: (r) => {
      setResult(r as Record<string, unknown>);
      showToast('success', t('booking.created-success'));
    },
    onError: () => showToast('error', t('booking.create-failed')),
  });

  if (catsQ.isLoading) return <SkeletonList count={6} />;
  if (catsQ.isError)
    return (
      <ErrorAlert
        message={t('mobile.public.womens-services.load-error')}
        onRetry={() => catsQ.refetch()}
      />
    );

  const categories = (catsQ.data as unknown as Record<string, unknown>[] | undefined) ?? [];
  const cat = catQ.data as unknown as
    { nameAr?: string; emoji?: string; subServices?: WomensServiceItem[] } | undefined;
  const addresses = (addressesQ.data as unknown as Array<{ id: number; label?: string }>) ?? [];

  const handleBook = () => {
    if (!isAuthed) {
      router.push('/login' as never);
      return;
    }
    if (!selectedService || !selectedCatKey || !addressId) {
      showToast('error', t('booking.select-service-address'));
      return;
    }
    // W2-9 — tomorrow 10:00 defaults (same convention as the web wizard).
    const start = new Date(Date.now() + 86_400_000);
    start.setHours(10, 0, 0, 0);
    bookMut.mutate({
      serviceId: selectedService.id,
      category: selectedCatKey,
      addressId,
      startAt: start.toISOString(),
      endAt: new Date(start.getTime() + (selectedService.durationMin ?? 60) * 60_000).toISOString(),
      idempotencyKey: randomUuid(),
    });
  };

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={catsQ.isRefetching}
          onRefresh={async () => {
            await catsQ.refetch();
          }}
          colors={['#c2255c']}
        />
      }
    >
      <Text style={styles.t}>{t('mobile.public.womens-services.title')}</Text>
      <Text style={styles.sub}>{t('mobile.public.womens-services.subtitle')}</Text>
      <View style={styles.catGrid}>
        {categories.map((cat: Record<string, unknown>) => (
          <TouchableOpacity
            key={cat.key as string}
            onPress={() => {
              setSelectedCatKey(cat.key as string);
              setSelectedService(null);
              setResult(null);
            }}
            style={[styles.catCard, selectedCatKey === cat.key && styles.catActive]}
          >
            <Text style={styles.catEmoji}>{(cat.emoji as string) ?? ''}</Text>
            <Text style={styles.catLabel}>{cat.nameAr as string}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {cat && selectedCatKey && (
        <View style={styles.servicesSection}>
          <Text style={styles.sectionTitle}>
            {cat.emoji ?? ''} {cat.nameAr ?? ''}
          </Text>
          {(cat.subServices ?? []).map((s) => (
            <TouchableOpacity
              key={s.id}
              style={[styles.svcCard, selectedService?.id === s.id && styles.svcActive]}
              onPress={() => {
                setSelectedService(s);
                setResult(null);
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.svcName}>{s.nameAr}</Text>
                <Text style={styles.svcDuration}>
                  {t('mobile.public.service-detail.duration', { minutes: s.durationMin ?? 0 })}
                </Text>
              </View>
              <Text style={styles.svcPrice}>
                {(s.price ?? 0).toLocaleString()} {t('misc.sar')}
              </Text>
            </TouchableOpacity>
          ))}

          {selectedService && (
            <View style={styles.bookBox}>
              <Text style={styles.bookTitle}>{selectedService.nameAr}</Text>
              {isAuthed ? (
                <>
                  <Text style={styles.bookLabel}>{t('booking.choose-address')}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {addresses.map((a) => (
                        <TouchableOpacity
                          key={a.id}
                          onPress={() => setAddressId(a.id)}
                          style={[styles.addrChip, addressId === a.id && styles.addrActive]}
                        >
                          <Text style={styles.addrText}>{a.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                  <TouchableOpacity
                    style={styles.bookBtn}
                    onPress={handleBook}
                    disabled={bookMut.isPending}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.bookBtnText}>{t('booking.confirm')}</Text>
                  </TouchableOpacity>
                  {result?.booked ? (
                    <Text style={styles.bookResult}>
                      {t('booking.code')}: {result.bookingCode as string}
                    </Text>
                  ) : null}
                </>
              ) : (
                <TouchableOpacity
                  style={styles.bookBtn}
                  onPress={() => router.push('/login' as never)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.bookBtnText}>{t('mobile.auth.loginTitle')}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#be185d', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  catCard: {
    width: '30%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  catActive: { borderColor: '#be185d', backgroundColor: '#fdf2f8' },
  catEmoji: { fontSize: 30 },
  catLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#111827',
    marginTop: 6,
    textAlign: 'center',
  },
  servicesSection: { backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  svcCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  svcActive: { backgroundColor: '#fdf2f8' },
  svcName: { fontSize: 13, color: '#374151' },
  svcDuration: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  svcPrice: { fontSize: 13, fontWeight: '600', color: '#be185d' },
  bookBox: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
    gap: 8,
  },
  bookTitle: { fontSize: 14, fontWeight: '700', color: '#111827' },
  bookLabel: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  addrChip: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  addrActive: { borderColor: '#be185d', backgroundColor: '#fdf2f8' },
  addrText: { fontSize: 12, color: '#374151' },
  bookBtn: {
    backgroundColor: '#be185d',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 6,
  },
  bookBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  bookResult: { fontSize: 13, color: '#047857', textAlign: 'center', marginTop: 4 },
});
