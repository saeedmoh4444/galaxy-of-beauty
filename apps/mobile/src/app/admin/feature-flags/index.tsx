import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { ErrorAlert } from '@/components/ErrorAlert';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface FeatureFlag {
  id?: number;
  key: string;
  nameAr?: string;
  rolloutPercent?: number;
  enabled?: boolean;
}

export default function FeatureFlagsScreen(): JSX.Element {
  const { t } = useLocale();
  const q = trpc.featureFlags.list.useQuery();
  const data = (q.data as unknown as FeatureFlag[] | null) ?? [];
  const toggleMut = trpc.featureFlags.toggle.useMutation({ onSuccess: () => void q.refetch() });

  const toggle = (key: string) => {
    toggleMut.mutate({ key });
  };

  if (q.isLoading) return <SkeletonList count={5} />;
  if (q.isError)
    return (
      <ErrorAlert
        message={t('mobile.admin.feature-flags.load-error')}
        onRetry={() => q.refetch()}
      />
    );

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={q.isRefetching}
          onRefresh={() => q.refetch()}
          colors={['#6366f1']}
        />
      }
    >
      <Text style={styles.t}>{t('mobile.admin.feature-flags.title')}</Text>
      {data.map((f, i) => (
        <View key={i} style={styles.card}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{f.nameAr ?? f.key}</Text>
            <Text style={styles.meta}>{f.rolloutPercent ?? 0}%</Text>
          </View>
          <TouchableOpacity
            onPress={() => toggle(f.key)}
            style={[styles.toggle, f.enabled ? styles.on : styles.off]}
          >
            <Text style={styles.toggleText}>
              {f.enabled ? t('admin.enabled') : t('admin.disabled')}
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#eef2ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#4f46e5', textAlign: 'center', marginBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 6,
  },
  name: { fontSize: 14, fontWeight: '600', color: '#111827' },
  meta: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  toggle: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6 },
  on: { backgroundColor: '#dcfce7' },
  off: { backgroundColor: '#f3f4f6' },
  toggleText: { fontSize: 12, fontWeight: '600' },
});
