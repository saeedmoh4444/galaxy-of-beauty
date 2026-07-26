import { useState } from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../lib/api';
import {
  useCategories,
  useServices,
  useCreateCategory,
  useCreateService,
  useUpdateService,
  useDeleteService,
} from '../hooks/useCatalog';
import Badge from '../components/shared/Badge';
import Pagination from '../components/shared/Pagination';
import Loading from '../components/shared/Loading';
import EmptyState from '../components/shared/EmptyState';
import AdminTechnicians from './admin/AdminTechnicians';
import AdminCustomers from './admin/AdminCustomers';
import AdminBookings from './admin/AdminBookings';
import AdminFinance from './admin/AdminFinance';

// =============================================================================
// Admin Overview
// =============================================================================
function AdminOverview() {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => { const { data } = await api.get('/admin/stats'); return data; },
  });
  const { data: revenueChart } = useQuery({
    queryKey: ['admin-revenue-chart'],
    queryFn: async () => { const { data } = await api.get('/admin/revenue-chart'); return data; },
  });
  const { data: bookingStats } = useQuery({
    queryKey: ['admin-booking-stats'],
    queryFn: async () => { const { data } = await api.get('/admin/booking-stats'); return data; },
  });
  const { data: financials } = useQuery({
    queryKey: ['admin-financials'],
    queryFn: async () => { const { data } = await api.get('/admin/financials'); return data; },
  });
  const { data: topTechs } = useQuery({
    queryKey: ['admin-top-technicians'],
    queryFn: async () => { const { data } = await api.get('/admin/top-technicians?limit=5'); return data; },
  });

  const c = stats?.counts || {};

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">نظرة عامة</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'المستخدمين', value: c.users || '—', icon: '👥', color: 'bg-blue-50' },
          { label: 'المتخصصات', value: c.technicians || '—', icon: '💇‍♀️', color: 'bg-purple-50' },
          { label: 'الحجوزات', value: c.bookings || '—', icon: '📋', color: 'bg-green-50' },
          { label: 'الإيرادات', value: stats?.revenue?.total ? `${Number(stats.revenue.total).toLocaleString('ar-SA')} ر.س` : '—', icon: '💰', color: 'bg-yellow-50' },
        ].map((stat) => (
          <div key={stat.label} className={`card ${stat.color}`}>
            <span className="text-2xl">{stat.icon}</span>
            <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Financial KPIs */}
      {financials && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card bg-green-50"><span className="text-sm text-gray-500">إجمالي الإيرادات</span><p className="text-xl font-bold">{Number(financials.revenue?.totalAllTime || 0).toLocaleString('ar-SA')} ر.س</p></div>
          <div className="card bg-blue-50"><span className="text-sm text-gray-500">عمولات المنصة</span><p className="text-xl font-bold">{Number(financials.revenue?.totalCommissions || 0).toLocaleString('ar-SA')} ر.س</p></div>
          <div className="card bg-yellow-50"><span className="text-sm text-gray-500">مدفوعات معلقة</span><p className="text-xl font-bold">{financials.payouts?.pending?.count || 0} ({(Number(financials.payouts?.pending?.total || 0)).toLocaleString('ar-SA')} ر.س)</p></div>
          <div className="card bg-purple-50"><span className="text-sm text-gray-500">أرصدة المحافظ</span><p className="text-xl font-bold">{Number(financials.wallets?.totalCustomerBalance || 0).toLocaleString('ar-SA')} ر.س</p></div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">الإيرادات (آخر ٣٠ يوم)</h3>
          {revenueChart ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={revenueChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => [`${v} ر.س`, 'الإيرادات']} />
                <Bar dataKey="revenue" fill="#7C3AED" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <Loading />}
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">حالات الحجوزات</h3>
          {bookingStats ? (
            <div className="space-y-2">
              {bookingStats.filter(b => b.count > 0).map((b) => (
                <div key={b.status} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{b.status}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${Math.min(100, (b.count / (bookingStats.reduce((s, x) => s + x.count, 0) || 1)) * 100)}%` }} />
                    </div>
                    <span className="text-sm font-medium text-gray-700 w-8">{b.count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : <Loading />}
        </div>
      </div>

      {/* Top Technicians */}
      {topTechs?.top && topTechs.top.length > 0 && (
        <div className="card mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">⭐ أفضل المتخصصات</h3>
          <div className="space-y-3">
            {topTechs.top.slice(0, 5).map((t, i) => (
              <div key={t.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                <span className="text-lg font-bold text-gray-300 w-6">#{i + 1}</span>
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-sm">👩‍🎨</div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.city} · {t.completedBookings} حجز</p>
                </div>
                <span className="text-sm font-bold text-yellow-600">⭐ {Number(t.ratingAvg).toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats?.recentUsers && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3">آخر المستخدمين</h3>
          <div className="space-y-2">
            {stats.recentUsers.map((u) => (
              <div key={u.id} className="flex justify-between text-sm">
                <span>{u.name} <span className="text-xs text-gray-400">({u.role === 'TECHNICIAN' ? 'متخصصة' : 'عميلة'})</span></span>
                <span className="text-gray-400">{new Date(u.createdAt).toLocaleDateString('ar-SA')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Admin Catalog Management
// =============================================================================
function AdminCatalog() {
  const [activeTab, setActiveTab] = useState('services');
  const { data: categories } = useCategories();

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">إدارة الكتالوج</h2>

      <div className="flex gap-2 border-b border-gray-200 mb-6">
        {[
          { key: 'services', label: 'الخدمات' },
          { key: 'categories', label: 'الفئات' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors
              ${activeTab === tab.key ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'services' && <AdminServicesList categories={categories} />}
      {activeTab === 'categories' && <AdminCategoriesList categories={categories} />}
    </div>
  );
}

// ---- Services Management ----
function AdminServicesList({ categories }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const { data: servicesData, isLoading } = useServices({ limit: 50 });
  const deleteService = useDeleteService();
  const services = servicesData?.services || [];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">{services.length} خدمة</p>
        <button onClick={() => { setShowForm(true); setEditingId(null); }} className="btn-primary text-sm py-2">
          + إضافة خدمة
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <ServiceFormModal
          categories={categories}
          service={editingId ? services.find((s) => s.id === editingId) : null}
          onClose={() => { setShowForm(false); setEditingId(null); }}
        />
      )}

      {/* Services Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-right px-4 py-3 font-medium text-gray-600">الخدمة</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">الفئة</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">السعر</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">المدة</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">الحالة</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {services.map((svc) => (
                <tr key={svc.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{svc.titleJson?.ar}</td>
                  <td className="px-4 py-3 text-gray-500">{svc.category?.nameJson?.ar}</td>
                  <td className="px-4 py-3">{Number(svc.basePrice).toLocaleString('ar-SA')} ر.س</td>
                  <td className="px-4 py-3">{svc.durationMin} د</td>
                  <td className="px-4 py-3">
                    <span className={svc.isActive ? 'badge-success' : 'badge-error'}>
                      {svc.isActive ? 'نشط' : 'غير نشط'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setEditingId(svc.id); setShowForm(true); }}
                        className="text-xs text-primary-600 hover:text-primary-700"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('هل أنت متأكد من حذف هذه الخدمة؟')) deleteService.mutate(svc.id);
                        }}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {isLoading && <p className="text-center py-8 text-gray-400">جاري التحميل...</p>}
      </div>
    </div>
  );
}

// =============================================================================
// Admin Disputes Tab
// =============================================================================
function AdminDisputes() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-disputes'],
    queryFn: async () => { const { data } = await api.get('/disputes/admin'); return data; },
  });
  const disputes = data?.disputes || [];

  const resolveDispute = async (id, status, resolution) => {
    try {
      await api.patch(`/disputes/${id}/resolve`, { status, resolution: resolution || 'Resolved by admin' });
      qc.invalidateQueries({ queryKey: ['admin-disputes'] });
      toast.success('تم حل النزاع');
    } catch (err) { toast.error(err.response?.data?.error?.message || 'فشل حل النزاع'); }
  };

  if (isLoading) return <p className="text-center py-8 text-gray-400">جاري التحميل...</p>;

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">النزاعات ({disputes.length})</h2>
      {disputes.length === 0 ? (
        <EmptyState icon="⚖️" message="لا توجد نزاعات" />
      ) : (
        <div className="space-y-4">
          {disputes.map((d) => (
            <div key={d.id} className="card">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-xs text-gray-400">{d.booking?.bookingCode}</span>
                  <h3 className="font-semibold text-gray-800">{d.reason}</h3>
                  <p className="text-sm text-gray-500">{d.description}</p>
                  <p className="text-xs text-gray-400 mt-1">مقدم من: {d.raiser?.name} ({d.raiser?.role})</p>
                </div>
                <span className={`badge ${d.status === 'OPEN' ? 'badge-error' : d.status.includes('RESOLVED') ? 'badge-success' : 'badge-pending'}`}>
                  {d.status === 'OPEN' ? 'مفتوح' : d.status.includes('RESOLVED') ? 'تم الحل' : 'مغلق'}
                </span>
              </div>
              {d.status === 'OPEN' && (
                <div className="flex gap-2">
                  <button onClick={() => resolveDispute(d.id, 'RESOLVED_CUSTOMER', 'تم الحل لصالح العميلة')} className="btn-primary text-xs py-1.5">حل للعميلة</button>
                  <button onClick={() => resolveDispute(d.id, 'RESOLVED_TECHNICIAN', 'تم الحل لصالح المتخصصة')} className="btn-secondary text-xs py-1.5">حل للمتخصصة</button>
                  <button onClick={() => resolveDispute(d.id, 'CLOSED', 'تم الإغلاق')} className="btn-ghost text-xs py-1.5">إغلاق</button>
                </div>
              )}
              {d.resolver && <p className="text-xs text-gray-400 mt-2">تم الحل بواسطة: {d.resolver.name}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Service Form Modal ----
function ServiceFormModal({ categories, service, onClose }) {
  const createService = useCreateService();
  const updateService = useUpdateService();

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: service || {
      categoryId: '', titleJson_ar: '', titleJson_en: '', basePrice: '', durationMin: '',
      descriptionJson_ar: '', descriptionJson_en: '', isActive: true, isPopular: false,
    },
  });

  const onSubmit = (data) => {
    const payload = {
      categoryId: Number(data.categoryId),
      titleJson: { ar: data.titleJson_ar, en: data.titleJson_en },
      descriptionJson: { ar: data.descriptionJson_ar || '', en: data.descriptionJson_en || '' },
      basePrice: Number(data.basePrice),
      durationMin: Number(data.durationMin),
      isActive: data.isActive,
      isPopular: data.isPopular,
    };

    if (service) {
      updateService.mutate({ id: service.id, ...payload }, { onSuccess: onClose });
    } else {
      createService.mutate(payload, { onSuccess: onClose });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="card max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-4">{service ? 'تعديل الخدمة' : 'إضافة خدمة جديدة'}</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">الفئة</label>
            <select className="input-field text-sm py-2" {...register('categoryId', { required: true })}>
              <option value="">اختر الفئة</option>
              {categories?.map((cat) => (
                <optgroup key={cat.id} label={cat.nameJson?.ar}>
                  <option value={cat.id}>{cat.nameJson?.ar} (رئيسية)</option>
                  {cat.children?.map((child) => (
                    <option key={child.id} value={child.id}>— {child.nameJson?.ar}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">الاسم (عربي)</label>
              <input className="input-field text-sm py-2" {...register('titleJson_ar', { required: true })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">الاسم (English)</label>
              <input className="input-field text-sm py-2" {...register('titleJson_en', { required: true })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">السعر (ر.س)</label>
              <input type="number" step="0.01" className="input-field text-sm py-2" {...register('basePrice', { required: true })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">المدة (دقيقة)</label>
              <input type="number" className="input-field text-sm py-2" {...register('durationMin', { required: true })} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">الوصف (عربي)</label>
            <textarea className="input-field text-sm py-2" rows={2} {...register('descriptionJson_ar')} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">الوصف (English)</label>
            <textarea className="input-field text-sm py-2" rows={2} {...register('descriptionJson_en')} />
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register('isActive')} /> نشط
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register('isPopular')} /> الأكثر طلباً
            </label>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" className="btn-primary text-sm">{service ? 'تحديث' : 'إضافة'}</button>
            <button type="button" onClick={onClose} className="btn-ghost text-sm">إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---- Categories Management ----
function AdminCategoriesList({ categories }) {
  const [showForm, setShowForm] = useState(false);
  const createCategory = useCreateCategory();
  const queryClient = useQueryClient();

  const flattenCategories = (cats, depth = 0) => {
    const result = [];
    for (const cat of cats || []) {
      result.push({ ...cat, depth });
      if (cat.children) result.push(...flattenCategories(cat.children, depth + 1));
    }
    return result;
  };

  const flat = flattenCategories(categories);

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الفئة؟')) return;
    try {
      await api.delete(`/categories/${id}`);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('تم حذف الفئة');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'فشل حذف الفئة');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">{flat.length} فئة</p>
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm py-2">+ إضافة فئة</button>
      </div>

      {showForm && <CategoryFormModal categories={categories} onClose={() => setShowForm(false)} />}

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-right px-4 py-3 font-medium text-gray-600">الفئة</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Slug</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">الحالة</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">الترتيب</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {flat.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">
                    <span style={{ marginRight: cat.depth * 20 }}>{cat.depth > 0 ? '— ' : ''}{cat.nameJson?.ar}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{cat.slug}</td>
                  <td className="px-4 py-3">
                    <span className={cat.isActive ? 'badge-success' : 'badge-error'}>
                      {cat.isActive ? 'نشط' : 'غير نشط'}
                    </span>
                  </td>
                  <td className="px-4 py-3">{cat.sortOrder}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(cat.id)} className="text-xs text-red-600 hover:text-red-700">حذف</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CategoryFormModal({ categories, onClose }) {
  const createCategory = useCreateCategory();
  const { register, handleSubmit } = useForm();

  const onSubmit = (data) => {
    createCategory.mutate({
      nameJson: { ar: data.nameAr, en: data.nameEn },
      slug: data.slug,
      parentId: data.parentId ? Number(data.parentId) : null,
      sortOrder: Number(data.sortOrder) || 0,
    }, { onSuccess: onClose });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="card max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-4">إضافة فئة جديدة</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">الاسم (عربي)</label>
              <input className="input-field text-sm py-2" {...register('nameAr', { required: true })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">الاسم (English)</label>
              <input className="input-field text-sm py-2" {...register('nameEn', { required: true })} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Slug</label>
            <input className="input-field text-sm py-2" placeholder="e.g., hair-care" {...register('slug', { required: true })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">الفئة الأم</label>
            <select className="input-field text-sm py-2" {...register('parentId')}>
              <option value="">لا يوجد (رئيسية)</option>
              {categories?.filter(c => !c.parentId).map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.nameJson?.ar}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">الترتيب</label>
            <input type="number" className="input-field text-sm py-2" defaultValue={0} {...register('sortOrder')} />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" className="btn-primary text-sm">إضافة</button>
            <button type="button" onClick={onClose} className="btn-ghost text-sm">إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =============================================================================
// Admin Dashboard Shell
// =============================================================================
export default function AdminDashboard() {
  const sidebarLinks = [
    { to: '/admin', label: 'نظرة عامة', icon: '📊', end: true },
    { to: '/admin/technicians', label: 'المتخصصات', icon: '💇‍♀️' },
    { to: '/admin/customers', label: 'العميلات', icon: '👩‍🦰' },
    { to: '/admin/catalog', label: 'الكتالوج', icon: '📦' },
    { to: '/admin/bookings', label: 'الحجوزات', icon: '📋' },
    { to: '/admin/disputes', label: 'النزاعات', icon: '⚖️' },
    { to: '/admin/finance', label: 'المالية', icon: '💰' },
    { to: '/admin/settings', label: 'الإعدادات', icon: '⚙️' },
    { to: '/admin/reports', label: 'التقارير', icon: '📊' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-6">
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <nav className="card sticky top-20 p-3">
            <div className="text-sm font-semibold text-gray-400 px-3 mb-2 uppercase">الإدارة</div>
            {sidebarLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                end={link.end}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors text-sm"
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        <div className="flex-1 min-w-0">
          <Routes>
            <Route index element={<AdminOverview />} />
            <Route path="technicians" element={<AdminTechnicians />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="catalog" element={<AdminCatalog />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="disputes" element={<AdminDisputes />} />
            <Route path="finance" element={<AdminFinance />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="reports" element={<AdminReports />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Admin Settings
// =============================================================================
function AdminSettings() {
  const qc = useQueryClient();
  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => { const { data } = await api.get('/admin/settings'); return data.settings; },
  });
  const updateSetting = async (key, value) => {
    try { await api.put(`/admin/settings/${key}`, { value }); qc.invalidateQueries({ queryKey: ['admin-settings'] }); toast.success('تم تحديث الإعداد'); }
    catch { toast.error('فشل التحديث'); }
  };
  const toggleMaintenance = async () => {
    try {
      const current = settingsData?.maintenance_mode === 'true';
      await api.post('/admin/maintenance/toggle', { enable: !current });
      qc.invalidateQueries({ queryKey: ['admin-settings'] });
      toast.success(current ? 'تم إلغاء وضع الصيانة' : 'تم تفعيل وضع الصيانة');
    } catch { toast.error('فشل تغيير وضع الصيانة'); }
  };
  if (isLoading) return <p className="text-center py-8 text-gray-400">جاري التحميل...</p>;
  const s = settingsData || {};
  const rows = [
    { key: 'platform_fee_sar', label: 'رسوم المنصة (ر.س)', icon: '💵' },
    { key: 'cashback_first_booking_percent', label: 'كاش باك أول حجز (%)', icon: '🎁' },
    { key: 'cashback_subsequent_percent', label: 'كاش باك الحجوزات التالية (%)', icon: '🎁' },
    { key: 'min_withdrawal_balance', label: 'الحد الأدنى للسحب (ر.س)', icon: '🏦' },
    { key: 'withdrawal_fee_percent', label: 'رسوم السحب (%)', icon: '📊' },
    { key: 'subscription_bonus', label: 'مكافأة الاشتراك (ر.س)', icon: '🎁' },
  ];
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-6">⚙️ إعدادات المنصة</h2>
      <div className="card mb-4"><div className="flex justify-between items-center"><div><h3 className="font-semibold">وضع الصيانة</h3><p className="text-sm text-gray-500">{s.maintenance_mode === 'true' ? '🔴 مفعل' : '🟢 غير مفعل'}</p></div><button onClick={toggleMaintenance} className={`btn-primary text-sm ${s.maintenance_mode === 'true' ? 'bg-red-600 hover:bg-red-700' : ''}`}>{s.maintenance_mode === 'true' ? 'إلغاء وضع الصيانة' : 'تفعيل وضع الصيانة'}</button></div></div>
      <div className="space-y-3">{rows.map((r) => (<div key={r.key} className="card flex items-center justify-between"><div className="flex items-center gap-3"><span className="text-xl">{r.icon}</span><span className="font-medium text-gray-700">{r.label}</span></div><input type="number" className="input-field text-sm py-1.5 w-24" defaultValue={s[r.key] || '0'} onBlur={(e) => { if (e.target.value !== (s[r.key] || '0')) updateSetting(r.key, e.target.value); }} /></div>))}</div>
    </div>
  );
}

function AdminReports() {
  const handleExport = (type) => { window.open(`${import.meta.env.VITE_API_URL || '/api'}/admin/reports/${type}`, '_blank'); };
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-6">📊 التقارير والتصدير</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[{ icon: '📋', title: 'تصدير الحجوزات', desc: 'ملف CSV بجميع الحجوزات', type: 'bookings' }, { icon: '👥', title: 'تصدير المستخدمين', desc: 'ملف CSV بجميع المستخدمين', type: 'users' }].map((r) => (
          <div key={r.type} className="card text-center"><span className="text-4xl block mb-3">{r.icon}</span><h3 className="font-semibold text-gray-800 mb-2">{r.title}</h3><p className="text-sm text-gray-500 mb-4">{r.desc}</p><button onClick={() => handleExport(r.type)} className="btn-primary text-sm">تحميل CSV</button></div>
        ))}
      </div>
    </div>
  );
}
