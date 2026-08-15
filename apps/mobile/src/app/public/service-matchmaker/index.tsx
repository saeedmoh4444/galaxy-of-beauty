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

const QUESTIONS = [
  {
    id: 'mood',
    text: 'ما مزاجك اليوم؟',
    options: [
      { label: 'استرخاء', value: 'relax', emoji: '‍️' },
      { label: 'تجديد', value: 'refresh', emoji: '' },
      { label: 'جرأة', value: 'bold', emoji: '' },
      { label: 'عناية', value: 'care', emoji: '‍️' },
    ],
  },
  {
    id: 'focus',
    text: 'على ماذا تركزين؟',
    options: [
      { label: 'البشرة', value: 'skin', emoji: '' },
      { label: 'الشعر', value: 'hair', emoji: '‍️' },
      { label: 'الأظافر', value: 'nails', emoji: '' },
      { label: 'المكياج', value: 'makeup', emoji: '' },
    ],
  },
  {
    id: 'budget',
    text: 'ميزانيتك؟',
    options: [
      { label: 'اقتصادية', value: 'low', emoji: '' },
      { label: 'متوسطة', value: 'mid', emoji: '' },
      { label: 'فاخرة', value: 'high', emoji: '' },
    ],
  },
];

interface MatchResultItem {
  emoji?: string;
  nameAr?: string;
  whyAr?: string;
  score?: number;
  price?: number;
}

interface MatchResult {
  matches?: MatchResultItem[];
}

export default function ServiceMatchmakerScreen(): JSX.Element {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<Record<string, string> | null>(null);

  // Fetch on demand once the last answer is picked: args are snapshotted into
  // `submitted` so the query fetches with the final merged answers.
  const matchQ = trpc.serviceMatchmaker.match.useQuery(
    { answers: submitted ?? {} },
    { enabled: !!submitted },
  );

  const result: MatchResult | null =
    matchQ.data !== undefined
      ? { matches: (matchQ.data as unknown as MatchResultItem[]) ?? [] }
      : null;

  const select = (value: string) => {
    const q = QUESTIONS[step]!;
    const next = { ...answers, [q.id]: value };
    setAnswers(next);
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      setSubmitted(next);
    }
  };

  if (matchQ.isLoading)
    return <ActivityIndicator color="#ec4899" style={{ marginTop: 40 }} size="large" />;

  if (result) {
    return (
      <ScrollView style={styles.c} contentContainerStyle={styles.i}>
        <Text style={styles.t}> النتائج</Text>
        <View style={styles.resultCard}>
          <Text style={styles.resultEmoji}></Text>
          <Text style={styles.resultTitle}>خدماتكِ المثالية</Text>
          {result.matches?.map((m, i) => (
            <View key={i} style={styles.match}>
              <Text style={styles.matchEmoji}>{m.emoji ?? '‍️'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.matchName}>{m.nameAr}</Text>
                <Text style={styles.matchWhy}>{m.whyAr}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.matchScore}>{m.score}%</Text>
                <Text style={styles.matchPrice}>{m.price?.toLocaleString()} ر.س</Text>
              </View>
            </View>
          ))}
        </View>
        <TouchableOpacity
          onPress={() => {
            setStep(0);
            setAnswers({});
            setSubmitted(null);
          }}
          style={styles.resetBtn}
        >
          <Text style={styles.resetBtnText}> إعادة</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  const q = QUESTIONS[step]!;

  return (
    <ScrollView style={styles.c} contentContainerStyle={styles.i}>
      <Text style={styles.t}> Service Matchmaker</Text>
      <Text style={styles.progress}>
        {step + 1}/{QUESTIONS.length}
      </Text>
      <View style={styles.progressBar}>
        <View
          style={[styles.progressFill, { width: `${((step + 1) / QUESTIONS.length) * 100}%` }]}
        />
      </View>
      <Text style={styles.question}>{q.text}</Text>
      {q.options.map((o) => (
        <TouchableOpacity key={o.value} onPress={() => select(o.value)} style={styles.option}>
          <Text style={styles.optionEmoji}>{o.emoji}</Text>
          <Text style={styles.optionLabel}>{o.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#db2777', textAlign: 'center', marginBottom: 8 },
  progress: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginBottom: 8 },
  progressBar: { height: 6, backgroundColor: '#f3f4f6', borderRadius: 3, marginBottom: 20 },
  progressFill: { height: 6, backgroundColor: '#db2777', borderRadius: 3 },
  question: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  optionEmoji: { fontSize: 30 },
  optionLabel: { fontSize: 15, fontWeight: '600', color: '#111827' },
  resultCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20 },
  resultEmoji: { fontSize: 48, textAlign: 'center' },
  resultTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  match: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  matchEmoji: { fontSize: 28 },
  matchName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  matchWhy: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  matchScore: { fontSize: 16, fontWeight: '800', color: '#db2777' },
  matchPrice: { fontSize: 12, color: '#6b7280' },
  resetBtn: {
    backgroundColor: '#f3f4f6',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  resetBtnText: { color: '#6b7280', fontSize: 14, fontWeight: '600' },
});
