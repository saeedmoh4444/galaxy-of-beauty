import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../lib/api';

const QUESTIONS = [
  {
    key: 'preferred_services',
    title: 'ما الخدمات التي تهمك؟',
    subtitle: 'اختاري كل ما يناسبك',
    multi: true,
    options: [
      { value: 'hair-care', label: 'العناية بالشعر', icon: '💇‍♀️' },
      { value: 'nail-care', label: 'الأظافر', icon: '💅' },
      { value: 'skin-care', label: 'البشرة', icon: '✨' },
      { value: 'makeup', label: 'مكياج', icon: '💄' },
      { value: 'body-care', label: 'العناية بالجسم', icon: '💆‍♀️' },
      { value: 'henna', label: 'حناء', icon: '🌿' },
    ],
  },
  {
    key: 'budget',
    title: 'ما ميزانيتك المفضلة للخدمة الواحدة؟',
    single: true,
    options: [
      { value: 'budget', label: 'اقتصادية (أقل من ١٠٠ ر.س)', icon: '💰' },
      { value: 'mid', label: 'متوسطة (١٠٠ - ٣٠٠ ر.س)', icon: '💵' },
      { value: 'premium', label: 'ممتازة (أكثر من ٣٠٠ ر.س)', icon: '💎' },
    ],
  },
  {
    key: 'frequency',
    title: 'كم مرة تحتاجين خدمات التجميل؟',
    single: true,
    options: [
      { value: 'weekly', label: 'أسبوعياً', icon: '📅' },
      { value: 'biweekly', label: 'كل أسبوعين', icon: '🗓️' },
      { value: 'monthly', label: 'شهرياً', icon: '📆' },
      { value: 'occasional', label: 'للمناسبات فقط', icon: '🎉' },
    ],
  },
  {
    key: 'skin_type',
    title: 'ما نوع بشرتك؟',
    single: true,
    options: [
      { value: 'oily', label: 'دهنية', icon: '🫧' },
      { value: 'dry', label: 'جافة', icon: '💧' },
      { value: 'combination', label: 'مختلطة', icon: '🔄' },
      { value: 'sensitive', label: 'حساسة', icon: '🌸' },
      { value: 'not_sure', label: 'لست متأكدة', icon: '🤔' },
    ],
  },
];

export default function OnboardingQuiz({ onComplete }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const saveQuiz = useMutation({
    mutationFn: async (responses) => {
      await api.post('/ai/quiz', { responses });
    },
    onSuccess: () => {
      toast.success('تم حفظ تفضيلاتك! ✨');
      onComplete?.();
    },
    onError: () => toast.error('فشل حفظ التفضيلات'),
  });

  const question = QUESTIONS[step];
  const isLast = step === QUESTIONS.length - 1;

  const toggleMulti = (value) => {
    const current = answers[question.key] || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setAnswers({ ...answers, [question.key]: updated });
  };

  const selectSingle = (value) => {
    setAnswers({ ...answers, [question.key]: value });
    if (!isLast) setTimeout(() => setStep(step + 1), 300);
  };

  const handleNext = () => {
    if (isLast) {
      saveQuiz.mutate(answers);
    } else {
      setStep(step + 1);
    }
  };

  if (!question) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="card max-w-lg w-full">
        {/* Progress */}
        <div className="flex gap-1 mb-6">
          {QUESTIONS.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-primary-500' : 'bg-gray-200'}`} />
          ))}
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-1">{question.title}</h2>
        {question.subtitle && <p className="text-sm text-gray-500 mb-4">{question.subtitle}</p>}

        <div className="space-y-3 mb-6">
          {question.options.map((opt) => {
            const isSelected = question.multi
              ? (answers[question.key] || []).includes(opt.value)
              : answers[question.key] === opt.value;

            return (
              <button
                key={opt.value}
                onClick={() => question.multi ? toggleMulti(opt.value) : selectSingle(opt.value)}
                className={`w-full p-4 rounded-xl border-2 text-right flex items-center gap-4 transition-all
                  ${isSelected ? 'border-primary-400 bg-primary-50' : 'border-gray-200 hover:border-primary-200'}`}
              >
                <span className="text-2xl">{opt.icon}</span>
                <span className="font-medium text-gray-700">{opt.label}</span>
                {isSelected && <span className="mr-auto text-primary-500">✓</span>}
              </button>
            );
          })}
        </div>

        <div className="flex justify-between">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} className="btn-ghost">→ السابق</button>
          )}
          <div className="flex-1" />
          <button
            onClick={handleNext}
            disabled={question.multi ? (answers[question.key] || []).length === 0 : !answers[question.key]}
            className="btn-primary"
          >
            {isLast ? (saveQuiz.isPending ? 'جاري الحفظ...' : 'إنهاء ✨') : 'التالي ←'}
          </button>
        </div>
      </div>
    </div>
  );
}
