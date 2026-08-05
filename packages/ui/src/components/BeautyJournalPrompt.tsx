'use client';

/**
 * Beauty Journal Prompt — daily reflection connecting beauty and mood.
 * From Phase W3: Mental Wellness & Beauty.
 */

const PROMPTS = [
  { emoji: '💭', text: 'كيف تشعرين اليوم؟ وكيف أثر ذلك على روتين جمالكِ؟' },
  { emoji: '✨', text: 'ما الشيء الوحيد الذي فعلتيه اليوم وجعلكِ تشعرين بالجمال؟' },
  { emoji: '🪞', text: 'انظري في المرآة. ما أكثر شيء تحبينه في نفسكِ اليوم؟' },
  { emoji: '💪', text: 'ما التحدي الذي واجهتيه هذا الأسبوع وتغلبتِ عليه؟' },
  { emoji: '🙏', text: 'اكتبي ثلاثة أشياء أنتِ ممتنة لها اليوم.' },
];

export function BeautyJournalPrompt({ className = '' }: { className?: string }): JSX.Element {
  const today = new Date().getDate();
  const prompt = PROMPTS[today % PROMPTS.length]!;

  return (
    <div className={`rounded-xl border border-indigo-100 bg-indigo-50 p-4 dark:border-indigo-900 dark:bg-indigo-950 ${className}`}>
      <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">📔 يوميات الجمال</p>
      <p className="mt-2 text-sm text-indigo-800 dark:text-indigo-200">
        <span className="mr-2 text-lg">{prompt.emoji}</span>
        {prompt.text}
      </p>
      <textarea
        placeholder="اكتبي هنا..."
        rows={2}
        className="mt-3 w-full rounded-lg border border-indigo-200 bg-white p-2 text-sm dark:border-indigo-800 dark:bg-indigo-900 dark:text-indigo-100 dark:placeholder:text-indigo-500"
      />
    </div>
  );
}
