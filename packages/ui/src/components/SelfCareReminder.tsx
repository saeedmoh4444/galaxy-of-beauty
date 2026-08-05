'use client';

/**
 * Self-Care Reminder — daily prompt encouraging women to take care of themselves.
 * From Phase W3: Mental Wellness & Beauty.
 */

const REMINDERS = [
  { emoji: '🧘‍♀️', text: 'خذي ٥ دقائق للتنفس العميق. أنتِ تستحقين هذه اللحظة.' },
  { emoji: '💖', text: 'العناية بنفسكِ ليست رفاهية — إنها ضرورة. أنتِ الأولوية.' },
  { emoji: '🌸', text: 'أنتِ جميلة كما أنتِ. لا تقارني نفسكِ بأحد.' },
  { emoji: '☕', text: 'اشربي شيئاً دافئاً واستمتعي بلحظة هدوء.' },
  { emoji: '📵', text: 'ابتعدي عن الجوال لمدة ٣٠ دقيقة. عيناكِ وعقلكِ يستحقان الراحة.' },
  { emoji: '🫂', text: 'تواصلي مع صديقة اليوم. العلاقات تغذي الروح.' },
  { emoji: '🎵', text: 'شغّلي أغنيتكِ المفضلة وارقصي. الفرح دواء.' },
  { emoji: '📖', text: 'اقرئي صفحة من كتاب تحبينه. العقل السليم في الجمال السليم.' },
];

export function SelfCareReminder({ className = '' }: { className?: string }): JSX.Element {
  const today = new Date().getDate();
  const reminder = REMINDERS[today % REMINDERS.length]!;

  return (
    <div className={`rounded-xl border border-purple-100 bg-purple-50 p-4 dark:border-purple-900 dark:bg-purple-950 ${className}`}>
      <p className="text-xs font-semibold text-purple-600 dark:text-purple-400">🌿 تذكير يومي</p>
      <p className="mt-2 text-sm text-purple-800 dark:text-purple-200">
        <span className="mr-2 text-xl">{reminder.emoji}</span>
        {reminder.text}
      </p>
    </div>
  );
}
