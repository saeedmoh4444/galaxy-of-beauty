import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useState } from 'react';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

const SKIN_TYPES = [
  { key: 'dry', emoji: '️', label: 'جافة' },
  { key: 'oily', emoji: '', label: 'دهنية' },
  { key: 'combination', emoji: '', label: 'مختلطة' },
  { key: 'normal', emoji: '', label: 'عادية' },
] as const;

interface RoutineStep {
  emoji?: string;
  stepAr?: string;
  duration?: string;
}

interface RoutinePhase {
  steps?: RoutineStep[];
  totalTime?: string;
}

interface AIRoutineData {
  morning?: RoutinePhase;
  evening?: RoutinePhase;
  tips?: string[];
}

export default function AIRoutineScreen(): JSX.Element {
  const { t } = useLocale();
  const skinLabels: Record<string, string> = {
    dry: t('aiRoutine.skin-dry'),
    oily: t('aiRoutine.skin-oily'),
    combination: t('aiRoutine.skin-combination'),
    normal: t('aiRoutine.skin-normal'),
  };
  const [skinType, setSkinType] = useState<'dry' | 'oily' | 'combination' | 'normal'>(
    'combination',
  );
  const [generated, setGenerated] = useState(false);
  const q = trpc.aiRoutine.generate.useQuery({ skinType }, { enabled: false });

  const generate = () => {
    setGenerated(true);
    void q.refetch();
  };

  if (!generated) {
    return (
      <ScrollView style={styles.c} contentContainerStyle={styles.i}>
        <Text style={styles.t}>{t('aiRoutine.title')}</Text>
        <Text style={styles.sub}>{t('aiRoutine.subtitle')}</Text>
        <View style={styles.grid}>
          {SKIN_TYPES.map((t) => (
            <TouchableOpacity
              key={t.key}
              onPress={() => setSkinType(t.key)}
              style={[styles.skinBtn, skinType === t.key && styles.skinBtnActive]}
            >
              <Text style={styles.skinEmoji}>{t.emoji}</Text>
              <Text style={[styles.skinLabel, skinType === t.key && styles.skinLabelActive]}>
                {skinLabels[t.key] ?? t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity onPress={generate} style={styles.genBtn}>
          <Text style={styles.genBtnText}>{t('aiRoutine.generate')}</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  if (q.isLoading)
    return <ActivityIndicator color="#8b5cf6" style={{ marginTop: 40 }} size="large" />;

  const data = q.data as AIRoutineData | null;
  const morning = data?.morning?.steps ?? [];
  const evening = data?.evening?.steps ?? [];
  const tips = data?.tips ?? [];

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}>{t('aiRoutine.title')}</Text>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t('aiRoutine.morning', { time: data?.morning?.totalTime ?? '—' })}
        </Text>
        {morning.map((s, i) => (
          <View key={i} style={styles.step}>
            <Text style={styles.stepEmoji}>{s.emoji}</Text>
            <View>
              <Text style={styles.stepLabel}>{s.stepAr}</Text>
              <Text style={styles.stepDur}>{s.duration}</Text>
            </View>
          </View>
        ))}
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t('aiRoutine.evening', { time: data?.evening?.totalTime ?? '—' })}
        </Text>
        {evening.map((s, i) => (
          <View key={i} style={styles.step}>
            <Text style={styles.stepEmoji}>{s.emoji}</Text>
            <View>
              <Text style={styles.stepLabel}>{s.stepAr}</Text>
              <Text style={styles.stepDur}>{s.duration}</Text>
            </View>
          </View>
        ))}
      </View>
      {tips.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('aiRoutine.tips')}</Text>
          {tips.map((tip, i) => (
            <Text key={i} style={styles.tip}>
              • {tip}
            </Text>
          ))}
        </View>
      )}
      <TouchableOpacity
        onPress={() => {
          setGenerated(false);
        }}
        style={styles.resetBtn}
      >
        <Text style={styles.resetBtnText}>{t('aiRoutine.reset')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 8 },
  sub: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginBottom: 20 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    marginBottom: 20,
  },
  skinBtn: {
    width: '45%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  skinBtnActive: { borderColor: '#7c3aed', backgroundColor: '#faf5ff' },
  skinEmoji: { fontSize: 36 },
  skinLabel: { fontSize: 14, fontWeight: '600', color: '#6b7280', marginTop: 6 },
  skinLabelActive: { color: '#7c3aed' },
  genBtn: { backgroundColor: '#7c3aed', borderRadius: 14, padding: 16, alignItems: 'center' },
  genBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  section: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  stepEmoji: { fontSize: 28 },
  stepLabel: { fontSize: 14, fontWeight: '600', color: '#111827' },
  stepDur: { fontSize: 12, color: '#6b7280' },
  tip: { fontSize: 13, color: '#6b7280', paddingVertical: 4, paddingHorizontal: 4 },
  resetBtn: {
    backgroundColor: '#f3f4f6',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  resetBtnText: { color: '#6b7280', fontSize: 14, fontWeight: '600' },
});
