import { View, Text, FlatList, StyleSheet } from 'react-native';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';
import { DEFAULT_PAGE_SIZE } from '@galaxy/ui';

const TIERS: Record<string, { emoji: string }> = {
  SILVER: { emoji: '' },
  GOLD: { emoji: '' },
  PLATINUM: { emoji: '' },
};

interface LoyaltyAccount {
  tier?: string;
  points?: number;
  lifetimePoints?: number;
}

interface LoyaltyTxn {
  reason?: string;
  points?: number;
  createdAt?: string;
}

export default function LoyaltyScreen(): JSX.Element {
  const { locale, t } = useLocale();
  const account = trpc.loyalty.myAccount.useQuery();
  const txs = trpc.loyalty.myTransactions.useQuery({ page: 1, limit: DEFAULT_PAGE_SIZE });

  const acc = account.data as unknown as LoyaltyAccount | undefined;

  const tierLabels: Record<string, string> = {
    SILVER: t('loyalty.tier-silver'),
    GOLD: t('loyalty.tier-gold'),
    PLATINUM: t('loyalty.tier-platinum'),
  };

  return (
    <ScreenState
      isLoading={account.isLoading}
      isError={account.isError}
      isEmpty={!acc}
      errorMessage={t('loyalty.load-error')}
      onRetry={() => account.refetch()}
    >
      <Text style={styles.title}>{t('mobile.loyalty')}</Text>

      {/* Tier Card */}
      <View style={styles.tierCard}>
        <Text style={styles.tierEmoji}>{TIERS[acc?.tier ?? 'SILVER']?.emoji ?? ''}</Text>
        <Text style={styles.tierLabel}>
          {tierLabels[acc?.tier ?? 'SILVER'] ?? t('loyalty.tier-silver')}
        </Text>
        <Text style={styles.points}>
          {acc?.points ?? 0} {t('loyalty.points')}
        </Text>
        <Text style={styles.lifetime}>
          {t('loyalty.lifetime-points', { points: acc?.lifetimePoints ?? 0 })}
        </Text>
      </View>

      {/* Recent Transactions */}
      <Text style={styles.sectionTitle}>{t('loyalty.recent-transactions')}</Text>
      {txs.isLoading ? null : (
        <FlatList
          data={(txs.data as unknown as { items?: LoyaltyTxn[] } | null)?.items ?? []}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item }) => (
            <View style={styles.txnRow}>
              <View>
                <Text style={styles.txnReason}>{item.reason ?? t('loyalty.txn-fallback')}</Text>
                <Text style={styles.txnDate}>
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString(
                        locale === 'ar' ? 'ar-SA' : 'en-GB',
                      )
                    : ''}
                </Text>
              </View>
              <Text
                style={[
                  styles.txnPoints,
                  { color: (item.points ?? 0) > 0 ? '#10b981' : '#dc2626' },
                ]}
              >
                {(item.points ?? 0) > 0 ? '+' : ''}
                {item.points ?? 0}
              </Text>
            </View>
          )}
        />
      )}
    </ScreenState>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#7c3aed',
    textAlign: 'center',
    marginBottom: 20,
  },
  tierCard: {
    backgroundColor: '#7c3aed',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  tierEmoji: { fontSize: 48, marginBottom: 8 },
  tierLabel: { fontSize: 20, fontWeight: '800', color: '#ffffff' },
  points: { fontSize: 28, fontWeight: '800', color: '#ffffff', marginTop: 8 },
  lifetime: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  txnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  txnReason: { fontSize: 13, fontWeight: '600', color: '#111827' },
  txnDate: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  txnPoints: { fontSize: 14, fontWeight: '700' },
});
