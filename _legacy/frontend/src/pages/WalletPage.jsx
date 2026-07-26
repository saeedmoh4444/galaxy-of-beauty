import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useWallet, useWalletTransactions, useWithdraw, useTechnicianPayouts } from '../hooks/useWallet';

const SOURCE_LABELS = {
  CASHBACK: 'استرداد نقدي',
  PLATFORM_FEE_SHARE: 'أرباح المنصة',
  WITHDRAWAL: 'سحب',
  SUBSCRIPTION_BONUS: 'مكافأة اشتراك',
  REFERRAL_BONUS: 'مكافأة إحالة',
  CASH_HANDLING_FEE: 'رسوم الدفع النقدي',
  REFUND: 'استرداد',
};

export default function WalletPage() {
  const { user } = useAuthStore();
  const { data: walletData, isLoading } = useWallet();
  const [activeTab, setActiveTab] = useState('overview');
  const isTechnician = user?.role === 'TECHNICIAN';

  const wallet = walletData?.wallet;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 font-display mb-8">المحفظة</h1>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 mb-8">
        {[
          { key: 'overview', label: 'نظرة عامة', icon: '💰' },
          { key: 'transactions', label: 'المعاملات', icon: '📋' },
          ...(isTechnician ? [{ key: 'withdraw', label: 'سحب', icon: '🏦' }, { key: 'payouts', label: 'المدفوعات', icon: '📊' }] : []),
        ].map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
              ${activeTab === t.key ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500'}`}>
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && <WalletOverview wallet={wallet} isLoading={isLoading} />}
      {activeTab === 'transactions' && <TransactionsList />}
      {activeTab === 'withdraw' && isTechnician && <WithdrawForm wallet={wallet} />}
      {activeTab === 'payouts' && isTechnician && <PayoutsList />}
    </div>
  );
}

function WalletOverview({ wallet, isLoading }) {
  if (isLoading) return <p className="text-center py-8 text-gray-400">جاري تحميل بيانات المحفظة...</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="card text-center">
        <span className="text-4xl block mb-3">💰</span>
        <p className="text-sm text-gray-500">الرصيد القابل للسحب</p>
        <p className="text-4xl font-bold text-primary-600 mt-2">
          {Number(wallet?.balance || 0).toLocaleString('ar-SA')} ر.س
        </p>
      </div>
      <div className="card text-center">
        <span className="text-4xl block mb-3">🎁</span>
        <p className="text-sm text-gray-500">رصيد المكافآت (غير قابل للسحب)</p>
        <p className="text-4xl font-bold text-purple-600 mt-2">
          {Number(wallet?.bonusBalance || 0).toLocaleString('ar-SA')} ر.س
        </p>
      </div>
    </div>
  );
}

