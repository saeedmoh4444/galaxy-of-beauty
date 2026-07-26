import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { useUpdateProfile, useLogout } from '../hooks/useAuth';
import { updateProfileSchema, updateTechnicianSchema, createAddressSchema } from '../validators/auth';
import api from '../lib/api';

// =============================================================================
// Profile Page - Tabs: Personal Info | Addresses | Technician Profile (if tech)
// =============================================================================

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('info');
  const isTechnician = user?.role === 'TECHNICIAN';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 font-display mb-8">{t('nav.profile')}</h1>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200 mb-8 overflow-x-auto">
        {[
          { key: 'info', label: 'المعلومات الشخصية', icon: '👤' },
          { key: 'addresses', label: 'العناوين', icon: '📍' },
          ...(isTechnician ? [{ key: 'tech', label: 'ملف التخصص', icon: '💇‍♀️' }] : []),
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
              ${activeTab === tab.key
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'info' && <PersonalInfoTab />}
      {activeTab === 'addresses' && <AddressesTab />}
      {activeTab === 'tech' && isTechnician && <TechnicianProfileTab />}
    </div>
  );
}

// =============================================================================
// Personal Info Tab
// =============================================================================

function PersonalInfoTab() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const updateProfile = useUpdateProfile();

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      preferredLanguage: user?.preferredLanguage || 'ar',
    },
  });

  // Reset form when user data changes
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        phone: user.phone || '',
        preferredLanguage: user.preferredLanguage || 'ar',
      });
    }
  }, [user, reset]);

  const onSubmit = (data) => {
    updateProfile.mutate(data);
  };

  return (
    <div className="card max-w-2xl">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">المعلومات الشخصية</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email (readonly) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.email')}</label>
          <input type="email" className="input-field bg-gray-50 text-gray-500" value={user?.email || ''} disabled />
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.name')}</label>
          <input type="text" className={`input-field ${errors.name ? 'border-red-400' : ''}`} {...register('name')} />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.phone')}</label>
          <input type="tel" className={`input-field ${errors.phone ? 'border-red-400' : ''}`} dir="ltr" {...register('phone')} />
          {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
        </div>

        {/* Language */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">اللغة المفضلة</label>
          <select className="input-field" {...register('preferredLanguage')}>
            <option value="ar">العربية</option>
            <option value="en">English</option>
          </select>
        </div>

        {/* Role (readonly) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">الدور</label>
          <input
            type="text"
            className="input-field bg-gray-50 text-gray-500"
            value={user?.role === 'TECHNICIAN' ? 'مقدمة خدمة' : user?.role === 'ADMIN' ? 'مدير' : 'عميلة'}
            disabled
          />
        </div>

        {/* Member since */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الانضمام</label>
          <input
            type="text"
            className="input-field bg-gray-50 text-gray-500"
            value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString('ar-SA') : ''}
            disabled
          />
        </div>

        <button
          type="submit"
          disabled={!isDirty || updateProfile.isPending}
          className="btn-primary"
        >
          {updateProfile.isPending ? 'جاري الحفظ...' : t('common.save')}
        </button>
      </form>
    </div>
  );
}

// =============================================================================
// Addresses Tab
// =============================================================================

function AddressesTab() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const queryClient = useQueryClient();

  // Fetch addresses
  const { data: addressesData, isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const response = await api.get('/addresses');
      return response.data.addresses;
    },
  });

  const addresses = addressesData || [];

  // Create mutation
  const handleCreate = async (data) => {
    await api.post('/addresses', data);
    queryClient.invalidateQueries({ queryKey: ['addresses'] });
    toast.success('تم إضافة العنوان');
    setShowForm(false);
  };

  // Update mutation
  const handleUpdate = async (id, data) => {
    await api.put(`/addresses/${id}`, data);
    queryClient.invalidateQueries({ queryKey: ['addresses'] });
    toast.success('تم تحديث العنوان');
    setEditingId(null);
  };

  // Delete mutation
  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكدة من حذف هذا العنوان؟')) return;
    try {
      await api.delete(`/addresses/${id}`);
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('تم حذف العنوان');
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'فشل حذف العنوان');
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">العناوين المحفوظة</h2>
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm py-2">
          + إضافة عنوان
        </button>
      </div>

      {/* Address Form (inline) */}
      {(showForm || editingId) && (
        <AddressForm
          initialData={editingId ? addresses.find((a) => a.id === editingId) : null}
          onSubmit={(data) => {
            editingId ? handleUpdate(editingId, data) : handleCreate(data);
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingId(null);
          }}
        />
      )}

      {/* Address List */}
      {isLoading ? (
        <div className="card text-center py-8 text-gray-400">جاري تحميل العناوين...</div>
      ) : addresses.length === 0 ? (
        <div className="card text-center py-12">
          <span className="text-4xl block mb-3">📍</span>
          <p className="text-gray-500">لا توجد عناوين محفوظة</p>
          <p className="text-sm text-gray-400 mt-1">أضيفي عنواناً لتتمكني من الحجز بسهولة</p>
        </div>
      ) : (
        addresses.map((addr) => (
          <div key={addr.id} className="card flex justify-between items-start">
            <div className="flex gap-3">
              {addr.isDefault && <span className="text-xs badge-success">أساسي</span>}
              <div>
                <h3 className="font-semibold text-gray-900">{addr.label}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {[addr.street, addr.area, addr.city].filter(Boolean).join('، ')}
                </p>
                {addr.building && (
                  <p className="text-xs text-gray-400 mt-1">مبنى {addr.building}{addr.floor ? `، طابق ${addr.floor}` : ''}</p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditingId(addr.id)} className="text-xs text-primary-600 hover:text-primary-700">
                تعديل
              </button>
              <button onClick={() => handleDelete(addr.id)} className="text-xs text-red-600 hover:text-red-700">
                حذف
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// =============================================================================
// Address Form Component (shared for create/edit)
// =============================================================================

function AddressForm({ initialData, onSubmit, onCancel }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(createAddressSchema),
    defaultValues: initialData || { isDefault: false },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card border-primary-200 bg-primary-50/50 space-y-3">
      <h3 className="font-semibold text-gray-900">
        {initialData ? 'تعديل العنوان' : 'عنوان جديد'}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-600 mb-1">اسم العنوان *</label>
          <input className="input-field text-sm py-2" placeholder="المنزل، العمل..." {...register('label')} />
          {errors.label && <p className="text-xs text-red-600">{errors.label.message}</p>}
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">المدينة *</label>
          <input className="input-field text-sm py-2" placeholder="الرياض" {...register('city')} />
          {errors.city && <p className="text-xs text-red-600">{errors.city.message}</p>}
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">الحي *</label>
          <input className="input-field text-sm py-2" placeholder="حي النرجس" {...register('area')} />
          {errors.area && <p className="text-xs text-red-600">{errors.area.message}</p>}
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">الشارع *</label>
          <input className="input-field text-sm py-2" placeholder="شارع الأمير محمد بن سلمان" {...register('street')} />
          {errors.street && <p className="text-xs text-red-600">{errors.street.message}</p>}
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">رقم المبنى</label>
          <input className="input-field text-sm py-2" {...register('building')} />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">الطابق</label>
          <input className="input-field text-sm py-2" {...register('floor')} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" className="rounded border-gray-300" {...register('isDefault')} />
        <span className="text-sm text-gray-600">تعيين كعنوان أساسي</span>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn-primary text-sm py-2">{initialData ? 'تحديث' : 'إضافة'}</button>
        <button type="button" onClick={onCancel} className="btn-ghost text-sm">إلغاء</button>
      </div>
    </form>
  );
}

// =============================================================================
// Technician Profile Tab
// =============================================================================

function TechnicianProfileTab() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Fetch technician profile
  const { data: techData, isLoading } = useQuery({
    queryKey: ['technician', user?.id],
    queryFn: async () => {
      const response = await api.get(`/technicians/${user.id}`);
      return response.data.technician;
    },
    enabled: !!user?.id,
  });

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm({
    resolver: zodResolver(updateTechnicianSchema),
  });

  useEffect(() => {
    if (techData) {
      reset({
        city: techData.city || '',
        area: techData.area || '',
        hourlyRate: parseFloat(techData.hourlyRate) || 0,
        bioJson: techData.bioJson || { ar: '', en: '' },
      });
    }
  }, [techData, reset]);

  const onSubmit = async (data) => {
    try {
      await api.put(`/technicians/${user.id}`, data);
      queryClient.invalidateQueries({ queryKey: ['technician'] });
      toast.success('تم تحديث ملف التخصص');
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'فشل التحديث');
    }
  };

  // KYC Upload
  const handleKYCUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) return;

    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append('documents', file));

    try {
      await api.post(`/technicians/${user.id}/kyc`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      queryClient.invalidateQueries({ queryKey: ['technician'] });
      toast.success('تم رفع المستندات بنجاح. ستتم المراجعة قريباً.');
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'فشل رفع المستندات');
    }
  };

  if (isLoading) {
    return <div className="card text-center py-8 text-gray-400">جاري تحميل بيانات التخصص...</div>;
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* KYC Status */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-3">حالة توثيق الحساب</h3>
        <div className="flex items-center gap-3">
          {techData?.kycStatus === 'VERIFIED' && <span className="badge-success">✅ موثقة</span>}
          {techData?.kycStatus === 'SUBMITTED' && <span className="badge-info">⏳ قيد المراجعة</span>}
          {techData?.kycStatus === 'REJECTED' && <span className="badge-error">❌ مرفوضة - يرجى إعادة المحاولة</span>}
          {techData?.kycStatus === 'PENDING' && <span className="badge-pending">⚠️ لم يتم التوثيق بعد</span>}
        </div>
        {techData?.kycNotes && (
          <p className="text-sm text-gray-500 mt-2">{techData.kycNotes}</p>
        )}
        {techData?.kycStatus !== 'VERIFIED' && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رفع مستندات التوثيق (الهوية، الشهادة المهنية)
            </label>
            <input type="file" multiple accept="image/*,.pdf" onChange={handleKYCUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
          </div>
        )}
      </div>

      {/* Google Calendar Connect */}
      <GoogleCalendarConnect />

      {/* Technician Profile Form */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">معلومات التخصص</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">المدينة</label>
              <input className={`input-field ${errors.city ? 'border-red-400' : ''}`} {...register('city')} />
              {errors.city && <p className="text-xs text-red-600">{errors.city.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الحي</label>
              <input className="input-field" {...register('area')} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">سعر الساعة (ر.س)</label>
            <input
              type="number"
              className={`input-field ${errors.hourlyRate ? 'border-red-400' : ''}`}
              step="0.01"
              min="0"
              {...register('hourlyRate', { valueAsNumber: true })}
            />
            {errors.hourlyRate && <p className="text-xs text-red-600">{errors.hourlyRate.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">نبذة عني (بالعربية)</label>
            <textarea className="input-field" rows={3} placeholder="أنا متخصصة في..." {...register('bioJson.ar')} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio (English)</label>
            <textarea className="input-field" rows={3} placeholder="I specialize in..." {...register('bioJson.en')} />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-yellow-500">⭐</span>
              <span className="font-semibold">{parseFloat(techData?.ratingAvg || 0).toFixed(1)}</span>
              <span className="text-gray-400">({techData?.totalReviews || 0} تقييم)</span>
            </div>
            <div className="text-sm text-gray-500">
              {techData?.completedBookings || 0} حجز مكتمل
            </div>
          </div>

          <button type="submit" disabled={!isDirty} className="btn-primary">
            حفظ التغييرات
          </button>
        </form>
      </div>
    </div>
  );
}

function GoogleCalendarConnect() {
  const qc = useQueryClient();
  const { data: calData } = useQuery({
    queryKey: ['google-calendar'],
    queryFn: async () => { const { data } = await api.get('/calendar/status'); return data; },
  });

  const handleConnect = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) { toast.error('Google Calendar integration not configured'); return; }
    const redirectUri = `${window.location.origin}/profile`;
    const scope = 'https://www.googleapis.com/auth/calendar.events';
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`;
    window.location.href = authUrl;
  };

  const handleDisconnect = async () => {
    try { await api.post('/calendar/disconnect'); qc.invalidateQueries({ queryKey: ['google-calendar'] }); toast.success('تم إلغاء ربط التقويم'); }
    catch { toast.error('فشل إلغاء الربط'); }
  };

  // Handle OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      api.post('/calendar/connect', { code, redirectUri: `${window.location.origin}/profile` })
        .then(() => { qc.invalidateQueries({ queryKey: ['google-calendar'] }); toast.success('تم ربط تقويم Google بنجاح! 📅'); window.history.replaceState({}, '', '/profile'); })
        .catch(() => toast.error('فشل ربط تقويم Google'));
    }
  }, []);

  return (
    <div className="card mt-6">
      <h3 className="font-semibold text-gray-900 mb-3">📅 تقويم Google</h3>
      {calData?.connected ? (
        <div className="flex items-center justify-between">
          <div><span className="badge-success">✅ مربوط</span><p className="text-sm text-gray-500 mt-1">{calData.email}</p></div>
          <button onClick={handleDisconnect} className="btn-ghost text-sm text-red-600">إلغاء الربط</button>
        </div>
      ) : (
        <div><p className="text-sm text-gray-500 mb-3">اربطي تقويم Google لمزامنة المواعيد تلقائياً</p>
          <button onClick={handleConnect} className="btn-primary text-sm">ربط تقويم Google</button></div>
      )}
    </div>
  );
}
