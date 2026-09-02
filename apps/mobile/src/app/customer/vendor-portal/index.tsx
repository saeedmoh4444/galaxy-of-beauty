import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { useAuthState } from '@/hooks/useAuthState';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface VendorDashboard {
  totalProducts?: number;
  totalSales?: number;
  totalRevenue?: number;
  revenue?: number;
  pendingOrders?: number;
  rating?: number;
}

interface VendorProduct {
  id: number;
  name?: string;
  nameAr?: string;
  price?: number;
  stock?: number;
  sales?: number;
  emoji?: string;
  active?: boolean;
}

export default function VendorPortalScreen(): JSX.Element {
  const { t, locale } = useLocale();
  const isAuthed = useAuthState();
  const dashQ = trpc.vendorPortal.dashboard.useQuery(undefined, { enabled: isAuthed });
  const productsQ = trpc.vendorPortal.myProducts.useQuery(undefined, { enabled: isAuthed });
  const dash = dashQ.data as VendorDashboard | null;
  const products: VendorProduct[] =
    (productsQ.data as unknown as VendorProduct[] | undefined) ?? [];

  const deleteMut = trpc.vendorPortal.deleteProduct.useMutation({
    onSuccess: () => {
      void dashQ.refetch();
      void productsQ.refetch();
    },
  });
  const remove = (id: number) => {
    deleteMut.mutate({ id });
  };
  if (dashQ.isLoading || productsQ.isLoading) return <SkeletonList count={4} />;
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={dashQ.isRefetching || productsQ.isRefetching}
          onRefresh={() => {
            void dashQ.refetch();
            void productsQ.refetch();
          }}
          colors={['#7c3aed']}
        />
      }
    >
      <Text style={styles.t}>{t('mobile.vendorPortal.title')}</Text>
      <View style={styles.kr}>
        <View style={styles.k}>
          <Text style={styles.ke}></Text>
          <Text style={styles.kv}>{dash?.totalProducts ?? 0}</Text>
          <Text style={styles.kl}>{t('mobile.vendorPortal.products')}</Text>
        </View>
        <View style={styles.k}>
          <Text style={styles.ke}></Text>
          <Text style={[styles.kv, { color: '#059669' }]}>
            {(dash?.totalRevenue ?? 0)?.toLocaleString(locale === 'en' ? 'en-GB' : 'ar-SA')}
          </Text>
          <Text style={styles.kl}>{t('mobile.vendorPortal.sar')}</Text>
        </View>
      </View>
      {products.map((p) => (
        <View key={p.id} style={styles.card}>
          <Text style={styles.em}></Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.nm}>{p.name}</Text>
            <Text style={styles.meta}>
              {t('marketing.compare.price-sar', {
                price: p.price?.toLocaleString(locale === 'en' ? 'en-GB' : 'ar-SA') ?? '',
              })}
            </Text>
          </View>
          <TouchableOpacity onPress={() => remove(p.id)}>
            <Text style={styles.del}>️</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 20 },
  kr: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  k: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center' },
  ke: { fontSize: 28, marginBottom: 4 },
  kv: { fontSize: 22, fontWeight: '800', color: '#111827' },
  kl: { fontSize: 11, color: '#9ca3af' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  em: { fontSize: 28 },
  nm: { fontSize: 14, fontWeight: '600', color: '#111827' },
  meta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  del: { fontSize: 18 },
});
