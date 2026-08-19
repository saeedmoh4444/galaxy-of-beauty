import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface PlatformConfig {
  platformFee?: string;
  minPayout?: number;
  maintenanceMode?: boolean;
  cashbackRate?: number;
}

interface CashbackInfo {
  rate?: number;
}

export default function AdminSettingsScreen(): JSX.Element {
  const { t } = useLocale();
  const settingsQ = trpc.platform.getSettings.useQuery();
  const cashbackQ = trpc.cashback.info.useQuery();
  const config: PlatformConfig = {
    ...((settingsQ.data as unknown as PlatformConfig | null) ?? {}),
    cashbackRate: (cashbackQ.data as unknown as CashbackInfo | null)?.rate,
  };
  const loading = settingsQ.isLoading || cashbackQ.isLoading;

  if (loading) return <SkeletonList count={4} />;

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={settingsQ.isRefetching || cashbackQ.isRefetching}
          onRefresh={() => {
            void settingsQ.refetch();
            void cashbackQ.refetch();
          }}
          colors={['#6366f1']}
        />
      }
    >
      <Text style={styles.t}>{t('mobile.admin.settings.title')}</Text>

      <View style={styles.section}>
        <Text style={styles.st}>{t('mobile.admin.settings.platform-fees')}</Text>
        <View style={styles.row}>
          <Text style={styles.l}>{t('mobile.admin.settings.platform-rate')}</Text>
          <Text style={styles.v}>{config.platformFee ?? '10%'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.l}>{t('mobile.admin.settings.min-withdrawal')}</Text>
          <Text style={styles.v}>
            {(config.minPayout ?? 100).toLocaleString()} {t('misc.sar')}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.st}>{t('mobile.admin.settings.cashback')}</Text>
        <View style={styles.row}>
          <Text style={styles.l}>{t('mobile.admin.settings.cashback-rate')}</Text>
          <Text style={styles.v}>{config.cashbackRate ?? 5}%</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.l}>{t('mobile.admin.settings.first-booking-bonus')}</Text>
          <Text style={styles.v}>50 {t('misc.sar')}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.st}>{t('mobile.admin.settings.maintenance')}</Text>
        <View style={styles.row}>
          <Text style={styles.l}>{t('mobile.admin.settings.maintenance-mode')}</Text>
          <View style={[styles.badge, config.maintenanceMode ? styles.bon : styles.boff]}>
            <Text
              style={[
                styles.bt,
                config.maintenanceMode ? { color: '#dc2626' } : { color: '#059669' },
              ]}
            >
              {config.maintenanceMode ? t('admin.enabled') : t('admin.disabled')}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#eef2ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#4f46e5', textAlign: 'center', marginBottom: 20 },
  section: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12 },
  st: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  l: { fontSize: 14, color: '#6b7280' },
  v: { fontSize: 14, fontWeight: '600', color: '#111827' },
  badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  bon: { backgroundColor: '#fee2e2' },
  boff: { backgroundColor: '#dcfce7' },
  bt: { fontSize: 12, fontWeight: '600' },
});
