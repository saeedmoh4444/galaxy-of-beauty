import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface LookProduct {
  id?: number;
  emoji?: string;
  nameAr?: string;
  brand?: string;
  price?: number;
}

interface Look {
  id?: number;
  imageUrl?: string;
  titleAr?: string;
  technician?: string;
  products?: LookProduct[];
}

export default function ShopTheLookScreen(): JSX.Element {
  const { t } = useLocale();
  const looksQ = trpc.lookbook.current.useQuery();

  if (looksQ.isLoading) return <SkeletonList count={4} />;

  const looks = (looksQ.data as unknown as Look[] | null) ?? [];

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={looksQ.isRefetching}
          onRefresh={() => looksQ.refetch()}
          colors={['#ec4899']}
        />
      }
    >
      <Text style={styles.t}>{t('mobile.public.shop-the-look.title')}</Text>
      <Text style={styles.sub}>{t('mobile.public.shop-the-look.subtitle')}</Text>
      {looks.length === 0 ? (
        <Text style={styles.e}>{t('mobile.public.shop-the-look.empty')}</Text>
      ) : (
        looks.map((l) => (
          <View key={l.id} style={styles.card}>
            <View style={styles.lookHeader}>
              {l.imageUrl ? (
                <Image source={{ uri: l.imageUrl }} style={styles.lookImage} />
              ) : (
                <View style={styles.lookPlaceholder}>
                  <Text style={{ fontSize: 32 }}>️</Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.lookTitle}>{l.titleAr ?? ''}</Text>
                <Text style={styles.lookBy}>‍ {l.technician ?? ''}</Text>
              </View>
            </View>
            <Text style={styles.productsTitle}>{t('mobile.public.shop-the-look.products')}</Text>
            {l.products?.map((p) => (
              <View key={p.id} style={styles.product}>
                <Text style={styles.prodEmoji}>{p.emoji ?? ''}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.prodName}>{p.nameAr ?? ''}</Text>
                  <Text style={styles.prodBrand}>{p.brand ?? ''}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.prodPrice}>
                    {t('mobile.public.currency', { price: (p.price ?? 0).toLocaleString() })}
                  </Text>
                  <TouchableOpacity style={styles.buyBtn}>
                    <Text style={styles.buyBtnText}>{t('mobile.public.shop-the-look.buy')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12 },
  lookHeader: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  lookImage: { width: 80, height: 80, borderRadius: 12 },
  lookPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lookTitle: { fontSize: 15, fontWeight: '600', color: '#111827' },
  lookBy: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  productsTitle: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 8 },
  product: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 10,
    marginBottom: 6,
  },
  prodEmoji: { fontSize: 24 },
  prodName: { fontSize: 13, fontWeight: '600', color: '#111827' },
  prodBrand: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  prodPrice: { fontSize: 14, fontWeight: '700', color: '#db2777' },
  buyBtn: {
    backgroundColor: '#db2777',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 2,
  },
  buyBtnText: { color: '#fff', fontSize: 11, fontWeight: '600' },
});
