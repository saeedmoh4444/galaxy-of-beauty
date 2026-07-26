import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import Badge from '../../components/shared/Badge';
import Pagination from '../../components/shared/Pagination';

export default function AdminTechnicians() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [kycFilter, setKycFilter] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['admin-technicians', page, kycFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ page, limit: '15' });
      if (kycFilter) params.set('kycStatus', kycFilter);
      const { data } = await api.get(`/admin/technicians?${params}`);
      return data;
    },
  });
  const technicians = data?.technicians || [];
  const pag = data?.pagination || {};

  const handleKyc = async (userId, status) => {
    try {
      await api.post(`/admin/users/${userId}/verify-kyc`, { status });
      qc.invalidateQueries({ queryKey: ['admin-technicians'] });
      toast.success(status === 'VERIFIED' ? 'تم توثيق المتخصصة' : 'تم رفض التوثيق');
    } catch { toast.error('فشل الإجراء'); }
  };

  const handleSuspend = async (userId, suspend) => {
    const reason = suspend ? prompt('سبب التعليق:') : '';
    try {
      await api.patch(`/admin/users/${userId}/suspend?suspend=${suspend}`, { reason: reason || 'Admin action' });
      qc.invalidateQueries({ queryKey: ['admin-technicians'] });
      toast.success(suspend ? 'تم تعليق المتخصصة' : 'تم إلغاء التعليق');
    } catch { toast.error('فشل الإجراء'); }
  };

  const handleEcoToggle = async (userId, isEco) => {
    try {
      await api.patch(`/admin/technicians/${userId}/eco-friendly`, { isEcoFriendly: !isEco });
      qc.invalidateQueries({ queryKey: ['admin-technicians'] });
      toast.success(!isEco ? '🌿 تم منح شارة صديقة للبيئة' : 'تم إزالة الشارة');
    } catch { toast.error('فشل الإجراء'); }
  };

  if (isLoading) return <div className="card"><p className="text-center py-8 text-gray-400">جاري التحميل...</p></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">المتخصصات ({pag.total || 0})</h2>
        <select value={kycFilter} onChange={(e) => { setKycFilter(e.target.value); setPage(1); }} className="input-field text-sm py-1.5 w-40">
          <option value="">كل الحالات</option>
          <option value="PENDING">بانتظار التوثيق</option>
          <option value="VERIFIED">موثقة</option>
          <option value="REJECTED">مرفوضة</option>
        </select>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-right px-4 py-3 font-medium text-gray-600">الاسم</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">البريد</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">المدينة</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">KYC</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">الحالة</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">التقييم</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {technicians.map((tech) => (
                <tr key={tech.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{tech.user?.name}</span>
                      {tech.isEcoFriendly && <span title="صديقة للبيئة">🌿</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{tech.user?.email}</td>
                  <td className="px-4 py-3 text-gray-500">{tech.city}</td>
                  <td className="px-4 py-3">
                    <Badge variant={tech.kycStatus === 'VERIFIED' ? 'success' : tech.kycStatus === 'REJECTED' ? 'error' : 'warning'}>
                      {tech.kycStatus === 'VERIFIED' ? 'موثقة' : tech.kycStatus === 'REJECTED' ? 'مرفوضة' : 'قيد الانتظار'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={tech.user?.isActive ? 'success' : 'error'}>
                      {tech.user?.isActive ? 'نشط' : tech.suspendedAt ? 'معلقة' : 'غير نشط'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">⭐ {Number(tech.ratingAvg || 0).toFixed(1)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {tech.kycStatus === 'PENDING' && (
                        <>
                          <button onClick={() => handleKyc(tech.userId, 'VERIFIED')} className="text-xs text-green-600 hover:underline">قبول</button>
                          <button onClick={() => handleKyc(tech.userId, 'REJECTED')} className="text-xs text-red-600 hover:underline">رفض</button>
                        </>
                      )}
                      <button onClick={() => handleSuspend(tech.userId, !tech.user?.isActive)} className="text-xs text-orange-600 hover:underline">
                        {tech.user?.isActive ? 'تعليق' : 'إلغاء التعليق'}
                      </button>
                      <button onClick={() => handleEcoToggle(tech.userId, tech.isEcoFriendly)} className="text-xs text-green-600 hover:underline">
                        {tech.isEcoFriendly ? 'إزالة 🌿' : '🌿'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {technicians.length === 0 && <p className="text-center py-8 text-gray-400">لا توجد متخصصات</p>}
      </div>
      <Pagination page={pag.page || 1} totalPages={pag.totalPages || 1} onPageChange={setPage} />
    </div>
  );
}
