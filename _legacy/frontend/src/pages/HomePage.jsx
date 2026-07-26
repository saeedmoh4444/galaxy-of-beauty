import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import OnboardingQuiz from '../components/ai/OnboardingQuiz';

export default function HomePage() {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuthStore();
  const [showQuiz, setShowQuiz] = useState(false);

  // Check if quiz already completed
  const { data: quizData } = useQuery({
    queryKey: ['quiz'],
    queryFn: async () => { const { data } = await api.get('/ai/quiz'); return data.quiz; },
    enabled: isAuthenticated && user?.role === 'CUSTOMER',
  });

  // Show quiz prompt if customer hasn't taken it
  useEffect(() => {
    if (isAuthenticated && user?.role === 'CUSTOMER' && quizData === null) {
      const dismissed = localStorage.getItem('quiz-dismissed');
      if (!dismissed) {
        const timer = setTimeout(() => setShowQuiz(true), 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated, user, quizData]);

  // Recommendations for logged-in users
  const { data: recsData } = useQuery({
    queryKey: ['recommendations'],
    queryFn: async () => { const { data } = await api.get('/ai/recommend?limit=4'); return data.recommendations; },
    enabled: isAuthenticated,
  });

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold font-display leading-tight mb-6">
              منصتك الآمنة لحجز خدمات التجميل والعناية
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8 leading-relaxed">
              احجزي خدمات التجميل والعناية الشخصية مع أفضل المتخصصات في المملكة.
              آمنة، موثوقة، ومصممة خصيصاً لكِ.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/services" className="btn-primary bg-white text-primary-700 hover:bg-gray-100 text-center">
                تصفحي الخدمات
              </Link>
              <Link to="/services/surprise-me" className="btn-secondary border-white text-white hover:bg-white/10 text-center">
                ✨ فاجئيني
              </Link>
              <Link to="/register" className="btn-secondary border-white text-white hover:bg-white/10 text-center">
                انضمي إلينا
              </Link>
            </div>
          </div>
        </div>
        {/* Decorative */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent" />
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="section-title">فئات الخدمات</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {[
            { icon: '💇‍♀️', label: 'العناية بالشعر', slug: 'hair-care' },
            { icon: '💅', label: 'الأظافر', slug: 'nail-care' },
            { icon: '✨', label: 'البشرة', slug: 'skin-care' },
            { icon: '💄', label: 'مكياج', slug: 'makeup' },
            { icon: '💆‍♀️', label: 'العناية بالجسم', slug: 'body-care' },
            { icon: '🌿', label: 'حناء', slug: 'henna' },
          ].map((cat) => (
            <Link
              key={cat.label}
              to={`/services?categorySlug=${cat.slug}`}
              className="card-hover text-center py-6 flex flex-col items-center gap-3"
            >
              <span className="text-3xl">{cat.icon}</span>
              <span className="text-sm font-medium text-gray-700">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Services */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="section-title mb-0">الخدمات الأكثر طلباً</h2>
            <Link to="/services" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
              عرض الكل ←
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Placeholder cards - populated from API in Sprint 2 */}
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card-hover cursor-pointer">
                <div className="h-40 bg-gray-200 rounded-xl mb-4 animate-pulse" />
                <h3 className="font-semibold text-gray-900 mb-1">خدمة تجميلية {i}</h3>
                <p className="text-sm text-gray-500 mb-3">وصف مختصر للخدمة</p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-primary-600">من ٨٠ ر.س</span>
                  <span className="text-xs text-gray-400">⏱ ٤٥ دقيقة</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Recommendations */}
      {isAuthenticated && recsData && recsData.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="section-title mb-0">✨ موصى به لكِ</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recsData.slice(0, 4).map((rec) => (
              <Link key={rec.service.id} to={`/services/${rec.service.id}`} className="card-hover group cursor-pointer block">
                <div className="h-32 bg-gradient-to-br from-primary-100 to-purple-100 rounded-xl mb-3 flex items-center justify-center">
                  <span className="text-3xl opacity-30">✨</span>
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors text-sm">
                  {rec.service.titleJson?.ar}
                </h3>
                <p className="text-xs text-gray-400 mt-1">{rec.reason}</p>
                <p className="font-bold text-primary-600 mt-2">{Number(rec.service.basePrice).toLocaleString('ar-SA')} ر.س</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Trust Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: '🔒', title: 'آمنة وموثوقة', desc: 'جميع المتخصصات خاضعات للتحقق والتدقيق' },
            { icon: '💎', title: 'جودة مضمونة', desc: 'تقييمات ومراجعات حقيقية من العملاء' },
            { icon: '⚡', title: 'حجز فوري', desc: 'احجزي خدمتك في دقائق مع تأكيد فوري' },
          ].map((item) => (
            <div key={item.title} className="card text-center">
              <span className="text-4xl block mb-4">{item.icon}</span>
              <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold font-display mb-4">انضمي إلى آلاف المستخدمات اليوم</h2>
          <p className="text-white/80 mb-8 max-w-lg mx-auto">
            انضمي إلى منصة جالكسي بيوتي واستمتعي بتجربة حجز فريدة وآمنة
          </p>
          <Link to="/register" className="btn-primary bg-white text-primary-700 hover:bg-gray-100 inline-block">
            ابدئي الآن مجاناً
          </Link>
        </div>
      </section>

      {/* Onboarding Quiz Modal */}
      {showQuiz && (
        <OnboardingQuiz onComplete={() => { setShowQuiz(false); localStorage.setItem('quiz-dismissed', 'true'); }} />
      )}
    </div>
  );
}
