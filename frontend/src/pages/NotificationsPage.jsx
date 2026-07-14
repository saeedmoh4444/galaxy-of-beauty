import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../lib/api';

const NOTIF_TYPES = {
  booking_request: { icon: '📨', label: 'طلب حجز' },
  booking_created: { icon: '📋', label: 'حجز جديد' },
  booking_accepted: { icon: '✅', label: 'قبول حجز' },
  booking_rejected: { icon: '❌', label: 'رفض حجز' },
  booking_cancelled: { icon: '🚫', label: 'إلغاء حجز' },
  payment_success: { icon: '💳', label: 'دفع' },
  booking_reminder: { icon: '⏰', label: 'تذكير' },
  review_request: { icon: '⭐', label: 'تقييم' },
};

export default function NotificationsPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => { const { data } = await api.get('/notifications'); return data; },
    staleTime: 1000 * 15,
  });

  const markRead = useMutation({
    mutationFn: (id) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllRead = useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notifications'] }); toast.success('تم تعليم الكل كمقروء'); },
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-display">الإشعارات</h1>
          {unreadCount > 0 && <p className="text-sm text-primary-600 mt-1">{unreadCount} إشعار غير مقروء</p>}
        </div>
        {unreadCount > 0 && (
          <button onClick={() => markAllRead.mutate()} className="btn-ghost text-sm">تعليم الكل كمقروء</button>
        )}
      </div>

      {isLoading ? (
        <p className="text-center py-8 text-gray-400">جاري التحميل...</p>
      ) : notifications.length === 0 ? (
        <div className="card text-center py-16">
          <span className="text-5xl block mb-4">🔔</span>
          <p className="text-gray-500">لا توجد إشعارات</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const meta = NOTIF_TYPES[n.type] || { icon: '🔔', label: n.type };
            return (
              <div key={n.id}
                className={`card flex items-start gap-4 cursor-pointer transition-all hover:shadow-md
                  ${!n.isRead ? 'border-primary-200 bg-primary-50/30' : ''}`}
                onClick={() => { if (!n.isRead) markRead.mutate(n.id); }}>
                <span className="text-2xl">{meta.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-gray-800 text-sm">{n.titleJson?.ar}</h3>
                    {!n.isRead && <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-1" />}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{n.bodyJson?.ar}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="text-xs text-gray-300">{meta.label}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
