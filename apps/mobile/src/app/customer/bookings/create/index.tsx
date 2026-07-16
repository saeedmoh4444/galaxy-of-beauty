import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function CreateBookingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [serviceId, setServiceId] = useState<number | undefined>();
  const [variantId, setVariantId] = useState<number | undefined>();
  const [addressId, setAddressId] = useState<number | undefined>();
  const [promoCode, setPromoCode] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [services, setServices] = useState<Record<string, unknown>[]>([]);
  const [svc, setSvc] = useState<Record<string, unknown> | null>(null);
  const [addresses, setAddresses] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (trpc.services.list.query({ page: 1, limit: 100 }) as any as Promise<Record<string, unknown>>),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (trpc.addresses.list.query() as any as Promise<Record<string, unknown>[]>),
    ]).then(([s, a]) => {
      setServices((s?.items as Record<string, unknown>[]) || []);
      setAddresses(a || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!serviceId) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (trpc.services.getById.query({ id: serviceId }) as any as Promise<Record<string, unknown>>)
      .then(setSvc).catch(() => {});
  }, [serviceId]);

  const handleSubmit = async () => {
    if (!serviceId || !addressId) {
      Alert.alert('تنبيه', 'الرجاء اختيار الخدمة والعنوان');
      return;
    }
    setSubmitting(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // Auto-assign first available technician for this service
      const techs = (svc?.technicianServices as Array<Record<string, unknown>>) || [];
      const technicianId = techs.length > 0
        ? (techs[0]!.technician as Record<string, unknown>)?.userId as number || 0
        : 0;
      if (!technicianId) {
        Alert.alert('تنبيه', 'لا توجد فنيات متاحة لهذه الخدمة حالياً');
        setSubmitting(false);
        return;
      }

      await (trpc.bookings.create.mutate({
        serviceId, variantId, addressId,
        technicianId,
        idempotencyKey: `mob_${Date.now()}_${Math.random().toString(36).slice(2,10)}`,
        notes: notes || undefined,
        startAt: new Date(Date.now() + 86400000).toISOString(),
        endAt: new Date(Date.now() + 86400000 + (svc?.durationMin as number || 60) * 60000).toISOString(),
      }) as any as Promise<unknown>);
      Alert.alert('تم', 'تم إنشاء الحجز بنجاح!', [{ text: 'حسناً', onPress: () => router.back() }]);
    } catch {
      Alert.alert('خطأ', 'فشل إنشاء الحجز');
    } finally { setSubmitting(false); }
  };

  const variants = (svc?.variants as Array<Record<string, unknown>>) || [];

  if (loading) return <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <Text style={styles.title}>حجز جديد</Text>

      {/* Steps indicator */}
      <View style={styles.steps}>
        {['الخدمة', 'التفاصيل', 'التأكيد'].map((label, i) => (
          <View key={i} style={styles.stepRow}>
            <View style={[styles.stepCircle, step > i+1 ? styles.stepDone : step === i+1 ? styles.stepActive : styles.stepInactive]}>
              <Text style={[styles.stepNum, step === i+1 && {color:'#fff'}]}>{step > i+1 ? '✓' : i+1}</Text>
            </View>
            <Text style={[styles.stepLabel, step === i+1 && {color:'#7c3aed',fontWeight:'700'}]}>{label}</Text>
            {i < 2 && <Text style={styles.stepArrow}>→</Text>}
          </View>
        ))}
      </View>

      {step === 1 && (
        <View>
          <Text style={styles.sectionTitle}>اختر الخدمة</Text>
          {services.map((s) => (
            <TouchableOpacity
              key={s.id as number}
              style={[styles.serviceCard, serviceId === s.id && styles.serviceCardActive]}
              onPress={() => { setServiceId(s.id as number); setStep(2); }}
              activeOpacity={0.7}
            >
              <Text style={styles.serviceName}>{((s.titleJson as Record<string, string>)?.ar) || ''}</Text>
              <Text style={styles.serviceMeta}>{Number(s.basePrice).toFixed(0)} ر.س · {s.durationMin as number} دقيقة</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {step === 2 && svc && (
        <View>
          <Text style={styles.sectionTitle}>تفاصيل الحجز</Text>
          <Text style={styles.selectedService}>✨ {((svc.titleJson as Record<string, string>)?.ar) || ''}</Text>

          {variants.length > 0 && (
            <View style={styles.field}>
              <Text style={styles.label}>المتغير</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                <TouchableOpacity style={[styles.chip, !variantId && styles.chipActive]} onPress={() => setVariantId(undefined)}><Text style={[styles.chipText, !variantId && {color:'#fff'}]}>الأساسي</Text></TouchableOpacity>
                {variants.map((v) => (
                  <TouchableOpacity key={v.id as number} style={[styles.chip, variantId === v.id && styles.chipActive]} onPress={() => setVariantId(v.id as number)}>
                    <Text style={[styles.chipText, variantId === v.id && {color:'#fff'}]}>{((v.nameJson as Record<string, string>)?.ar) || ''}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>العنوان</Text>
            {addresses.map((a) => (
              <TouchableOpacity key={a.id as number} style={[styles.optionCard, addressId === a.id && styles.optionCardActive]} onPress={() => setAddressId(a.id as number)}>
                <Text style={styles.optionText}>{a.label as string} — {a.city as string}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>كود الخصم</Text>
            <TextInput style={styles.input} value={promoCode} onChangeText={(t) => setPromoCode(t.toUpperCase())} placeholder="مثال: WELCOME20" placeholderTextColor="#9ca3af" autoCapitalize="characters" />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>ملاحظات</Text>
            <TextInput style={[styles.input, styles.textArea]} value={notes} onChangeText={setNotes} placeholder="أي ملاحظات إضافية..." placeholderTextColor="#9ca3af" multiline numberOfLines={3} />
          </View>

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)}><Text style={styles.backText}>السابق</Text></TouchableOpacity>
            <TouchableOpacity style={styles.nextBtn} onPress={() => setStep(3)}><Text style={styles.nextText}>التالي</Text></TouchableOpacity>
          </View>
        </View>
      )}

      {step === 3 && svc && (
        <View>
          <Text style={styles.sectionTitle}>تأكيد الحجز</Text>
          <View style={styles.summary}>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>الخدمة</Text><Text style={styles.summaryValue}>{((svc.titleJson as Record<string, string>)?.ar) || ''}</Text></View>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>السعر</Text><Text style={styles.summaryPrice}>{Number(svc.basePrice).toFixed(0)} ر.س</Text></View>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>المدة</Text><Text style={styles.summaryValue}>{svc.durationMin as number} دقيقة</Text></View>
          </View>
          <Text style={styles.note}>* ستقوم الفنية بتأكيد الموعد النهائي</Text>
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.backBtn} onPress={() => setStep(2)}><Text style={styles.backText}>السابق</Text></TouchableOpacity>
            <TouchableOpacity style={styles.nextBtn} onPress={handleSubmit} disabled={submitting}>
              {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.nextText}>تأكيد الحجز</Text>}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '800', color: '#111827', textAlign: 'right', marginBottom: 16 },
  steps: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 4, marginBottom: 24 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stepCircle: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  stepDone: { backgroundColor: '#16a34a' },
  stepActive: { backgroundColor: '#7c3aed' },
  stepInactive: { backgroundColor: '#e5e7eb' },
  stepNum: { fontSize: 12, fontWeight: '700', color: '#6b7280' },
  stepLabel: { fontSize: 12, color: '#9ca3af' },
  stepArrow: { fontSize: 12, color: '#d1d5db', marginHorizontal: 4 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#111827', textAlign: 'right', marginBottom: 12 },
  serviceCard: { padding: 14, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, marginBottom: 8 },
  serviceCardActive: { borderColor: '#7c3aed', backgroundColor: '#f5f3ff' },
  serviceName: { fontSize: 15, fontWeight: '600', color: '#111827', textAlign: 'right' },
  serviceMeta: { fontSize: 12, color: '#6b7280', marginTop: 2, textAlign: 'right' },
  selectedService: { fontSize: 16, fontWeight: '600', color: '#7c3aed', textAlign: 'right', marginBottom: 16 },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#6b7280', textAlign: 'right', marginBottom: 6 },
  chipRow: { flexDirection: 'row', gap: 6 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#d1d5db', backgroundColor: '#f9fafb' },
  chipActive: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  chipText: { fontSize: 13, color: '#6b7280' },
  optionCard: { padding: 12, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, marginBottom: 6 },
  optionCardActive: { borderColor: '#7c3aed', backgroundColor: '#faf5ff' },
  optionText: { fontSize: 14, color: '#374151', textAlign: 'right' },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 12, fontSize: 14, textAlign: 'right', backgroundColor: '#f9fafb' },
  textArea: { height: 80, textAlignVertical: 'top' },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
  backBtn: { flex: 1, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 14, alignItems: 'center' },
  backText: { fontSize: 15, color: '#6b7280', fontWeight: '600' },
  nextBtn: { flex: 2, backgroundColor: '#7c3aed', borderRadius: 10, padding: 14, alignItems: 'center' },
  nextText: { fontSize: 15, color: '#fff', fontWeight: '600' },
  summary: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  summaryLabel: { fontSize: 13, color: '#6b7280' },
  summaryValue: { fontSize: 14, color: '#374151' },
  summaryPrice: { fontSize: 16, fontWeight: '700', color: '#7c3aed' },
  note: { fontSize: 11, color: '#9ca3af', textAlign: 'right', marginTop: 12 },
});
