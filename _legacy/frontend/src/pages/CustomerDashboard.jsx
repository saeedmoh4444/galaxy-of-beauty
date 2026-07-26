import { Link, useSearchParams } from 'react-router-dom';
import { useUserBookings, useTransitionBooking } from '../hooks/useBooking';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

const STATUS_LABELS = {
  REQUESTED: 'قيد الطلب',
  ACCEPTED: 'مقبول',
  PAYMENT_AUTHORIZED: 'تم الدفع',
  CONFIRMED_OFFLINE: 'دفع نقدي',
  PAID: 'مدفوع',
  IN_PROGRESS: 'قيد التنفيذ',
  COMPLETED: 'مكتمل',
  REJECTED: 'مرفوض',
  CANCELLED: 'ملغي',
  NO_SHOW: 'لم تحضر',
};

const STATUS_COLORS = {
  REQUESTED: 'badge-pending',
  ACCEPTED: 'badge-info',
  PAYMENT_AUTHORIZED: 'badge-purple',
  CONFIRMED_OFFLINE: 'badge-info',
  PAID: 'badge-purple',
  IN_PROGRESS: 'badge-info',
  COMPLETED: 'badge-success',
  REJECTED: 'badge-error',
  CANCELLED: 'badge-error',
  NO_SHOW: 'badge-error',
};

export default function CustomerDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeFilter = searchParams.get('status') || '';
  const { data, isLoading } = useUserBookings(activeFilter ? { status: activeFilter } : {});
  const transitionBooking = useTransitionBooking();

  // Spending insights & streak
  const { data: insights } = useQuery({
    queryKey: ['spending-insights'],
    queryFn: async () => { const { data } = await api.get('/customer/spending-insights'); return data; },
    staleTime: 60000,
  });
  const { data: streakData } = useQuery({
    queryKey: ['streaks'],
    queryFn: async () => { const { data } = await api.get('/streaks'); return data; },
    staleTime: 60000,
  });

  const bookings = data?.bookings || [];
  const stats = {
    active: bookings.filter((b) => ['REQUESTED', 'ACCEPTED', 'IN_PROGRESS', 'PAYMENT_AUTHORIZED', 'CONFIRMED_OFFLINE', 'PAID'].includes(b.status)).length,
    completed: bookings.filter((b) => b.status === 'COMPLETED').length,
    cancelled: bookings.filter((b) => ['REJECTED', 'CANCELLED'].includes(b.status)).length,
  };

  const setFilter = (status) => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    setSearchParams(params);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 font-display">حجوزاتي</h1>
        <Link to="/book" className="btn-primary">+ حجز جديد</Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'النشطة', value: stats.active, icon: '📋', color: 'bg-blue-50' },
          { label: 'المكتملة', value: stats.completed, icon: '✅', color: 'bg-green-50' },
          { label: 'الملغية', value: stats.cancelled, icon: '❌', color: 'bg-red-50' },
          { label: 'المواظبة', value: streakData?.currentStreak ? `${streakData.currentStreak} أسابيع` : '—', icon: '🔥', color: 'bg-orange-50', sub: streakData?.longestStreak ? `الأطول: ${streakData.longestStreak}` : '' },
        ].map((s) => (
          <button key={s.label} onClick={() => setFilter(s.label === 'النشطة' ? 'REQUESTED,ACCEPTED,IN_PROGRESS,PAYMENT_AUTHORIZED,CONFIRMED_OFFLINE,PAID' : s.label === 'المكتملة' ? 'COMPLETED' : 'REJECTED,CANCELLED')} className={`card ${s.color} text-center cursor-pointer hover:shadow-md transition-shadow`}>
            <span className="text-2xl">{s.icon}</span>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
            {s.sub && <p className="text-xs text-gray-400 mt-1">{s.sub}</p>}
          </button>
        ))}
      </div>

      {/* Spending Insights Banner */}
      {insights && (
        <div className="card mb-8 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
            <div>
              <span className="text-sm text-purple-700 font-semibold">📊 ملخص إنفاقك</span>
              <p className="text-sm text-gray-600 mt-1">
                {insights.spending?.totalBookings > 0
                  ? `أنفقتِ ${Math.round(insights.spending.totalAllTime).toLocaleString('ar-SA')} ر.س في ${insights.spending.totalBookings} حجز. ${insights.favorites?.[0] ? `المفضلة: ${insights.favorites[0].category}` : ''}`
                  : 'ابدئي رحلتك مع جالكسي بيوتي! 🎉'}
              </p>
            </div>
            <Link to="/wallet" className="text-sm text-primary-600 hover:text-primary-700 font-medium whitespace-nowrap">
              عرض المحفظة ←
            </Link>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {[{ key: '', label: 'الكل' }, { key: 'REQUESTED', label: 'قيد الطلب' }, { key: 'ACCEPTED', label: 'مقبولة' }, { key: 'COMPLETED', label: 'مكتملة' }].map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
              ${activeFilter === f.key ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Booking List */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-400">جاري تحميل الحجوزات...</div>
      ) : bookings.length === 0 ? (
        <div className="card text-center py-16">
          <span className="text-5xl block mb-4">📋</span>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">لا توجد حجوزات</h3>
          <p className="text-gray-500 mb-6">ابدئي بحجز خدمتك الأولى!</p>
          <Link to="/services" className="btn-primary inline-block">تصفحي الخدمات</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="card hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`badge text-xs ${STATUS_COLORS[booking.status] || 'badge-pending'}`}>
                      {STATUS_LABELS[booking.status] || booking.status}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">{booking.bookingCode}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">{booking.service?.titleJson?.ar}</h3>
                  <div className="flex gap-4 mt-2 text-sm text-gray-500">
                    <span>📅 {new Date(booking.startAt).toLocaleDateString('ar-SA', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                    <span>⏰ {new Date(booking.startAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span>
                    <span>💰 {Number(booking.totalAmount).toLocaleString('ar-SA')} ر.س</span>
                  </div>
                  {booking.technician && (
                    <p className="text-sm text-gray-400 mt-2">
                      المتخصصة: {booking.technician.name}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    📍 {booking.address?.label} - {booking.address?.street}، {booking.address?.area}
                  </p>
                </div>
                <div className="flex sm:flex-col gap-2 justify-end">
                  {booking.status === 'REQUESTED' && (
                    <button onClick={() => { if (window.confirm('هل أنت متأكد من إلغاء الحجز؟')) transitionBooking.mutate({ bookingId: booking.id, action: 'cancel' }); }}
                      className="btn-ghost text-red-600 text-sm py-1.5">إلغاء</button>
                  )}
                  {booking.status === 'COMPLETED' && !booking.review && (
                    <button className="btn-secondary text-sm py-1.5">تقييم ⭐</button>
                  )}
                  {booking.status === 'ACCEPTED' && (
                    <button className="btn-primary text-sm py-1.5">الدفع 💳</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
