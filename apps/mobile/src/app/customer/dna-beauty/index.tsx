import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useState } from 'react';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface DnaQuestion {
  id: string;
  q: string;
}

interface DnaResult {
  score: number;
}

export default function DNABeautyScreen(): JSX.Element {
  const { t } = useLocale();
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const utils = trpc.useUtils();
  const q = trpc.dnaBeauty.questions.useQuery();
  const questions: DnaQuestion[] = (q.data as unknown as DnaQuestion[] | undefined) ?? [];
  const analyzeQ = trpc.dnaBeauty.analyze.useQuery({ answers }, { enabled: false });
  const analyze = () => {
    void analyzeQ.refetch();
  };
  if (q.isLoading) return <SkeletonList count={4} />;
  if (analyzeQ.isLoading)
    return (
      <View style={styles.c}>
        <SkeletonList count={3} />
      </View>
    );
  const result = analyzeQ.data as DnaResult | null;
  if (result)
    return (
      <ScrollView style={styles.c} contentContainerStyle={styles.i}>
        <Text style={styles.t}>{t('dnaBeauty.title')}</Text>
        <View style={[styles.card, styles.rc]}>
          <Text style={styles.re}></Text>
          <Text style={styles.rt}>{t('dnaBeauty.result')}</Text>
          <Text style={styles.score}>{t('dnaBeauty.match', { score: result.score })}</Text>
          <TouchableOpacity
            onPress={() => {
              setAnswers({});
              utils.dnaBeauty.analyze.reset();
            }}
            style={styles.rst}
          >
            <Text style={styles.rstText}>{t('dnaBeauty.reset')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={q.isRefetching}
          onRefresh={() => q.refetch()}
          colors={['#7c3aed']}
        />
      }
    >
      <Text style={styles.t}>{t('dnaBeauty.title')}</Text>
      <View style={styles.card}>
        <Text style={styles.qt}>{t('dnaBeauty.fill-survey')}</Text>
        {questions.map((q) => (
          <View key={q.id} style={styles.qr}>
            <Text style={styles.qq}>{q.q}</Text>
            <View style={styles.qb}>
              <TouchableOpacity
                onPress={() => setAnswers({ ...answers, [q.id]: true })}
                style={[styles.qbtn, answers[q.id] === true && styles.qy]}
              >
                <Text style={[styles.qbt, answers[q.id] === true && styles.qat]}>
                  {t('dnaBeauty.yes')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setAnswers({ ...answers, [q.id]: false })}
                style={[styles.qbtn, answers[q.id] === false && styles.qn]}
              >
                <Text style={[styles.qbt, answers[q.id] === false && styles.qat]}>
                  {t('dnaBeauty.no')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        <TouchableOpacity onPress={analyze} style={styles.ab}>
          <Text style={styles.abt}>{t('dnaBeauty.analyze')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  rc: { alignItems: 'center', borderWidth: 2, borderColor: '#c4b5fd' },
  re: { fontSize: 56 },
  rt: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 8 },
  score: { fontSize: 28, fontWeight: '800', color: '#7c3aed', marginTop: 8 },
  rst: { backgroundColor: '#f3f4f6', borderRadius: 14, padding: 14, marginTop: 16 },
  rstText: { color: '#6b7280', fontSize: 14, fontWeight: '600' },
  qt: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  qr: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  qq: { flex: 1, fontSize: 13, color: '#374151' },
  qb: { flexDirection: 'row', gap: 8 },
  qbtn: { borderRadius: 8, paddingHorizontal: 16, paddingVertical: 6, backgroundColor: '#e5e7eb' },
  qy: { backgroundColor: '#7c3aed' },
  qn: { backgroundColor: '#ef4444' },
  qbt: { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  qat: { color: '#fff' },
  ab: {
    backgroundColor: '#7c3aed',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  abt: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
