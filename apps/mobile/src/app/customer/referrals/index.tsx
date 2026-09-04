import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';
import { useAuthState } from '@/hooks/useAuthState';

const COLORS = {
  brand: '#7c3aed',
  white: '#ffffff',
  gray400: '#6b7280',
  gray900: '#111827',
  success: '#10b981',
};

interface ReferralCodeData {
  referralCode?: string;
}

interface ReferralStats {
  totalReferrals?: number;
  totalEarnings?: number;
}

export default function ReferralsScreen(): JSX.Element {
  const { t } = useLocale();
  const isAuthed = useAuthState();
  const code = trpc.referrals.getMyCode.useQuery(undefined, { enabled: isAuthed });
  const stats = trpc.referrals.getStats.useQuery(undefined, { enabled: isAuthed }) ?? {
    data: null,
  };
  const codeData = code.data as ReferralCodeData | null;
  const statsData = stats.data as ReferralStats | null;

  return (
    <ScreenState
      isLoading={code.isLoading}
      isError={code.isError}
      isEmpty={!code.data}
      errorMessage={t('mobile.referrals.load-error')}
      onRetry={() => code.refetch()}
    >
      <Text style={styles.title}>{t('mobile.referrals.title')}</Text>
      <View style={styles.codeCard}>
        <Text style={styles.codeLabel}>{t('mobile.referrals.your-code')}</Text>
        <Text style={styles.codeValue}>{codeData?.referralCode ?? '———'}</Text>
        <TouchableOpacity style={styles.copyBtn} onPress={() => {}}>
          <Text style={styles.copyText}>{t('mobile.referrals.copy-code')}</Text>
        </TouchableOpacity>
      </View>
      {stats.data && (
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{String(statsData?.totalReferrals ?? 0)}</Text>
            <Text style={styles.statLabel}>{t('mobile.referrals.referrals')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{String(statsData?.totalEarnings ?? 0)} ر.س</Text>
            <Text style={styles.statLabel}>{t('mobile.referrals.rewards')}</Text>
          </View>
        </View>
      )}
    </ScreenState>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.brand,
    textAlign: 'center',
    marginBottom: 20,
  },
  codeCard: {
    backgroundColor: COLORS.brand,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  codeLabel: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 8 },
  codeValue: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  copyBtn: {
    marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  copyText: { fontSize: 14, fontWeight: '600', color: COLORS.white },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNum: { fontSize: 18, fontWeight: '800', color: COLORS.gray900 },
  statLabel: { fontSize: 12, color: COLORS.gray400, marginTop: 4 },
});
