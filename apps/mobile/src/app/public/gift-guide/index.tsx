import type { JSX } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

// WIRING BUG (pre-existing): this screen calls giftQuiz.questions but
// renders gift-guide fields (titleAr/occasionAr/…). The questions rows
// only carry questionAr/questionEn/options, so every guide field renders
// empty at runtime. The proper fix is a recommendations-list procedure
// (giftQuizRecommendation has titleAr/occasionAr/priceRange/minPrice) —
// tracked as a follow-up; this interface keeps the cast compiling until
// then, with the question fields included for overlap.
interface GiftGuide {
  id?: string | number;
  emoji?: string;
  titleAr?: string;
  occasionAr?: string;
  priceRange?: string;
  minPrice?: number;
  questionAr?: string;
  questionEn?: string;
  options?: Array<{ key: string; labelAr: string; labelEn: string; tags?: string[] }>;
}

export default function GiftGuideScreen(): JSX.Element {
  const { t } = useLocale();
  const router = useRouter();
  const guidesQ = trpc.giftQuiz.questions.useQuery();

  if (guidesQ.isLoading) return <SkeletonList count={4} />;
  if (guidesQ.isError)
    return (
      <ErrorAlert
        message={t('mobile.public.gift-guide.load-error')}
        onRetry={() => guidesQ.refetch()}
      />
    );

  const items = (guidesQ.data ?? []) as GiftGuide[];

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={guidesQ.isRefetching}
          onRefresh={async () => {
            await guidesQ.refetch();
          }}
          colors={['#c2255c']}
        />
      }
    >
      <Text style={styles.t}>{t('mobile.public.gift-guide.title')}</Text>
      <Text style={styles.sub}>{t('mobile.public.gift-guide.subtitle')}</Text>
      {items.length === 0 ? (
        <Text style={styles.e}>{t('mobile.public.gift-guide.empty')}</Text>
      ) : (
        items.map((g) => (
          <View key={g.id} style={styles.card}>
            <Text style={styles.guideEmoji}>{(g.emoji as string) ?? ''}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.guideTitle}>{g.titleAr as string}</Text>
              <Text style={styles.guideOccasion}>{g.occasionAr as string}</Text>
              <Text style={styles.guidePrice}>
                {t('mobile.public.gift-guide.from-price', {
                  price: (g.priceRange as string) ?? (g.minPrice as number)?.toLocaleString() ?? '',
                })}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.viewBtn}
              onPress={() => router.push('/public/gift-quiz' as never)}
            >
              <Text style={styles.viewBtnText}>{t('mobile.public.gift-guide.view')}</Text>
            </TouchableOpacity>
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
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  guideEmoji: { fontSize: 32 },
  guideTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
  guideOccasion: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  guidePrice: { fontSize: 13, fontWeight: '700', color: '#db2777', marginTop: 4 },
  viewBtn: {
    backgroundColor: '#db2777',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  viewBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
