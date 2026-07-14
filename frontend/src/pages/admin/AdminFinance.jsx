import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import Badge from '../../components/shared/Badge';

export default function AdminFinance() {
  const { data: financials, isLoading } = useQuery({
    queryKey: ['admin-financials'],
    queryFn: async () => { const { data } = await api.get('/admin/financials'); return data; },
  });
  const { data: payouts } = useQuery({
    queryKey: ['admin-payouts'],
    queryFn: async () => { const { data } = await api.get('/admin/payouts'); return data; },
  });

  const handleProcessPayouts = async () => {
    try {
      const { data } = await api.post('/admin/payouts/process');
      toast.success(`تمت معالجة ${data.processed || 0} دفعة`);
    } catch { toast.error('فشل معالجة المدفوعات'); }
  };

  const handleCalculatePayouts = async () => {
    if (!window.confirm('هل تريد احتساب المدفوعات الأسبوعية لجميع المتخصصات؟')) return;
    try {
      const { data } = await api.post('/admin/payouts/calculate');
      toast.success(`تم احتساب ${data.payoutsCreated || 0} دفعة`);
    } catch { toast.error('فشل احتساب المدفوعات'); }
  };

  if (isLoading) return <div className="card"><p className="text-center py-8 text-gray-400">جاري التحميل...</p></div>;
  const f = financials || {};

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">💰 المالية</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'إجمالي الإيرادات', value: `${Number(f.revenue?.totalAllTime || 0).toLocaleString('ar-SA')} ر.س`, icon: '💰', color: 'bg-green-50' },
          { label: 'إجمالي العمولات', value: `${Number(f.revenue?.totalCommissions || 0).toLocaleString('ar-SA')} ر.س`, icon: '📊', color: 'bg-blue-50' },
          { label: 'مدفوعات معلقة', value: `${Number(f.payouts?.pending?.total || 0).toLocaleString('ar-SA')} ر.س`, icon: '⏳', color: 'bg-yellow-50' },
          { label: 'أرصدة العملاء', value: `${Number(f.wallets?.totalCustomerBalance || 0).toLocaleString('ar-SA')} ر.س`, icon: '👛', color: 'bg-purple-50' },
        ].map((s) => (
          <div key={s.label} className={`card ${s.color}`}>
            <span className="text-2xl">{s.icon}</span>
            <p className="text-xl font-bold text-gray-900 mt-2">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">📋 تفاصيل الإيرادات</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">عمولات آخر ٣٠ يوم</span><span className="font-medium">{Number(f.revenue?.platformFeesLast30Days || 0).toLocaleString('ar-SA')} ر.س</span></div>
            <div className="flex justify-between"><span className="text-gray-500">الإيراد التقديري للاشتراكات الشهرية</span><span className="font-medium">{Number(f.revenue?.estimatedSubscriptionMonthly || 0).toLocaleString('ar-SA')} ر.س</span></div>
            <div className="flex justify-between"><span className="text-gray-500">المدفوعات المكتملة</span><span className="font-medium">{Number(f.payouts?.completed?.total || 0).toLocaleString('ar-SA')} ر.س</span></div>
            <div className="flex justify-between"><span className="text-gray-500">رصيد المكافآت</span><span className="font-medium">{Number(f.wallets?.totalBonusBalance || 0).toLocaleString('ar-SA')} ر.س</span></div>
          </div>
        </div>
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">🏦 المدفوعات للمتخصصات</h3>
          <div className="space-y-3 text-sm mb-4">
            <div className="flex justify-between"><span className="text-gray-500">معلقة</span><span className="font-medium text-yellow-600">{f.payouts?.pending?.count || 0} دفعة ({Number(f.payouts?.pending?.total || 0).toLocaleString('ar-SA')} ر.س)</span></div>
            <div className="flex justify-between"><span className="text-gray-500">مكتملة</span><span className="font-medium text-green-600">{Number(f.payouts?.completed?.total || 0).toLocaleString('ar-SA')} ر.س</span></div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCalculatePayouts} className="btn-secondary text-xs py-1.5">احتساب المدفوعات الأسبوعية</button>
            <button onClick={handleProcessPayouts} className="btn-primary text-xs py-1.5">معالجة المدفوعات</button>
          </div>
          {payouts?.payouts && (
            <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
              <h4 className="text-xs font-semibold text-gray-500">آخر المدفوعات</h4>
              {payouts.payouts.slice(0, 10).map((p) => (
                <div key={p.id} className="flex justify-between text-xs border-b pb-1">
                  <span>#{p.id} — متخصصة {p.technicianId}</span>
                  <span className="font-medium">{Number(p.amount).toLocaleString('ar-SA')} ر.س</span>
                  <Badge variant={p.status === 'COMPLETED' ? 'success' : p.status === 'FAILED' ? 'error' : 'warning'}>
                    {p.status === 'COMPLETED' ? 'مكتمل' : p.status === 'PROCESSING' ? 'قيد المعالجة' : p.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