function TransactionsList() {
  const [filter, setFilter] = useState('');
  const { data, isLoading } = useWalletTransactions(filter ? { source: filter } : {});

  const transactions = data?.transactions || [];

  return (
    <div>
      <div className="flex gap-2 mb-6 flex-wrap">
        {['', 'CASHBACK', 'PLATFORM_FEE_SHARE', 'WITHDRAWAL', 'SUBSCRIPTION_BONUS'].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
              ${filter === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {SOURCE_LABELS[s] || 'الكل'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-center py-8 text-gray-400">جاري التحميل...</p>
      ) : transactions.length === 0 ? (
        <div className="card text-center py-12">
          <span className="text-4xl block mb-3">📋</span>
          <p className="text-gray-500">لا توجد معاملات</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div key={tx.id} className="card flex justify-between items-center">
              <div>
                <p className="font-semibold text-gray-800">{SOURCE_LABELS[tx.source] || tx.source}</p>
                <p className="text-xs text-gray-400 mt-1">{tx.description || ''}</p>
                <p className="text-xs text-gray-300 mt-1">{new Date(tx.createdAt).toLocaleDateString('ar-SA')}</p>
              </div>
              <span className={`font-bold text-lg ${tx.type === 'CREDIT' ? 'text-green-600' : 'text-red-500'}`}>
                {tx.type === 'CREDIT' ? '+' : '-'}{Number(tx.amount).toLocaleString('ar-SA')} ر.س
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function WithdrawForm({ wallet }) {
  const withdraw = useWithdraw();
  const [amount, setAmount] = useState('');
  const balance = Number(wallet?.balance || 0);
  const fee = amount ? Math.round((Number(amount) * 5) / 100 * 100) / 100 : 0;
  const net = amount ? Number(amount) - fee : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) < 100) return;
    withdraw.mutate(Number(amount), { onSuccess: () => setAmount('') });
  };

  return (
    <div className="card max-w-md">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">طلب سحب</h2>
      <div className="bg-gray-50 rounded-xl p-4 mb-4 text-sm space-y-1">
        <p>الحد الأدنى للسحب: <strong>١٠٠ ر.س</strong></p>
        <p>الحد الأدنى للرصيد: <strong>٢٠٠ ر.س</strong></p>
        <p>رسوم السحب: <strong>٥٪</strong></p>
        <p>رصيدك الحالي: <strong className="text-primary-600">{balance.toLocaleString('ar-SA')} ر.س</strong></p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">المبلغ (ر.س)</label>
          <input type="number" className="input-field" min="100" max={balance} value={amount}
            onChange={(e) => setAmount(e.target.value)} placeholder="أدخل المبلغ" />
        </div>
        {amount > 0 && (
          <div className="text-sm space-y-1 bg-gray-50 rounded-xl p-3">
            <div className="flex justify-between"><span>المبلغ</span><span>{Number(amount).toLocaleString('ar-SA')} ر.س</span></div>
            <div className="flex justify-between text-red-500"><span>رسوم (5%)</span><span>-{fee} ر.س</span></div>
            <hr className="border-gray-200" />
            <div className="flex justify-between font-bold"><span>الصافي</span><span className="text-primary-600">{net.toLocaleString('ar-SA')} ر.س</span></div>
          </div>
        )}
        <button type="submit" disabled={!amount || Number(amount) < 100 || Number(amount) > balance || withdraw.isPending}
          className="btn-primary w-full">
          {withdraw.isPending ? 'جاري المعالجة...' : 'طلب سحب'}
        </button>
      </form>
    </div>
  );
}

function PayoutsList() {
  const { data, isLoading } = useTechnicianPayouts();
  const payouts = data?.payouts || [];

  return (
    <div>
      <div className="card mb-4 text-center">
        <span className="text-sm text-gray-500">إجمالي الأرباح المحولة</span>
        <p className="text-3xl font-bold text-primary-600">
          {Number(data?.totalEarnings || 0).toLocaleString('ar-SA')} ر.س
        </p>
      </div>
      {isLoading ? (
        <p className="text-center py-8 text-gray-400">جاري التحميل...</p>
      ) : payouts.length === 0 ? (
        <div className="card text-center py-12"><p className="text-gray-500">لا توجد مدفوعات بعد</p></div>
      ) : (
        <div className="space-y-3">
          {payouts.map((p) => (
            <div key={p.id} className="card flex justify-between items-center">
              <div>
                <p className="font-semibold text-gray-800">{Number(p.amount).toLocaleString('ar-SA')} ر.س</p>
                <p className="text-xs text-gray-400">{new Date(p.periodStart).toLocaleDateString('ar-SA')} - {new Date(p.periodEnd).toLocaleDateString('ar-SA')}</p>
              </div>
              <span className={`badge ${p.status === 'COMPLETED' ? 'badge-success' : p.status === 'PROCESSING' ? 'badge-info' : 'badge-pending'}`}>
                {p.status === 'COMPLETED' ? 'مكتمل' : p.status === 'PROCESSING' ? 'قيد المعالجة' : 'معلق'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
