import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface FeaturedTech {
  name?: string;
  rating?: number;
  specialtyAr?: string;
}

interface PastFeaturedTech {
  name?: string;
  month?: string;
}

export default function FeaturedTechScreen(): JSX.Element {
  const { t } = useLocale();
  const currentQ = trpc.featuredTech.current.useQuery();
  const pastQ = trpc.featuredTech.past.useQuery();

  if (currentQ.isLoading || pastQ.isLoading) return <SkeletonList count={4} />;

  const tech = (currentQ.data as unknown as FeaturedTech | undefined) ?? null;
  const past = (pastQ.data ?? []) as PastFeaturedTech[];

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={currentQ.isRefetching || pastQ.isRefetching}
          onRefresh={() => {
            void currentQ.refetch();
            void pastQ.refetch();
          }}
          colors={['#f59e0b']}
        />
      }
    >
      <Text style={styles.t}>{t('mobile.public.featured-tech.title')}</Text>
      {tech && (
        <View style={styles.featured}>
          <Text style={styles.fEmoji}>‍</Text>
          <Text style={styles.fName}>{tech.name ?? ''}</Text>
          <Text style={styles.fMeta}>
            {tech.rating ?? 0} · {tech.specialtyAr ?? ''}
          </Text>
        </View>
      )}
      <Text style={styles.sectionTitle}>{t('mobile.public.featured-tech.past-title')}</Text>
      {past.length === 0 ? (
        <Text style={styles.e}>{t('mobile.public.featured-tech.empty')}</Text>
      ) : (
        past.map((p, i) => (
          <View key={i} style={styles.card}>
            <Text style={styles.avatar}>‍</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{p.name ?? ''}</Text>
              <Text style={styles.month}>{p.month ?? ''}</Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fffbeb' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#d97706', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 20 },
  featured: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#fcd34d',
  },
  fEmoji: { fontSize: 56 },
  fName: { fontSize: 20, fontWeight: '800', color: '#111827', marginTop: 8 },
  fMeta: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 6,
  },
  avatar: { fontSize: 32 },
  name: { fontSize: 14, fontWeight: '600', color: '#111827' },
  month: { fontSize: 12, color: '#6b7280', marginTop: 2 },
});
