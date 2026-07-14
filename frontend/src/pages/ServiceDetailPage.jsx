import { useParams, Link, useNavigate } from 'react-router-dom';
import { useServiceDetail } from '../hooks/useCatalog';
import { useAuthStore } from '../store/authStore';
import LoadingScreen from '../components/ui/LoadingScreen';

export default function ServiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { data: service, isLoading, error } = useServiceDetail(Number(id));

  if (isLoading) return <LoadingScreen />;
  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <span className="text-6xl block mb-4">😔</span>
        <h2 className="text-xl font-bold text-gray-900 mb-2">الخدمة غير موجودة</h2>
        <p className="text-gray-500 mb-6">لم نتمكن من العثور على هذه الخدمة</p>
        <Link to="/services" className="btn-primary">تصفح الخدمات</Link>
      </div>
    );
  }

  if (!service) return null;

  const handleBook = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/services/${id}` } });
    } else if (user?.role === 'CUSTOMER') {
      navigate(`/book/${service.id}`);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link to="/services" className="hover:text-primary-600">الخدمات</Link>
        <span>/</span>
        {service.category && (
          <>
            <span>{service.category.nameJson?.ar}</span>
            <span>/</span>
          </>
        )}
        <span className="text-gray-700 font-medium">{service.titleJson?.ar}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image */}
          <div className="h-64 sm:h-80 bg-gradient-to-br from-primary-100 via-purple-100 to-pink-100 rounded-2xl flex items-center justify-center">
            <span className="text-8xl opacity-30">
              {service.category?.slug?.startsWith('hair') ? '💇‍♀️' :
               service.category?.slug?.startsWith('nail') ? '💅' :
               service.category?.slug?.startsWith('makeup') ? '💄' : '✨'}
            </span>
          </div>

          {/* Title & Price */}
          <div>
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 font-display">
                  {service.titleJson?.ar}
                </h1>
                <p className="text-sm text-gray-500 mt-1">{service.titleJson?.en}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-primary-600">
                  {Number(service.basePrice).toLocaleString('ar-SA')} ر.س
                </p>
                <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                  <span>⏱</span> {service.durationMin} دقيقة
                </p>
              </div>
            </div>

            {/* Tags */}
            {service.tags?.length > 0 && (
              <div className="flex gap-2 mt-4 flex-wrap">
                {service.tags.map((t) => (
                  <span key={t.tag.id} className="badge badge-purple text-xs">
                    {t.tag.nameJson?.ar}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          {service.descriptionJson?.ar && (
            <div className="card">
              <h2 className="font-semibold text-gray-900 mb-3">وصف الخدمة</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {service.descriptionJson.ar}
              </p>
            </div>
          )}

          {/* Variants */}
          {service.variants?.length > 0 && (
            <div className="card">
              <h2 className="font-semibold text-gray-900 mb-4">الخيارات المتاحة</h2>
              <div className="space-y-3">
                {service.variants.map((v) => (
                  <div key={v.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">{v.nameJson?.ar}</p>
                      <p className="text-xs text-gray-400">{v.nameJson?.en}</p>
                    </div>
                    <div className="text-right">
                      {Number(v.priceDelta) !== 0 && (
                        <p className={`font-semibold ${v.priceDelta > 0 ? 'text-red-500' : 'text-green-500'}`}>
                          {v.priceDelta > 0 ? '+' : ''}{Number(v.priceDelta).toLocaleString('ar-SA')} ر.س
                        </p>
                      )}
                      {v.durationDelta !== 0 && (
                        <p className="text-xs text-gray-400">
                          {v.durationDelta > 0 ? '+' : ''}{v.durationDelta} دقيقة
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add-ons */}
          {service.addons?.length > 0 && (
            <div className="card">
              <h2 className="font-semibold text-gray-900 mb-4">الإضافات المتاحة</h2>
              <div className="space-y-3">
                {service.addons.map((a) => (
                  <div key={a.addon.id} className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">{a.addon.titleJson?.ar}</p>
                      <p className="text-xs text-gray-400">{a.addon.titleJson?.en}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary-600">
                        +{Number(a.addon.basePrice).toLocaleString('ar-SA')} ر.س
                      </p>
                      <p className="text-xs text-gray-400">⏱ {a.addon.durationMin} د</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Technicians */}
          {service.technicianServices?.length > 0 && (
            <div className="card">
              <h2 className="font-semibold text-gray-900 mb-4">متخصصات يقدمن هذه الخدمة</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {service.technicianServices.map((ts) => (
                  <div key={ts.technician.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-lg">
                      👩‍🦰
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm truncate">
                        {ts.technician.user?.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>⭐ {Number(ts.technician.ratingAvg || 0).toFixed(1)}</span>
                      </div>
                    </div>
                    {ts.customPrice && (
                      <span className="text-sm font-semibold text-primary-600">
                        {Number(ts.customPrice).toLocaleString('ar-SA')} ر.س
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Booking CTA */}
        <div className="lg:col-span-1">
          <div className="card sticky top-20">
            <div className="text-center mb-6">
              <p className="text-2xl font-bold text-primary-600">
                {Number(service.basePrice).toLocaleString('ar-SA')} ر.س
              </p>
              <p className="text-sm text-gray-500 mt-1">⏱ {service.durationMin} دقيقة</p>
            </div>

            <button onClick={handleBook} className="btn-primary w-full text-lg py-4">
              احجزي الآن
            </button>

            <div className="mt-6 space-y-3 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <span>✅</span> حجز فوري ومؤكد
              </div>
              <div className="flex items-center gap-2">
                <span>🔒</span> دفع آمن ومضمون
              </div>
              <div className="flex items-center gap-2">
                <span>⭐</span> متخصصات معتمدات
              </div>
              <div className="flex items-center gap-2">
                <span>🔄</span> إلغاء مجاني قبل ٢٤ ساعة
              </div>
            </div>

            {/* Category */}
            {service.category && (
              <div className="mt-6 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-1">الفئة</p>
                <Link
                  to={`/services?categoryId=${service.category.id}`}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  {service.category.nameJson?.ar}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
