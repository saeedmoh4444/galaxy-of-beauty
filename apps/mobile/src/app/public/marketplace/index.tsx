import type { JSX } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import type { TranslationKey } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';

interface MarketProduct {
  id?: number;
  emoji?: string;
  nameAr?: string;
  titleAr?: string;
  price?: number;
}

interface FallbackCard {
  emoji: string;
  titleKey: TranslationKey;
  descKey: TranslationKey;
}

const FALLBACK_CARDS: FallbackCard[] = [
  {
    emoji: '🧴',
    titleKey: 'mobile.public.marketplace.care.title',
    descKey: 'mobile.public.marketplace.care.desc',
  },
  {
    emoji: '💄',
    titleKey: 'mobile.public.marketplace.makeup.title',
    descKey: 'mobile.public.marketplace.makeup.desc',
  },
  {
    emoji: '💇',
    titleKey: 'mobile.public.marketplace.hair.title',
    descKey: 'mobile.public.marketplace.hair.desc',
  },
  {
    emoji: '💅',
    titleKey: 'mobile.public.marketplace.nails.title',
    descKey: 'mobile.public.marketplace.nails.desc',
  },
];

export default function MarketplaceScreen(): JSX.Element {
  const { t } = useLocale();
  const router = useRouter();
  const productsQ = trpc.marketplace.products.useQuery({});
  const products: MarketProduct[] =
    (productsQ.data as unknown as { items?: MarketProduct[] } | undefined)?.items ?? [];
  if (productsQ.isLoading) return <SkeletonList count={4} />;
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={productsQ.isRefetching}
          onRefresh={async () => {
            await productsQ.refetch();
          }}
          colors={['#c2255c']}
        />
      }
    >
      <Text style={styles.t}>{t('mobile.public.marketplace.title')}</Text>
      <View style={styles.grid}>
        {products.length === 0
          ? FALLBACK_CARDS.map((item, i) => (
              <View key={i} style={styles.card}>
                <View style={styles.ci}>
                  <Text style={styles.ce}>{item.emoji}</Text>
                </View>
                <Text style={styles.ct}>{t(item.titleKey)}</Text>
                <Text style={styles.cd}>{t(item.descKey)}</Text>
              </View>
            ))
          : products.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={styles.card}
                onPress={() => router.push('/customer/marketplace' as never)}
              >
                <View style={styles.ci}>
                  <Text style={styles.ce}>{p.emoji ?? ''}</Text>
                </View>
                <Text style={styles.ct}>{p.nameAr ?? p.titleAr}</Text>
                <Text style={styles.cp}>
                  {(p.price ?? 0).toLocaleString()} {t('misc.sar')}
                </Text>
              </TouchableOpacity>
            ))}
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 10,
    overflow: 'hidden',
  },
  ci: {
    height: 120,
    borderRadius: 12,
    backgroundColor: '#fce7f3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  ce: { fontSize: 40 },
  ct: { fontSize: 13, fontWeight: '700', color: '#111827', textAlign: 'right' },
  cd: { fontSize: 11, color: '#6b7280', textAlign: 'right', marginTop: 2 },
  cp: { fontSize: 14, fontWeight: '800', color: '#db2777', textAlign: 'right', marginTop: 4 },
});
