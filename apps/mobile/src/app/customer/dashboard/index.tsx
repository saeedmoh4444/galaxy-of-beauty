import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';

const COLORS = {
  brand: '#7c3aed',
  white: '#ffffff',
  gray50: '#faf5ff',
  gray400: '#6b7280',
  gray900: '#111827',
};

export default function DashboardScreen(): JSX.Element {
  const router = useRouter();
  const insights = trpc.analytics.customerInsights.useQuery();
  const data = insights.data as Record<string, unknown> | undefined;

  return (
    <ScreenState
      isLoading={insights.isLoading}
      isError={insights.isError}
      isEmpty={!data}
      errorMessage="فشل تحميل لوحة التحكم"
      onRetry={() => insights.refetch()}
    >
      <Text style={styles.title}>📊 لوحة التحكم</Text>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{String(data?.bookingCount ?? 0)}</Text>
          <Text style={styles.statLabel}>حجوزات</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{String(data?.totalSpent ?? 0)} ر.س</Text>
          <Text style={styles.statLabel}>الإنفاق</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>
            🔥 {String((data?.streakInfo as any)?.currentStreak ?? 0)}
          </Text>
          <Text style={styles.statLabel}>الاستمرارية</Text>
        </View>
      </View>
      <View style={styles.quickLinks}>
        {[
          { h: '/(tabs)/bookings', l: '📅 حجوزاتي', c: '#7c3aed' },
          { h: '/customer/wallet', l: '💰 المحفظة', c: '#059669' },
          { h: '/customer/wishlist', l: '❤️ المفضلة', c: '#dc2626' },
          { h: '/customer/loyalty', l: '⭐ الولاء', c: '#d97706' },
          { h: '/customer/ai-chat', l: '🤖 لايلى', c: '#2563eb' },
          { h: '/customer/profile', l: '👤 حسابي', c: '#7c3aed' },
        ].map((ql, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.qlBtn, { backgroundColor: ql.c }]}
            onPress={() => router.push(ql.h as any)}
          >
            <Text style={styles.qlText}>{ql.l}</Text>
          </TouchableOpacity>
        ))}
      </View>
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
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
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
  statNum: { fontSize: 16, fontWeight: '800', color: COLORS.gray900 },
  statLabel: { fontSize: 11, color: COLORS.gray400, marginTop: 4 },
  quickLinks: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  qlBtn: { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, minWidth: '30%' },
  qlText: { fontSize: 13, fontWeight: '600', color: COLORS.white, textAlign: 'center' },
});
