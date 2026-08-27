import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useLocale } from '@/components/LocaleProvider';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';

interface QuizQuestion {
  id: number;
  question?: string;
  optionsJson?: unknown;
}

export default function BeautyQuizScreen(): JSX.Element {
  const { t } = useLocale();
  const quizQ = trpc.beautyQuiz.list.useQuery({ limit: 10 });
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [done, setDone] = useState(false);

  const questions = ((quizQ.data as unknown as QuizQuestion[] | undefined) ?? []).map((q) => ({
    id: q.id,
    text: q.question ?? '',
    options: ((q.optionsJson as string[] | undefined) ?? []).map((label, i) => ({
      value: String(i),
      label,
    })),
  }));

  const select = (optIndex: number) => {
    const q = questions[step]!;
    const next = { ...answers, [q.id]: optIndex };
    setAnswers(next);
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setDone(true);
    }
  };

  return (
    <ScreenState
      isLoading={quizQ.isLoading}
      isError={quizQ.isError}
      isEmpty={questions.length === 0}
      onRetry={() => quizQ.refetch()}
    >
      {done ? (
        <ScrollView style={styles.c} contentContainerStyle={styles.i}>
          <Text style={styles.t}>{t('mobile.public.beauty-quiz.result-title')}</Text>
          <View style={styles.resultCard}>
            <Text style={styles.resultEmoji}></Text>
            <Text style={styles.resultTitle}>{t('mobile.public.beauty-quiz.thanks')}</Text>
            <Text style={styles.resultDesc}>{t('mobile.public.beauty-quiz.result-desc')}</Text>
            <View style={styles.answers}>
              {Object.entries(answers).map(([qId, optIndex]) => {
                const q = questions.find((x) => x.id === Number(qId));
                const opt = q?.options[optIndex];
                return (
                  <Text key={qId} style={styles.answerRow}>
                    {q?.text}: {opt?.label ?? ''}
                  </Text>
                );
              })}
            </View>
          </View>
          <TouchableOpacity
            onPress={() => {
              setStep(0);
              setAnswers({});
              setDone(false);
            }}
            style={styles.btn}
          >
            <Text style={styles.btnText}>{t('mobile.public.beauty-quiz.restart')}</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <ScrollView style={styles.c} contentContainerStyle={styles.i}>
          <Text style={styles.t}>{t('mobile.public.beauty-quiz.title')}</Text>
          <Text style={styles.progress}>
            {step + 1}/{questions.length}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${((step + 1) / questions.length) * 100}%` }]}
            />
          </View>
          <Text style={styles.question}>{questions[step]!.text}</Text>
          <View style={styles.options}>
            {questions[step]!.options.map((o) => (
              <TouchableOpacity
                key={o.value}
                onPress={() => select(Number(o.value))}
                style={styles.option}
              >
                <Text style={styles.optionIcon}></Text>
                <Text style={styles.optionLabel}>{o.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </ScreenState>
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
  options: { gap: 10 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  optionIcon: { fontSize: 28 },
  optionLabel: { fontSize: 15, fontWeight: '600', color: '#111827' },
  resultCard: { backgroundColor: '#fff', borderRadius: 20, padding: 24, alignItems: 'center' },
  resultEmoji: { fontSize: 56 },
  resultTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginTop: 12 },
  resultDesc: { fontSize: 13, color: '#6b7280', marginTop: 4, textAlign: 'center' },
  answers: { marginTop: 16, width: '100%' },
  answerRow: { fontSize: 13, color: '#374151', paddingVertical: 4 },
  btn: {
    backgroundColor: '#db2777',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  btnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
