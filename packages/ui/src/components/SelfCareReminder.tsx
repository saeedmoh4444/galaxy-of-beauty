'use client';

/**
 * Self-Care Reminder — daily prompt encouraging women to take care of themselves.
 * From Phase W3: Mental Wellness & Beauty.
 */

const REMINDERS = [
  {
    emoji: '‍️',
    text: {
      ar: 'خذي ٥ دقائق للتنفس العميق. أنتِ تستحقين هذه اللحظة.',
      en: 'Take 5 minutes for deep breathing. You deserve this moment.',
    },
  },
  {
    emoji: '',
    text: {
      ar: 'العناية بنفسكِ ليست رفاهية — إنها ضرورة. أنتِ الأولوية.',
      en: 'Caring for yourself is not a luxury — it is a necessity. You are the priority.',
    },
  },
  {
    emoji: '',
    text: {
      ar: 'أنتِ جميلة كما أنتِ. لا تقارني نفسكِ بأحد.',
      en: 'You are beautiful as you are. Do not compare yourself to anyone.',
    },
  },
  {
    emoji: '',
    text: {
      ar: 'اشربي شيئاً دافئاً واستمتعي بلحظة هدوء.',
      en: 'Drink something warm and enjoy a quiet moment.',
    },
  },
  {
    emoji: '',
    text: {
      ar: 'ابتعدي عن الجوال لمدة ٣٠ دقيقة. عيناكِ وعقلكِ يستحقان الراحة.',
      en: 'Step away from your phone for 30 minutes. Your eyes and mind deserve rest.',
    },
  },
  {
    emoji: '🫂',
    text: {
      ar: 'تواصلي مع صديقة اليوم. العلاقات تغذي الروح.',
      en: 'Reach out to a friend today. Relationships nourish the soul.',
    },
  },
  {
    emoji: '',
    text: {
      ar: 'شغّلي أغنيتكِ المفضلة وارقصي. الفرح دواء.',
      en: 'Play your favorite song and dance. Joy is medicine.',
    },
  },
  {
    emoji: '',
    text: {
      ar: 'اقرئي صفحة من كتاب تحبينه. العقل السليم في الجمال السليم.',
      en: 'Read a page from a book you love. A healthy mind in healthy beauty.',
    },
  },
];

export function SelfCareReminder({
  className = '',
  locale = 'ar',
  title = ' تذكير يومي',
}: {
  className?: string;
  /** Display language for built-in reminders */
  locale?: 'ar' | 'en';
  title?: string;
}): JSX.Element {
  const today = new Date().getDate();
  const reminder = REMINDERS[today % REMINDERS.length]!;

  return (
    <div
      className={`rounded-xl border border-purple-100 bg-purple-50 p-4 dark:border-purple-900 dark:bg-purple-950 ${className}`}
    >
      <p className="text-xs font-semibold text-purple-600 dark:text-purple-400">{title}</p>
      <p className="mt-2 text-sm text-purple-800 dark:text-purple-200">
        <span className="mr-2 text-xl">{reminder.emoji}</span>
        {reminder.text[locale]}
      </p>
    </div>
  );
}
