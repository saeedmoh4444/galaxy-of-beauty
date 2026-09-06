import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { useAuthState } from '@/hooks/useAuthState';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface VipStatus {
  currentTier?: string;
  expiresAt?: string | null;
  autoRenew?: boolean;
}

export default function VIPMembershipScreen(): JSX.Element {
  const { t } = useLocale();
  const isAuthed = useAuthState();
  const tierQ = trpc.vipMembership.myTier.useQuery(undefined, { enabled: isAuthed });
  const data = tierQ.data as unknown as VipStatus | null;
  if (tierQ.isLoading) return <SkeletonList count={3} />;
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={tierQ.isRefetching}
          onRefresh={() => tierQ.refetch()}
          colors={['#7c3aed']}
        />
      }
    >
      <Text style={styles.t}>{t('mobile.vipMembership.title')}</Text>
      {data?.currentTier ? (
        <View style={styles.card}>
          <Text style={styles.emoji}>⭐</Text>
          <Text style={styles.name}>{data.currentTier}</Text>
          <Text style={styles.price}>
            {data.autoRenew
              ? t('mobile.vipMembership.auto-renew-on')
              : t('mobile.vipMembership.auto-renew-off')}
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 2,
    alignItems: 'center',
  },
  emoji: { fontSize: 36 },
  name: { fontSize: 15, fontWeight: '700', color: '#111827', marginTop: 4 },
  price: { fontSize: 14, fontWeight: '600', color: '#7c3aed', marginTop: 2 },
});
