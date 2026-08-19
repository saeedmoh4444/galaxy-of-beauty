import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { localize } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';

interface FeedItem {
  id?: number;
  titleJson?: { ar?: string; en?: string };
  nameAr?: string;
  basePrice?: number;
}

interface AIFeedData {
  recommendations?: FeedItem[];
  wishlistItems?: FeedItem[];
  skinProfile?: { skinType?: string };
}

export default function AIFeedScreen(): JSX.Element {
  const { locale, t } = useLocale();
  const q = trpc.aiFeatures.personalizedFeed.useQuery();
  if (q.isLoading) return <SkeletonList count={4} />;
  const data = q.data as unknown as AIFeedData | null;
  const recommendations = data?.recommendations ?? [];
  const wishlistItems = data?.wishlistItems ?? [];
  const skinProfile = data?.skinProfile;
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={q.isRefetching}
          onRefresh={() => q.refetch()}
          colors={['#7c3aed']}
        />
      }
    >
      <Text style={styles.t}>{t('aiFeed.title')}</Text>
      {skinProfile && (
        <View style={styles.sc}>
          <Text style={styles.st}>{t('aiFeed.skin-profile')}</Text>
          <Text style={styles.sd}>{skinProfile.skinType}</Text>
        </View>
      )}
      {recommendations.length > 0 && <Text style={styles.stl}>{t('aiFeed.recommended')}</Text>}
      {recommendations.map((r) => (
        <View key={r.id} style={styles.card}>
          <Text style={styles.em}></Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.nm}>{localize(r.titleJson, locale) || r.nameAr}</Text>
            <Text style={styles.meta}>{t('aiFeed.price', { price: r.basePrice ?? 0 })}</Text>
          </View>
        </View>
      ))}
      {wishlistItems.length > 0 && <Text style={styles.stl}>{t('aiFeed.from-wishlist')}</Text>}
      {wishlistItems.map((w) => (
        <View key={w.id} style={styles.card}>
          <Text style={styles.em}>️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.nm}>{localize(w.titleJson, locale) || w.nameAr}</Text>
            <Text style={styles.meta}>{t('aiFeed.price', { price: w.basePrice ?? 0 })}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 20 },
  sc: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#c4b5fd',
  },
  st: { fontSize: 16, fontWeight: '700', color: '#7c3aed', marginBottom: 8 },
  sd: { fontSize: 14, color: '#374151' },
  stl: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10, marginTop: 8 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 6,
  },
  em: { fontSize: 28 },
  nm: { fontSize: 14, fontWeight: '600', color: '#111827' },
  meta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
});
