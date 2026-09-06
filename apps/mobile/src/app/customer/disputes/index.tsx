import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';
import { useAuthState } from '@/hooks/useAuthState';

const COLORS = { brand: '#7c3aed', white: '#ffffff', gray400: '#6b7280', gray900: '#111827' };

export default function DisputesScreen(): JSX.Element {
  const isAuthed = useAuthState();
  const { locale, t } = useLocale();
  const statusLabels: Record<string, string> = {
    OPEN: t('disputes.status-open'),
    UNDER_REVIEW: t('disputes.status-under-review'),
    RESOLVED_CUSTOMER: t('disputes.status-resolved'),
    RESOLVED_TECHNICIAN: t('disputes.status-resolved'),
    CLOSED: t('disputes.status-closed'),
  };
  const disputes = trpc.disputes.list.useQuery({}, { enabled: isAuthed }) ?? {
    data: null,
    isLoading: false,
    isError: false,
    refetch: () => {},
  };
  const data = disputes.data as unknown[] | undefined;

  return (
    <ScreenState
      isLoading={disputes.isLoading}
      isError={disputes.isError}
      isEmpty={!data || data.length === 0}
      errorMessage={t('disputes.load-error')}
      emptyTitle={t('disputes.empty-title')}
      emptyDescription={t('disputes.empty-desc')}
      onRetry={() => disputes.refetch()}
    >
      <Text style={styles.title}>{t('disputes.title')}</Text>
      {(data as Record<string, unknown>[])?.map((d: Record<string, unknown>, i: number) => (
        <View key={i} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.reason}>{d.reason as string}</Text>
            <Text style={styles.status}>
              {statusLabels[d.status as string] ?? (d.status as string)}
            </Text>
          </View>
          {d.resolution ? (
            <Text style={styles.resolution}>
              {t('disputes.resolution', { resolution: d.resolution as string })}
            </Text>
          ) : null}
          <Text style={styles.date}>
            {new Date(d.createdAt as string).toLocaleDateString(
              locale === 'ar' ? 'ar-SA' : 'en-US',
            )}
          </Text>
        </View>
      ))}
      <TouchableOpacity style={styles.addBtn}>
        <Text style={styles.addText}>{t('disputes.open-new')}</Text>
      </TouchableOpacity>
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
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  reason: { fontSize: 14, fontWeight: '600', color: COLORS.gray900 },
  status: { fontSize: 11, fontWeight: '600', color: COLORS.brand },
  resolution: { fontSize: 12, color: '#10b981', marginTop: 4 },
  date: { fontSize: 10, color: COLORS.gray400, marginTop: 4 },
  addBtn: { alignItems: 'center', padding: 16, marginTop: 8 },
  addText: { fontSize: 15, fontWeight: '600', color: COLORS.brand },
});
