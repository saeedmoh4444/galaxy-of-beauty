import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { typedTrpc } from '@/lib/trpc-react';

export default function TechnicianBadgesScreen(): JSX.Element {
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback((isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    (typedTrpc().technicianBadges.catalog.query() as any)
      .then((d: any) => {
        setBadges(d || []);
        setLoading(false);
        setRefreshing(false);
      })
      .catch(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  if (loading) return <SkeletonList count={4} />;

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetch(true)}
          colors={['#8b5cf6']}
        />
      }
    >
      <Text style={styles.t}> شارات الفنيات</Text>
      <Text style={styles.sub}>شارات التميز والاعتماد للفنيات</Text>
      {badges.length === 0 ? (
        <Text style={styles.e}>لا توجد شارات</Text>
      ) : (
        badges.map((b: any) => (
          <View key={b.id} style={styles.card}>
            <Text style={styles.badgeEmoji}>{(b.emoji as string) ?? ''}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.badgeName}>{b.nameAr as string}</Text>
              <Text style={styles.badgeDesc}>{b.descAr as string}</Text>
              <Text style={styles.badgeCount}>
                ‍ {b.technicianCount as number} فنيات حاصلات عليها
              </Text>
            </View>
            <View style={styles.badgeRarity}>
              <Text style={styles.rarityText}>
                {(b.rarity as string) === 'rare'
                  ? 'نادرة'
                  : (b.rarity as string) === 'common'
                    ? 'شائعة'
                    : 'مميزة'}
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
