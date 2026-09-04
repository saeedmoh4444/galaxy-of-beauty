import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { SkeletonList } from '@/components/SkeletonCard';
import { useAuthState } from '@/hooks/useAuthState';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface OnboardingStep {
  key?: string;
  titleAr?: string;
  descAr?: string;
  nameAr?: string;
  desc?: string;
  emoji?: string;
  completed?: boolean;
}

interface OnboardingData {
  steps?: OnboardingStep[];
  completed?: number;
  total?: number;
  readyForReview?: boolean;
}

export default function TechOnboardingScreen(): JSX.Element {
  const { t } = useLocale();
  const isAuthed = useAuthState();
  const dataQ = trpc.techOnboarding.steps.useQuery(undefined, { enabled: isAuthed });
  const submitDocMut = trpc.techOnboarding.submitDoc.useMutation({
    onSuccess: () => {
      void dataQ.refetch();
    },
  });
  const submitDoc = (stepKey: string) => {
    submitDocMut.mutate({
      stepKey,
      documentUrl: 'document-url',
    });
  };
  if (dataQ.isLoading) return <SkeletonList count={4} />;
  const data = dataQ.data as OnboardingData | null;
  const steps = (data?.steps as OnboardingStep[] | undefined) ?? [];
  const completed = data?.completed ?? 0;
  const total = data?.total ?? 5;
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={dataQ.isRefetching}
          onRefresh={() => dataQ.refetch()}
          colors={['#059669']}
        />
      }
    >
      <Text style={styles.t}>{t('mobile.techOnboarding.title')}</Text>
      <View style={styles.pc}>
        <Text style={styles.pe}></Text>
        <Text style={styles.pt}>{t('mobile.techOnboarding.completed', { completed, total })}</Text>
        <View style={styles.pb}>
          <View style={[styles.pf, { width: `${(completed / total) * 100}%` }]} />
        </View>
      </View>
      {steps.map((s, i) => (
        <View key={s.key ?? i} style={[styles.step, s.completed && styles.sd]}>
          <Text style={styles.se}>{s.completed ? '' : '⭕'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.stt, s.completed && styles.sttd]}>{s.titleAr}</Text>
            <Text style={styles.sdesc}>{s.descAr}</Text>
          </View>
          {!s.completed && (
            <TouchableOpacity onPress={() => submitDoc(s.key ?? '')} style={styles.ub}>
              <Text style={styles.ut}>{t('mobile.techOnboarding.upload')}</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#ecfdf5' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#059669', textAlign: 'center', marginBottom: 20 },
  pc: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  pe: { fontSize: 40 },
  pt: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 8 },
  pb: { height: 8, backgroundColor: '#f3f4f6', borderRadius: 4, width: '100%', marginTop: 12 },
  pf: { height: 8, backgroundColor: '#059669', borderRadius: 4 },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  sd: { opacity: 0.6 },
  se: { fontSize: 24 },
  stt: { fontSize: 14, fontWeight: '600', color: '#111827' },
  sttd: { textDecorationLine: 'line-through' },
  sdesc: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  ub: { backgroundColor: '#059669', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  ut: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
