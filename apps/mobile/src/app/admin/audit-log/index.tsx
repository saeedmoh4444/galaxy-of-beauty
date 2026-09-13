import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

function logType(action?: string): 'create' | 'delete' | 'export' | 'update' {
  const a = action ?? '';
  if (a.startsWith('CREATE')) return 'create';
  if (a.startsWith('DELETE') || a.includes('SUSPEND')) return 'delete';
  if (a.includes('EXPORT')) return 'export';
  return 'update';
}

export default function AuditLogScreen(): JSX.Element {
  const { t, locale } = useLocale();
  const q = trpc.admin.auditLogs.useQuery({ page: 1, limit: 20 });
  const logs = q.data?.items ?? [];

  return (
    <ScrollView style={s.c} contentContainerStyle={s.i}>
      <Text style={s.h}>{t('admin.audit-log.title')}</Text>
      <Text style={s.sub}>{t('mobile.admin.audit-log.subtitle')}</Text>
      <ScreenState
        isLoading={q.isLoading}
        isError={q.isError}
        isEmpty={logs.length === 0}
        errorMessage={t('admin.audit-log.load-error')}
        emptyTitle={t('admin.audit-log.empty')}
        onRetry={() => q.refetch()}
      >
        {logs.map((l, i) => {
          const type = logType(l.action);
          return (
            <View key={l.id ?? i} style={s.card}>
              <View style={{ flex: 1 }}>
                <Text style={s.cn}>{l.action}</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 2 }}>
                  <Text style={s.cu}>#{l.adminId ?? 0}</Text>
                  <Text style={s.ct}>
                    {l.createdAt
                      ? new Date(l.createdAt).toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-GB')
                      : ''}
                  </Text>
                </View>
              </View>
              <View
                style={[
                  s.tag,
                  {
                    backgroundColor:
                      type === 'create'
                        ? '#d1fae5'
                        : type === 'delete'
                          ? '#fee2e2'
                          : type === 'export'
                            ? '#dbeafe'
                            : '#fef3c7',
                  },
                ]}
              >
                <Text
                  style={[
                    s.tt,
                    {
                      color:
                        type === 'create'
                          ? '#059669'
                          : type === 'delete'
                            ? '#dc2626'
                            : type === 'export'
                              ? '#2563eb'
                              : '#d97706',
                    },
                  ]}
                >
                  {type === 'create'
                    ? t('mobile.admin.audit-log.tag-create')
                    : type === 'delete'
                      ? t('mobile.admin.audit-log.tag-delete')
                      : type === 'export'
                        ? t('mobile.admin.audit-log.tag-export')
                        : t('mobile.admin.audit-log.tag-update')}
                </Text>
              </View>
            </View>
          );
        })}
      </ScreenState>
    </ScrollView>
  );
}
const sc = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#f9fafb' },
  i: { padding: 16, paddingTop: 40, paddingBottom: 60 },
  h: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center' },
  sub: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    gap: 10,
  },
  cn: { fontSize: 14, fontWeight: '600', color: '#111827' },
  cu: { fontSize: 11, color: '#6b7280' },
  ct: { fontSize: 11, color: '#9ca3af' },
  tag: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  tt: { fontSize: 11, fontWeight: '700' },
});
const s = sc;
