import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { DEFAULT_SAUDI_CITY } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';

interface GeofenceOffer {
  id?: number;
  emoji?: string;
  titleAr?: string;
  salonName?: string;
  distance?: string;
  expiresIn?: string;
}

export default function GeofenceOffersScreen(): JSX.Element {
  const { t } = useLocale();
  const q = trpc.geofenceOffers.nearMe.useQuery({
    city: DEFAULT_SAUDI_CITY /* TODO: from user location */,
  });
  const offers: GeofenceOffer[] = (q.data as unknown as GeofenceOffer[] | undefined) ?? [];
  const optIn = () => {
    // No opt-in mutation exists on the server; refresh the offers list instead
    void q.refetch();
  };
  if (q.isLoading) return <SkeletonList count={4} />;
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={q.isRefetching}
          onRefresh={() => q.refetch()}
          colors={['#059669']}
        />
      }
    >
      <Text style={styles.t}>{t('geofenceOffers.title')}</Text>
      <TouchableOpacity onPress={optIn} style={styles.ob}>
        <Text style={styles.ot}>{t('geofenceOffers.opt-in')}</Text>
      </TouchableOpacity>
      {offers.map((o) => (
        <View key={o.id} style={styles.card}>
          <Text style={styles.oe}>{o.emoji ?? ''}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.otit}>{o.titleAr ?? ''}</Text>
            <Text style={styles.om}>
              {o.salonName ?? ''} · {o.distance ?? ''}
            </Text>
          </View>
          <View style={styles.ex}>
            <Text style={styles.ext}> {o.expiresIn ?? ''}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfdf5' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#059669', textAlign: 'center', marginBottom: 16 },
  ob: {
    backgroundColor: '#059669',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  ot: { color: '#fff', fontSize: 14, fontWeight: '600' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  oe: { fontSize: 36 },
  otit: { fontSize: 14, fontWeight: '600', color: '#111827' },
  om: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  ex: { backgroundColor: '#fee2e2', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  ext: { fontSize: 11, fontWeight: '700', color: '#dc2626' },
});
