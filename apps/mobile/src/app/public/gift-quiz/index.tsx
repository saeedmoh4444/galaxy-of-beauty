import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';
import type { JSX } from 'react';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';
import { localize } from '@galaxy/shared';
import type { TranslationKey } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';

const COLORS = { brand: '#7c3aed', white: '#ffffff', gray400: '#6b7280', gray900: '#111827' };

interface GiftRecommendation {
  emoji?: string;
  nameJson?: { ar?: string; en?: string };
  price?: number;
}

interface QuizOption {
  key: string;
  labelKey: TranslationKey;
}

interface QuizQuestion {
  key: string;
  questionKey: TranslationKey;
  options: QuizOption[];
}

const QUESTIONS: QuizQuestion[] = [
  {
    key: 'occasion',
    questionKey: 'mobile.public.giftQuiz.q.occasion',
    options: [
      { key: 'birthday', labelKey: 'mobile.public.giftQuiz.option.occasion.birthday' },
      { key: 'wedding', labelKey: 'mobile.public.giftQuiz.option.occasion.wedding' },
      { key: 'graduation', labelKey: 'mobile.public.giftQuiz.option.occasion.graduation' },
      { key: 'thankyou', labelKey: 'mobile.public.giftQuiz.option.occasion.thankyou' },
      { key: 'justbecause', labelKey: 'mobile.public.giftQuiz.option.occasion.justbecause' },
    ],
  },
  {
    key: 'recipient',
    questionKey: 'mobile.public.giftQuiz.q.recipient',
    options: [
      { key: 'friend', labelKey: 'mobile.public.giftQuiz.option.recipient.friend' },
      { key: 'mom', labelKey: 'mobile.public.giftQuiz.option.recipient.mom' },
      { key: 'sister', labelKey: 'mobile.public.giftQuiz.option.recipient.sister' },
      { key: 'wife', labelKey: 'mobile.public.giftQuiz.option.recipient.wife' },
      { key: 'self', labelKey: 'mobile.public.giftQuiz.option.recipient.self' },
    ],
  },
  {
    key: 'budget',
    questionKey: 'mobile.public.giftQuiz.q.budget',
    options: [
      { key: 'low', labelKey: 'mobile.public.giftQuiz.option.budget.low' },
      { key: 'mid', labelKey: 'mobile.public.giftQuiz.option.budget.mid' },
      { key: 'high', labelKey: 'mobile.public.giftQuiz.option.budget.high' },
    ],
  },
];

export default function GiftQuizScreen(): JSX.Element {
  const { locale, t } = useLocale();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const recommendations = trpc.giftQuiz.recommend.useQuery(
    { answers },
    { enabled: Object.keys(answers).length === QUESTIONS.length },
  ) ?? { data: null, isLoading: false, isError: false, refetch: () => {} };

  return (
    <ScreenState
      isLoading={recommendations.isLoading && Object.keys(answers).length === QUESTIONS.length}
      isError={recommendations.isError}
      isEmpty={false}
      errorMessage={t('mobile.public.gift-quiz.load-error')}
      onRetry={() => recommendations.refetch()}
    >
      <Text style={styles.title}>{t('mobile.public.gift-quiz.title')}</Text>
      {step < QUESTIONS.length ? (
        <View style={styles.card}>
          <Text style={styles.question}>{t(QUESTIONS[step]!.questionKey)}</Text>
          {QUESTIONS[step]!.options.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={styles.option}
              onPress={() => {
                setAnswers({ ...answers, [QUESTIONS[step]!.key]: opt.key });
                setStep(step + 1);
              }}
            >
              <Text style={styles.optionText}>{t(opt.labelKey)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View>
          <Text style={styles.resultTitle}>{t('mobile.public.gift-quiz.recommendations')}</Text>
          {((recommendations.data as unknown as GiftRecommendation[] | undefined) || []).map(
            (r, i) => (
              <View key={i} style={styles.recCard}>
                <Text style={styles.recEmoji}>{r.emoji ?? ''}</Text>
                <View style={styles.recInfo}>
                  <Text style={styles.recName}>{localize(r.nameJson, locale)}</Text>
                  <Text style={styles.recPrice}>
                    {r.price ? t('mobile.public.gift-quiz.price', { price: r.price }) : ''}
                  </Text>
                </View>
              </View>
            ),
          )}
          <TouchableOpacity
            style={styles.restartBtn}
            onPress={() => {
              setStep(0);
              setAnswers({});
            }}
          >
            <Text style={styles.restartText}>{t('mobile.public.gift-quiz.restart')}</Text>
          </TouchableOpacity>
        </View>
      )}
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
  card: { backgroundColor: COLORS.white, borderRadius: 16, padding: 20 },
  question: { fontSize: 18, fontWeight: '700', color: COLORS.gray900, marginBottom: 16 },
  option: { padding: 14, borderRadius: 12, backgroundColor: '#f5f3ff', marginBottom: 8 },
  optionText: { fontSize: 15, fontWeight: '600', color: COLORS.gray900 },
  resultTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: 12,
    textAlign: 'center',
  },
  recCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  recEmoji: { fontSize: 28, marginRight: 12 },
  recInfo: { flex: 1 },
  recName: { fontSize: 14, fontWeight: '600', color: COLORS.gray900 },
  recPrice: { fontSize: 13, color: COLORS.brand, fontWeight: '600', marginTop: 4 },
  restartBtn: { marginTop: 16, alignItems: 'center', padding: 12 },
  restartText: { fontSize: 14, fontWeight: '600', color: COLORS.brand },
});
