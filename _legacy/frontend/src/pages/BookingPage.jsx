import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { useCreateBooking } from '../hooks/useBooking';
import { useServices, useServiceDetail } from '../hooks/useCatalog';
import api from '../lib/api';

/**
 * Multi-step booking flow:
 * 1. Select Service → 2. Select Technician → 3. Select Slot → 4. Confirm
 */
export default function BookingPage() {
  const { serviceId: paramServiceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const createBooking = useCreateBooking();

  const [step, setStep] = useState(1);
  const [selectedServiceId, setSelectedServiceId] = useState(paramServiceId ? Number(paramServiceId) : null);
  const [selectedTechnicianUserId, setSelectedTechnicianUserId] = useState(null);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [notes, setNotes] = useState('');

  // Fetch data for each step
  const { data: servicesData } = useServices({ limit: 50 });
  const { data: serviceDetail } = useServiceDetail(selectedServiceId);

  // Fetch addresses
  const { data: addressesData } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => { const { data } = await api.get('/addresses'); return data.addresses; },
    enabled: step === 4,
  });

  const services = servicesData?.services || [];
  const addresses = addressesData || [];

  const handleNext = () => setStep((s) => Math.min(4, s + 1));
  const handleBack = () => setStep((s) => Math.max(1, s - 1));

  const handleSubmit = () => {
    if (!selectedServiceId || !selectedTechnicianUserId || !selectedSlotId || !selectedAddressId) {
      return;
    }
    createBooking.mutate(
      {
        technicianId: selectedTechnicianUserId,
        serviceId: selectedServiceId,
        slotId: selectedSlotId,
        addressId: selectedAddressId,
        notes: notes || null,
      },
      {
        onSuccess: (booking) => {
          navigate(`/bookings?highlight=${booking.id}`);
        },
      },
    );
  };

  const steps = [
    { num: 1, label: 'الخدمة', icon: '✨' },
    { num: 2, label: 'المتخصصة', icon: '💇‍♀️' },
    { num: 3, label: 'الموعد', icon: '📅' },
    { num: 4, label: 'تأكيد', icon: '✅' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 font-display mb-8">حجز جديد</h1>

      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-10">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center">
            <div className={`flex items-center gap-2 ${step >= s.num ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold
                ${step >= s.num ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {step > s.num ? '✓' : s.num}
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700">{s.label}</span>
            </div>
            {i < 3 && <div className={`w-12 sm:w-20 h-0.5 mx-2 ${step > s.num ? 'bg-primary-400' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Select Service */}
      {step === 1 && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">اختيار الخدمة</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
            {services.map((svc) => (
              <button
                key={svc.id}
                onClick={() => setSelectedServiceId(svc.id)}
                className={`p-4 rounded-xl border-2 text-right transition-all
                  ${selectedServiceId === svc.id
                    ? 'border-primary-400 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-200'}`}
              >
                <p className="font-semibold text-gray-800">{svc.titleJson?.ar}</p>
                <div className="flex justify-between mt-2 text-sm">
                  <span className="text-primary-600 font-bold">{Number(svc.basePrice).toLocaleString('ar-SA')} ر.س</span>
                  <span className="text-gray-400">⏱ {svc.durationMin} د</span>
                </div>
              </button>
            ))}
          </div>
          <div className="flex justify-end mt-6">
            <button onClick={handleNext} disabled={!selectedServiceId} className="btn-primary">التالي ←</button>
          </div>
        </div>
      )}

      {/* Step 2: Select Technician */}
      {step === 2 && serviceDetail && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">اختيار المتخصصة</h2>
          <p className="text-sm text-gray-500 mb-4">
            الخدمة المختارة: <strong>{serviceDetail.titleJson?.ar}</strong>
          </p>

          {serviceDetail.technicianServices?.length > 0 ? (
            <div className="space-y-3">
              {serviceDetail.technicianServices.map((ts) => (
                <button
                  key={ts.technician.user.id}
                  onClick={() => setSelectedTechnicianUserId(ts.technician.user.id)}
                  className={`w-full p-4 rounded-xl border-2 text-right flex items-center gap-4 transition-all
                    ${selectedTechnicianUserId === ts.technician.user.id
                      ? 'border-primary-400 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-200'}`}
                >
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-xl">👩‍🦰</div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{ts.technician.user.name}</p>
                    <div className="flex gap-3 text-xs text-gray-400 mt-1">
                      <span>⭐ {Number(ts.technician.ratingAvg || 0).toFixed(1)}</span>
                    </div>
                  </div>
                  <span className="font-bold text-primary-600">
                    {ts.customPrice
                      ? `${Number(ts.customPrice).toLocaleString('ar-SA')} ر.س`
                      : `${Number(serviceDetail.basePrice).toLocaleString('ar-SA')} ر.س`}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-8">لا توجد متخصصات متاحة لهذه الخدمة حالياً</p>
          )}

          <div className="flex justify-between mt-6">
            <button onClick={handleBack} className="btn-ghost">→ السابق</button>
            <button onClick={handleNext} disabled={!selectedTechnicianUserId} className="btn-primary">التالي ←</button>
          </div>
        </div>
      )}

      {/* Step 3: Select Slot */}
      {step === 3 && (
        <SlotSelectionStep
          techId={selectedTechnicianUserId}
          selectedSlotId={selectedSlotId}
          onSelectSlot={setSelectedSlotId}
          onBack={handleBack}
          onNext={handleNext}
        />
      )}

      {/* Step 4: Confirm */}
      {step === 4 && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">تأكيد الحجز</h2>

          <div className="space-y-4 bg-gray-50 rounded-xl p-4">
            <div className="flex justify-between">
              <span className="text-gray-500">الخدمة</span>
              <span className="font-semibold">{serviceDetail?.titleJson?.ar}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">السعر</span>
              <span className="font-bold text-primary-600">{Number(serviceDetail?.basePrice).toLocaleString('ar-SA')} ر.س</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">المدة</span>
              <span>{serviceDetail?.durationMin} دقيقة</span>
            </div>
            <hr className="border-gray-200" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">اختيار العنوان</label>
              {addresses.length > 0 ? (
                <select
                  className="input-field text-sm"
                  value={selectedAddressId || ''}
                  onChange={(e) => setSelectedAddressId(Number(e.target.value))}
                >
                  <option value="">اختر العنوان</option>
                  {addresses.map((addr) => (
                    <option key={addr.id} value={addr.id}>
                      {addr.label} - {addr.street}، {addr.area}، {addr.city}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm text-red-500">يرجى إضافة عنوان أولاً من صفحة الملف الشخصي</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات (اختياري)</label>
              <textarea
                className="input-field text-sm"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أي ملاحظات إضافية للمتخصصة..."
              />
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <button onClick={handleBack} className="btn-ghost">→ السابق</button>
            <button
              onClick={handleSubmit}
              disabled={!selectedAddressId || createBooking.isPending}
              className="btn-primary flex items-center gap-2"
            >
              {createBooking.isPending ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : null}
              تأكيد الحجز
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Slot Selection Sub-Component
// =============================================================================

function SlotSelectionStep({ techId, selectedSlotId, onSelectSlot, onBack, onNext }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: slots, isLoading } = useQuery({
    queryKey: ['slots', techId, selectedDate],
    queryFn: async () => {
      const { data } = await api.get(`/technicians/${techId}/slots?date=${selectedDate}`);
      return data.slots;
    },
    enabled: !!techId,
  });

  // Generate next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  const availableSlots = (slots || []).filter((s) => !s.isBooked);

  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-4">اختيار التاريخ والوقت</h2>

      {/* Date Selector */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6">
        {dates.map((date) => {
          const d = new Date(date);
          const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
          return (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={`flex-shrink-0 w-16 py-3 rounded-xl text-center transition-all
                ${date === selectedDate
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              <p className="text-xs">{dayNames[d.getDay()]}</p>
              <p className="text-lg font-bold">{d.getDate()}</p>
            </button>
          );
        })}
      </div>

      {/* Time Slots */}
      {isLoading ? (
        <p className="text-center text-gray-400 py-8">جاري تحميل المواعيد...</p>
      ) : availableSlots.length === 0 ? (
        <div className="text-center py-8">
          <span className="text-4xl block mb-3">📅</span>
          <p className="text-gray-500">لا توجد مواعيد متاحة في هذا اليوم</p>
          <p className="text-sm text-gray-400 mt-1">يرجى اختيار يوم آخر</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {availableSlots.map((slot) => {
            const start = new Date(slot.startAt);
            const timeStr = start.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
            return (
              <button
                key={slot.id}
                onClick={() => onSelectSlot(slot.id)}
                className={`py-3 rounded-xl text-center font-medium transition-all
                  ${selectedSlotId === slot.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-50 text-gray-700 hover:bg-primary-50 hover:text-primary-600 border border-gray-200'}`}
              >
                {timeStr}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex justify-between mt-6">
        <button onClick={onBack} className="btn-ghost">→ السابق</button>
        <button onClick={onNext} disabled={!selectedSlotId} className="btn-primary">التالي ←</button>
      </div>
    </div>
  );
}
