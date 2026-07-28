import Link from 'next/link';
import { Card } from '@galaxy/shared';

const FEATURES = [
  { emoji: '💇‍♀️', title: 'احجزي خدمات التجميل', desc: 'شعر، بشرة، مكياج، أظافر والمزيد', href: '/services', color: 'from-brand-100 to-brand-200' },
  { emoji: '👩‍🎨', title: 'تصفحي الفنيات', desc: 'فنيات معتمدات في مدينتكِ', href: '/technicians', color: 'from-purple-100 to-purple-200' },
  { emoji: '🛍️', title: 'تسوقي الإطلالة', desc: 'إطلالات متكاملة بضغطة زر', href: '/shop-the-look', color: 'from-pink-100 to-pink-200' },
  { emoji: '📸', title: 'لوك بوك', desc: 'أحدث صيحات وإطلالات الموسم', href: '/lookbook', color: 'from-amber-100 to-amber-200' },
  { emoji: '🥠', title: 'بسكويت الجمال', desc: 'رسالتكِ الجمالية اليومية', href: '/beauty-fortune', color: 'from-rose-100 to-rose-200' },
  { emoji: '✨', title: 'اختبار الجمال', desc: 'اكتشفي الخدمات المناسبة لكِ', href: '/beauty-quiz', color: 'from-violet-100 to-violet-200' },
  { emoji: '📦', title: 'اصنعي باقتكِ', desc: 'خصم يصل إلى ٢٥٪', href: '/bundles', color: 'from-green-100 to-green-200' },
  { emoji: '💅', title: 'باقات التجميل', desc: 'باقات مجمعة بأسعار مخفضة', href: '/beauty-packages', color: 'from-cyan-100 to-cyan-200' },
  { emoji: '👰', title: 'تخطيط الزفاف', desc: 'خدمة شاملة ليومكِ الكبير', href: '/bridal-concierge', color: 'from-pink-100 to-rose-200' },
  { emoji: '👩‍👧', title: 'أم وابنتها', desc: 'باقات مشتركة للأم وابنتها', href: '/mommy-and-me', color: 'from-fuchsia-100 to-fuchsia-200' },
  { emoji: '⚡', title: 'عروض فلاش', desc: 'خصومات لفترة محدودة', href: '/flash-deals', color: 'from-red-100 to-red-200' },
  { emoji: '📢', title: 'العروض والحملات', desc: 'عروض الموسم وخصومات حصرية', href: '/campaigns', color: 'from-orange-100 to-orange-200' },
  { emoji: '📝', title: 'المدونة', desc: 'نصائح واتجاهات الجمال', href: '/blog', color: 'from-blue-100 to-blue-200' },
  { emoji: '💬', title: 'مجتمع الجمال', desc: 'شاركي تجاربكِ وآرائكِ', href: '/community', color: 'from-indigo-100 to-indigo-200' },
  { emoji: '📅', title: 'الفعاليات والورش', desc: 'ورش عمل وماستر كلاس', href: '/events', color: 'from-teal-100 to-teal-200' },
  { emoji: '🏆', title: 'تحديات الجمال', desc: 'أكملي التحديات واكسبي مكافآت', href: '/challenges', color: 'from-yellow-100 to-yellow-200' },
  { emoji: '🏅', title: 'برنامج المكافآت', desc: 'نقاط ومكافآت مع كل حجز', href: '/rewards', color: 'from-amber-100 to-yellow-200' },
  { emoji: '🎁', title: 'دليل الهدايا', desc: 'اختاري الهدية المثالية', href: '/gift-guide', color: 'from-red-100 to-pink-200' },
  { emoji: '💰', title: 'حاسبة التكلفة', desc: 'احسبي تكلفة حجزكِ', href: '/price-estimator', color: 'from-emerald-100 to-emerald-200' },
  { emoji: '🌟', title: 'جولة تعريفية', desc: 'تعرفي على المنصة', href: '/onboarding', color: 'from-purple-100 to-indigo-200' },
  { emoji: '🔍', title: 'بحث', desc: 'ابحثي عن خدمات ومنتجات وفنيات', href: '/search', color: 'from-gray-100 to-gray-200' },
  { emoji: '🛒', title: 'المتجر', desc: 'منتجات تجميل وعناية', href: '/marketplace', color: 'from-lime-100 to-lime-200' },
  { emoji: '📦', title: 'الصناديق الشهرية', desc: 'اشتراك شهري في خدمات التجميل', href: '/subscription-boxes', color: 'from-sky-100 to-sky-200' },
];

export default function DiscoverPage(): JSX.Element {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="text-center mb-10">
        <span className="text-6xl">🧭</span>
        <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-gray-100">اكتشفي جالكسي بيوتي</h1>
        <p className="mt-2 text-gray-500">كل ما تحتاجينه للعناية بجمالكِ في مكان واحد</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {FEATURES.map((f, i) => (
          <Link key={i} href={f.href}>
            <Card hover padding="md" className={`h-full bg-gradient-to-br ${f.color} dark:bg-none dark:bg-gray-900`}>
              <span className="text-3xl">{f.emoji}</span>
              <h3 className="mt-3 font-bold text-sm text-gray-900 dark:text-gray-100">{f.title}</h3>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{f.desc}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
