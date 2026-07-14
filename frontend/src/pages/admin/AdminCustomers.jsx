import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import Badge from '../../components/shared/Badge';
import Pagination from '../../components/shared/Pagination';

export default function AdminCustomers() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['admin-customers', page, activeFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ page, limit: '15' });
      if (activeFilter) params.set('isActive', activeFilter);
      const { data } = await api.get(`/admin/customers?${params}`);
      return data;
    },
  });
  const customers = data?.customers || [];
  const pag = data?.pagination || {};

  const handleSuspend = async (userId, suspend) => {
    const reason = suspend ? prompt('سبب التعليق:') : '';
    try {
      await api.patch(`/admin/users/${userId}/suspend?suspend=${suspend}`, { reason: reason || 'Admin action' });
      qc.invalidateQueries({ queryKey: ['admin-customers'] });
      toast.success(suspend ? 'تم تعليق العميلة' : 'تم إلغاء التعليق');
    } catch { toast.error('فشل الإجراء'); }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      qc.invalidateQueries({ queryKey: ['admin-customers'] });
      toast.success(`تم تغيير الدور إلى ${newRole}`);
    } catch { toast.error('فشل تغيير الدور'); }
  };

  if (isLoading) return <div className="card"><p className="text-center py-8 text-gray-400">جاري التحميل...</p></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">العميلات ({pag.total || 0})</h2>
        <select value={activeFilter} onChange={(e) => { setActiveFilter(e.target.value); setPage(1); }} className="input-field text-sm py-1.5 w-36">
          <option value="">الكل</option>
          <option value="true">نشط</option>
          <option value="false">غير نشط / معلق</option>
        </select>
      </div>
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-right px-4 py-3 font-medium text-gray-600">الاسم</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">البريد</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">الهاتف</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">المحفظة</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">آخر دخول</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">الحالة</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{c.email}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{c.phone}</td>
                  <td className="px-4 py-3 text-xs">{c.wallet ? `${Number(c.wallet.balance).toLocaleString('ar-SA')} ر.س` : '—'}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{c.lastLoginAt ? new Date(c.lastLoginAt).toLocaleDateString('ar-SA') : '—'}</td>
                  <td className="px-4 py-3"><Badge variant={c.isActive ? 'success' : 'error'}>{c.isActive ? 'نشط' : 'معلق'}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      <button onClick={() => handleSuspend(c.id, !c.isActive)} className="text-xs text-orange-600 hover:underline">{c.isActive ? 'تعليق' : 'إلغاء التعليق'}</button>
                      <button onClick={() => handleRoleChange(c.id, 'TECHNICIAN')} className="text-xs text-blue-600 hover:underline">ترقية</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {customers.length === 0 && <p className="text-center py-8 text-gray-400">لا توجد عميلات</p>}
      </div>
      <Pagination page={pag.page || 1} totalPages={pag.totalPages || 1} onPageChange={setPage} />
    </div>
  );
}
