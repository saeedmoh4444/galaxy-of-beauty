import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export default function SurpriseMePage() {
  const [budget, setBudget] = useState('');
  const [triggered, setTriggered] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['surprise-me', budget],
    queryFn: async () => {
      const params = budget ? `?maxPrice=${budget}` : '';
      const { data } = await api.get(`/services/surprise-me${params}`);
      return data;
    },
    enabled: false, // Only fetch on button click
  });

  const handleSurprise = () => {
    setTriggered(true);
    refetch();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
      {/* Hero */}
      <div className="mb-10">
        <span className="text-6xl block mb-4">✨</span>
        <h1 className="text-3xl font-bold text-gray-900 font-display mb-3">فاجئيني!</h1>
        <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
          اضغطي الزر وسنختار لكِ خدمة عشوائية تناسب ميزانيتك. اكتشفي شيئاً جديداً اليوم!
        </p>
      </div>

      {/* Budget Input */}
      <div className="mb-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <input
          type="number"
          placeholder="الميزانية (اختياري)"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          className="input-field w-full sm:w-48 text-center"
          min="0"
        />
        <button
          onClick={handleSurprise}
          disabled={isLoading}
          className="btn-primary text-lg px-8 py-3 w-full sm:w-auto"
        >
          {isLoading ? '🎰 جاري الاختيار...' : '✨ فاجئيني!'}
        </button>
      </div>

      {/* Result */}
      {triggered && (
        <div className="mt-8">
          {isLoading && (
            <div className="card py-16 animate-pulse">
              <span className="text-4xl block mb-4">🎰</span>
              <p className="text-gray-400">نبحث عن الخدمة المثالية لكِ...</p>
            </div>
          )}

          {isError && (
            <div className="card py-12 border-red-200 bg-red-50">
              <span className="text-4xl block mb-3">😅</span>
              <p className="text-gray-600">لم نجد خدمة مناسبة. جربي ميزانية مختلفة!</p>
            </div>
          )}

          {data?.service && (
            <div className="card border-2 border-primary-200 bg-gradient-to-br from-purple-50 to-pink-50 animate-fade-in">
              <p className="text-sm text-primary-600 font-medium mb-2">{data.message?.ar}</p>

              <h2 className="text-xl font-bold text-gray-900 mb-2">{data.service.titleJson?.ar}</h2>
              <p className="text-sm text-gray-500 mb-4">{data.service.descriptionJson?.ar}</p>

              <div className="flex justify-center gap-6 text-sm mb-6">
                <span className="font-bold text-primary-600 text-lg">
                  {Number(data.service.basePrice).toLocaleString('ar-SA')} ر.س
                </span>
                <span className="text-gray-400">⏱ {data.service.durationMin} دقيقة</span>
              </div>

              {data.technician && (
                <p className="text-xs text-gray-400 mb-4">
                  متوفرة مع: {data.technician.user?.name || data.technician.name}
                </p>
              )}

              <div className="flex gap-3 justify-center">
                <Link
                  to={`/services/${data.service.id}`}
                  className="btn-primary"
                >
                  عرض التفاصيل
                </Link>
                <button onClick={handleSurprise} className="btn-ghost">
                  🔄 جربي مرة أخرى
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Categories Quick Links */}
      <div className="mt-16 pt-8 border-t border-gray-100">
        <p className="text-sm text-gray-400 mb-4">أو تصفحي حسب الفئة:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {[
            { label: '💇‍♀️ شعر', slug: 'hair-care' },
            { label: '💅 أظافر', slug: 'nail-care' },
            { label: '✨ بشرة', slug: 'skin-care' },
            { label: '💄 مكياج', slug: 'makeup' },
            { label: '💆‍♀️ مساج', slug: 'massage' },
            { label: '🌿 حناء', slug: 'henna' },
          ].map((cat) => (
            <Link
              key={cat.slug}
              to={`/services?categorySlug=${cat.slug}`}
              className="px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-full text-sm text-gray-600 transition-colors"
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 0.5s ease-out; }
      `}</style>
    </div>
  );
}
