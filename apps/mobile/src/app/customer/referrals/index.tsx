import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';

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
  const code = trpc.referrals.getMyCode.useQuery();
  const stats = trpc.referrals.getStats.useQuery() ?? { data: null };
  const codeData = code.data as ReferralCodeData | null;
  const statsData = stats.data as ReferralStats | null;

  return (
    <ScreenState
      isLoading={code.isLoading}
      isError={code.isError}
      isEmpty={!code.data}
      errorMessage="فشل تحميل الإحالات"
      onRetry={() => code.refetch()}
    >
      <Text style={styles.title}> الإحالات</Text>
      <View style={styles.codeCard}>
        <Text style={styles.codeLabel}>كود الإحالة الخاص بكِ</Text>
        <Text style={styles.codeValue}>{codeData?.referralCode ?? '———'}</Text>
        <TouchableOpacity style={styles.copyBtn} onPress={() => {}}>
          <Text style={styles.copyText}> نسخ الكود</Text>
        </TouchableOpacity>
      </View>
      {stats.data && (
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{String(statsData?.totalReferrals ?? 0)}</Text>
            <Text style={styles.statLabel}>إحالات</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{String(statsData?.totalEarnings ?? 0)} ر.س</Text>
            <Text style={styles.statLabel}>مكافآت</Text>
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
