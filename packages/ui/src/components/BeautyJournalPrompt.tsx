'use client';

/**
 * Beauty Journal Prompt — daily reflection connecting beauty and mood.
 * From Phase W3: Mental Wellness & Beauty.
 */

const PROMPTS = [
  {
    emoji: '',
    text: {
      ar: 'كيف تشعرين اليوم؟ وكيف أثر ذلك على روتين جمالكِ؟',
      en: 'How do you feel today? And how did it affect your beauty routine?',
    },
  },
  {
    emoji: '',
    text: {
      ar: 'ما الشيء الوحيد الذي فعلتيه اليوم وجعلكِ تشعرين بالجمال؟',
      en: 'What is the one thing you did today that made you feel beautiful?',
    },
  },
  {
    emoji: '🪞',
    text: {
      ar: 'انظري في المرآة. ما أكثر شيء تحبينه في نفسكِ اليوم؟',
      en: 'Look in the mirror. What do you love most about yourself today?',
    },
  },
  {
    emoji: '',
    text: {
      ar: 'ما التحدي الذي واجهتيه هذا الأسبوع وتغلبتِ عليه؟',
      en: 'What challenge did you face this week and overcome?',
    },
  },
  {
    emoji: '',
    text: {
      ar: 'اكتبي ثلاثة أشياء أنتِ ممتنة لها اليوم.',
      en: 'Write down three things you are grateful for today.',
    },
  },
];

export function BeautyJournalPrompt({
  className = '',
  locale = 'ar',
  title = ' يوميات الجمال',
  placeholder = 'اكتبي هنا...',
}: {
  className?: string;
  locale?: 'ar' | 'en';
  title?: string;
  placeholder?: string;
}): JSX.Element {
  const today = new Date().getDate();
  const prompt = PROMPTS[today % PROMPTS.length]!;

  return (
    <div
      className={`rounded-xl border border-indigo-100 bg-indigo-50 p-4 dark:border-indigo-900 dark:bg-indigo-950 ${className}`}
    >
      <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{title}</p>
      <p className="mt-2 text-sm text-indigo-800 dark:text-indigo-200">
        <span className="mr-2 text-lg">{prompt.emoji}</span>
        {prompt.text[locale]}
      </p>
      <textarea
        placeholder={placeholder}
        rows={2}
        className="mt-3 w-full rounded-lg border border-indigo-200 bg-white p-2 text-sm dark:border-indigo-800 dark:bg-indigo-900 dark:text-indigo-100 dark:placeholder:text-indigo-500"
      />
    </div>
  );
}
