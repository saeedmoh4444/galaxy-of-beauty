import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export default function BookingScreen({ route, navigation }) {
  const { serviceId, techUserId } = route.params || {};
  const [step, setStep] = useState(1);
  const [selectedTech, setSelectedTech] = useState(techUserId || null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [notes, setNotes] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const qc = useQueryClient();

  const { data: service } = useQuery({
    queryKey: ['services', serviceId],
    queryFn: async () => { const { data } = await api.get(`/services/${serviceId}`); return data.service; },
    enabled: !!serviceId,
  });

  const { data: addresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => { const { data } = await api.get('/addresses'); return data.addresses; },
    enabled: step === 3,
  });

  const { data: slots } = useQuery({
    queryKey: ['slots', selectedTech, selectedDate],
    queryFn: async () => { const { data } = await api.get(`/technicians/${selectedTech}/slots?date=${selectedDate}`); return (data.slots || []).filter((s) => !s.isBooked); },
    enabled: !!selectedTech && step === 2,
  });

  const createBooking = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/bookings', {
        technicianId: selectedTech, serviceId, slotId: selectedSlot,
        addressId: selectedAddress, notes: notes || null,
        idempotencyKey: `mob-${Date.now()}-${Math.random()}`,
      });
      return data.booking;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['bookings'] }); Alert.alert('تم!', 'تم إرسال طلب الحجز بنجاح ✨', [{ text: 'حسناً', onPress: () => navigation.goBack() }]); },
    onError: (err) => Alert.alert('خطأ', err.response?.data?.error?.message || 'فشل الحجز'),
  });

  const dates = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return d.toISOString().split('T')[0]; });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
      {/* Step indicators */}
      <View style={styles.steps}>
        {['الخدمة', 'الموعد', 'تأكيد'].map((l, i) => (
          <View key={l} style={[styles.stepDot, step > i + 1 && styles.stepDone, step === i + 1 && styles.stepActive]}>
            <Text style={{ color: step >= i + 1 ? '#fff' : '#9CA3AF', fontWeight: '700' }}>{step > i + 1 ? '✓' : i + 1}</Text>
            <Text style={styles.stepLabel}>{l}</Text>
          </View>
        ))}
      </View>

      {step === 1 && service && (
        <View>
          <Text style={styles.title}>{service.titleJson?.ar}</Text>
          <Text style={styles.price}>{Number(service.basePrice).toLocaleString('ar-SA')} ر.س</Text>
          {service.technicianServices?.map((ts) => (
            <TouchableOpacity key={ts.technician.user.id} style={[styles.option, selectedTech === ts.technician.user.id && styles.optionActive]}
              onPress={() => setSelectedTech(ts.technician.user.id)}>
              <Text>👩‍🦰 {ts.technician.user.name}</Text>
              <Text>⭐ {Number(ts.technician.ratingAvg || 0).toFixed(1)}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.btn} onPress={() => selectedTech && setStep(2)} disabled={!selectedTech}>
            <Text style={styles.btnText}>التالي ←</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 2 && (
        <View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            {dates.map((d) => {
              const day = new Date(d);
              return (
                <TouchableOpacity key={d} style={[styles.dateChip, d === selectedDate && styles.dateActive]} onPress={() => setSelectedDate(d)}>
                  <Text style={{ color: d === selectedDate ? '#fff' : '#374151', fontWeight: '600' }}>{day.getDate()}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          {slots?.length === 0 && <Text style={{ textAlign: 'center', color: '#9CA3AF', marginTop: 20 }}>لا توجد مواعيد متاحة</Text>}
          {slots?.map((s) => (
            <TouchableOpacity key={s.id} style={[styles.option, selectedSlot === s.id && styles.optionActive]} onPress={() => setSelectedSlot(s.id)}>
              <Text style={{ fontWeight: '600' }}>{new Date(s.startAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</Text>
            </TouchableOpacity>
          ))}
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
            <TouchableOpacity style={styles.btnGhost} onPress={() => setStep(1)}><Text>→ السابق</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.btn, { flex: 1 }]} onPress={() => selectedSlot && setStep(3)} disabled={!selectedSlot}><Text style={styles.btnText}>التالي ←</Text></TouchableOpacity>
          </View>
        </View>
      )}

      {step === 3 && (
        <View>
          <Text style={styles.summaryTitle}>تأكيد الحجز</Text>
          <Text style={styles.summaryText}>{service?.titleJson?.ar}</Text>
          <Text style={styles.summaryPrice}>{Number(service?.basePrice || 0).toLocaleString('ar-SA')} ر.س</Text>
          <Text style={{ marginTop: 16, fontWeight: '600', marginBottom: 8 }}>اختيار العنوان</Text>
          {addresses?.map((a) => (
            <TouchableOpacity key={a.id} style={[styles.option, selectedAddress === a.id && styles.optionActive]} onPress={() => setSelectedAddress(a.id)}>
              <Text>{a.label} - {a.street}, {a.area}</Text>
            </TouchableOpacity>
          ))}
          <TextInput style={styles.notesInput} placeholder="ملاحظات (اختياري)" value={notes} onChangeText={setNotes} textAlign="right" multiline />
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
            <TouchableOpacity style={styles.btnGhost} onPress={() => setStep(2)}><Text>→ السابق</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.btn, { flex: 1 }]} onPress={() => createBooking.mutate()} disabled={!selectedAddress || createBooking.isPending}>
              <Text style={styles.btnText}>{createBooking.isPending ? 'جاري...' : 'تأكيد الحجز'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  steps: { flexDirection: 'row', justifyContent: 'center', gap: 30, marginBottom: 24 },
  stepDot: { alignItems: 'center' },
  stepDone: { opacity: 0.5 },
  stepActive: {},
  stepLabel: { fontSize: 10, color: '#9CA3AF', marginTop: 4 },
  title: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 8 },
  price: { fontSize: 24, fontWeight: '800', color: '#7C3AED', marginBottom: 20 },
  option: { padding: 16, borderRadius: 12, borderWidth: 2, borderColor: '#E5E7EB', marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between' },
  optionActive: { borderColor: '#7C3AED', backgroundColor: '#F5F3FF' },
  dateChip: { padding: 14, borderRadius: 12, backgroundColor: '#F3F4F6', marginRight: 8, minWidth: 50, alignItems: 'center' },
  dateActive: { backgroundColor: '#7C3AED' },
  btn: { backgroundColor: '#7C3AED', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 16, opacity: 1 },
  btnGhost: { padding: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  summaryTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  summaryText: { fontSize: 16, color: '#374151' },
  summaryPrice: { fontSize: 24, fontWeight: '800', color: '#7C3AED', marginTop: 8 },
  notesInput: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, marginTop: 16, minHeight: 60 },
});
