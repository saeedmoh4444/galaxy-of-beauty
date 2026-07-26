import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import Badge from '../../components/shared/Badge';
import Pagination from '../../components/shared/Pagination';

const STATUS_LABELS = {
  REQUESTED: 'قيد الطلب', ACCEPTED: 'مقبول', PAYMENT_AUTHORIZED: 'دفع معلق',
  CONFIRMED_OFFLINE: 'دفع نقدي', PAID: 'مدفوع', IN_PROGRESS: 'قيد التنفيذ',
  COMPLETED: 'مكتمل', REJECTED: 'مرفوض', CANCELLED: 'ملغي', NO_SHOW: 'لم تحضر',
};

const statusVariant = (s) => {
  if (s === 'COMPLETED' || s === 'PAID') return 'success';
  if (s === 'CANCELLED' || s === 'REJECTED' || s === 'NO_SHOW') return 'error';
  if (s === 'REQUESTED') return 'info';
  return 'warning';
};

export default function AdminBookings() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['admin-bookings', page, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ page, limit: '15' });
      if (statusFilter) params.set('status', statusFilter);
      const { data } = await api.get(`/admin/bookings?${params}`);
      return data;
    },
  });
  const bookings = data?.bookings || [];
  const pag = data?.pagination || {};

  const handleCancel = async (id) => {
    if (!window.confirm('هل أنت متأكد من إلغاء هذا الحجز؟')) return;
    try {
      await api.patch(`/bookings/${id}/status`, { status: 'CANCELLED' });
      qc.invalidateQueries({ queryKey: ['admin-bookings'] });
      toast.success('تم إلغاء الحجز');
    } catch { toast.error('فشل الإلغاء'); }
  };

  if (isLoading) return <div className="card"><p className="text-center py-8 text-gray-400">جاري التحميل...</p></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">جميع الحجوزات ({pag.total || 0})</h2>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input-field text-sm py-1.5 w-44">
          <option value="">كل الحالات</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-right px-4 py-3 font-medium text-gray-600">الكود</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">العميلة</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">المتخصصة</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">الخدمة</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">المبلغ</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">التاريخ</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">الحالة</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{b.bookingCode}</td>
                  <td className="px-4 py-3">{b.customer?.name}</td>
                  <td className="px-4 py-3">{b.technician?.name}</td>
                  <td className="px-4 py-3 text-gray-500">{b.service?.titleJson?.ar}</td>
                  <td className="px-4 py-3">{Number(b.totalAmount || 0).toLocaleString('ar-SA')} ر.س</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(b.startAt).toLocaleDateString('ar-SA')}</td>
                  <td className="px-4 py-3"><Badge variant={statusVariant(b.status)}>{STATUS_LABELS[b.status] || b.status}</Badge></td>
                  <td className="px-4 py-3">
                    {!['CANCELLED', 'COMPLETED', 'REJECTED'].includes(b.status) && (
                      <button onClick={() => handleCancel(b.id)} className="text-xs text-red-600 hover:underline">إلغاء</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {bookings.length === 0 && <p className="text-center py-8 text-gray-400">لا توجد حجوزات</p>}
      </div>
      <Pagination page={pag.page || 1} totalPages={pag.totalPages || 1} onPageChange={setPage} />
    </div>
  );
}
