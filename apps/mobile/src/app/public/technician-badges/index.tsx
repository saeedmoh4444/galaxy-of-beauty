import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface TechBadge {
  id?: number;
  emoji?: string;
  nameAr?: string;
  descAr?: string;
  technicianCount?: number;
  rarity?: string;
}

export default function TechnicianBadgesScreen(): JSX.Element {
  const { t } = useLocale();
  const q = trpc.technicianBadges.list.useQuery();

  if (q.isLoading) return <SkeletonList count={4} />;

  const badges = (q.data as unknown as TechBadge[] | null) ?? [];

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={q.isRefetching}
          onRefresh={() => q.refetch()}
          colors={['#8b5cf6']}
        />
      }
    >
      <Text style={styles.t}>{t('mobile.public.technician-badges.title')}</Text>
      <Text style={styles.sub}>{t('mobile.public.technician-badges.subtitle')}</Text>
      {badges.length === 0 ? (
        <Text style={styles.e}>{t('mobile.public.technician-badges.empty')}</Text>
      ) : (
        badges.map((b) => (
          <View key={b.id} style={styles.card}>
            <Text style={styles.badgeEmoji}>{b.emoji ?? ''}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.badgeName}>{b.nameAr ?? ''}</Text>
              <Text style={styles.badgeDesc}>{b.descAr ?? ''}</Text>
              <Text style={styles.badgeCount}>
                {t('mobile.public.technician-badges.count', { count: b.technicianCount ?? 0 })}
              </Text>
            </View>
            <View style={styles.badgeRarity}>
              <Text style={styles.rarityText}>
                {b.rarity === 'rare'
                  ? t('mobile.public.technician-badges.rarity-rare')
                  : b.rarity === 'common'
                    ? t('mobile.public.technician-badges.rarity-common')
                    : t('mobile.public.technician-badges.rarity-default')}
              </Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
  },
  badgeEmoji: { fontSize: 36 },
  badgeName: { fontSize: 14, fontWeight: '700', color: '#111827' },
  badgeDesc: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  badgeCount: { fontSize: 11, color: '#7c3aed', marginTop: 4 },
  badgeRarity: { alignSelf: 'flex-start' },
  rarityText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7c3aed',
    backgroundColor: '#ede9fe',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
});
