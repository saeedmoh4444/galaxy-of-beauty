import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function TechProfileScreen() {
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [myServices, setMyServices] = useState<Record<string, unknown>[]>([]);
  const [allServices, setAllServices] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [serviceMsg, setServiceMsg] = useState('');
  const [selectedSvcId, setSelectedSvcId] = useState<number | null>(null);
  const [docType, setDocType] = useState('NATIONAL_ID');
  const [docUrl, setDocUrl] = useState('');
  const [kycMsg, setKycMsg] = useState('');

  const fetch = () => {
    setLoading(true);
    setError('');
    (trpc.auth.me.query() as unknown as Promise<Record<string, unknown>>)
      .then((u) => {
        setUser(u);
        setName((u?.name as string) ?? '');
        const tech = u?.technician as Record<string, unknown> | undefined;
        setCity((tech?.city as string) ?? '');
        setArea((tech?.area as string) ?? '');
        if (tech?.id) {
          (trpc.technicians.getServices as any).query({ techId: tech.id })
            .then((s: Record<string, unknown>[]) => setMyServices(s ?? []));
        }
        setLoading(false);
      })
      .catch(() => { setError('فشل تحميل الملف الشخصي'); setLoading(false); });
  };

  useEffect(() => { fetch(); }, []);

  useEffect(() => {
    (trpc.services.list as any).query({ limit: 50 })
      .then((d: Record<string, unknown>) => setAllServices((d?.items ?? []) as Record<string, unknown>[]));
  }, []);

  const handleAddService = async () => {
    if (!selectedSvcId) return;
    try {
      await (trpc.technicians.addService as any).mutate({ serviceId: selectedSvcId });
      setSelectedSvcId(null);
      setServiceMsg('تمت إضافة الخدمة');
      fetch();
    } catch (e: any) { setServiceMsg(e?.message ?? 'فشل الإضافة'); }
  };

  const handleRemoveService = async (mappingId: number) => {
    try {
      await (trpc.technicians.removeService as any).mutate({ mappingId });
      setServiceMsg('تمت إزالة الخدمة');
      fetch();
    } catch {}
  };

  const handleKycSubmit = async () => {
    if (!docUrl) { setKycMsg('يرجى إدخال رابط المستند'); return; }
    try {
      await (trpc.technicians.submitKyc as any).mutate({ documents: [{ type: docType, url: docUrl }] });
      setDocUrl('');
      setKycMsg('تم إرسال المستندات للمراجعة');
      fetch();
    } catch (e: any) { setKycMsg(e?.message ?? 'فشل الإرسال'); }
  };

  const tech = user?.technician as Record<string, unknown> | undefined;
  const kycStatus = (tech?.kycStatus as string) ?? 'PENDING';
  const kycLabels: Record<string, { color: string; label: string }> = {
    PENDING: { color: '#9ca3af', label: 'قيد الانتظار' },
    SUBMITTED: { color: '#f59e0b', label: 'قيد المراجعة' },
    VERIFIED: { color: '#10b981', label: 'موثق' },
    REJECTED: { color: '#ef4444', label: 'مرفوض' },
  };
  const kycBadge: { color: string; label: string } = kycLabels[kycStatus] ?? kycLabels.PENDING!;

  if (loading) return <ActivityIndicator color="#7c3aed" style={{ marginTop: 80 }} />;
  if (error) return (
    <View style={styles.centered}>
      <Text style={styles.error}>{error}</Text>
      <TouchableOpacity style={styles.retryBtn} onPress={fetch}><Text style={styles.retryText}>إعادة المحاولة</Text></TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>الملف الشخصي</Text>

      {/* KYC Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>توثيق الهوية (KYC)</Text>
        <View style={[styles.kycBadge, { backgroundColor: kycBadge.color + '20' }]}>
          <Text style={{ color: kycBadge.color, fontWeight: '600' }}>{kycBadge.label}</Text>
        </View>
        {(kycStatus === 'PENDING' || kycStatus === 'REJECTED') && (
          <View style={{ marginTop: 12, gap: 8 }}>
            {kycMsg ? <Text style={{ color: kycStatus === 'REJECTED' ? '#ef4444' : '#f59e0b', fontSize: 14, textAlign: 'center' }}>{kycMsg}</Text> : null}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity style={[styles.docTypeBtn, docType === 'NATIONAL_ID' && styles.docTypeActive]} onPress={() => setDocType('NATIONAL_ID')}>
                <Text style={[styles.docTypeText, docType === 'NATIONAL_ID' && { color: '#fff' }]}>هوية</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.docTypeBtn, docType === 'PASSPORT' && styles.docTypeActive]} onPress={() => setDocType('PASSPORT')}>
                <Text style={[styles.docTypeText, docType === 'PASSPORT' && { color: '#fff' }]}>جواز</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.docTypeBtn, docType === 'LICENSE' && styles.docTypeActive]} onPress={() => setDocType('LICENSE')}>
                <Text style={[styles.docTypeText, docType === 'LICENSE' && { color: '#fff' }]}>رخصة</Text>
              </TouchableOpacity>
            </View>
            <TextInput style={styles.input} placeholder="رابط المستند" value={docUrl} onChangeText={setDocUrl} />
            <TouchableOpacity style={styles.btn} onPress={handleKycSubmit}><Text style={styles.btnText}>إرسال للتوثيق</Text></TouchableOpacity>
          </View>
        )}
        {kycStatus === 'SUBMITTED' && <Text style={styles.kycPending}>المستندات قيد المراجعة من قبل الإدارة</Text>}
        {kycStatus === 'VERIFIED' && <Text style={styles.kycVerified}>تم توثيق الهوية بنجاح ✅</Text>}
      </View>

      {/* Profile Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>المعلومات الشخصية</Text>
        <Text style={styles.fieldLabel}>الاسم</Text>
        <Text style={styles.fieldValue}>{name}</Text>
        <Text style={styles.fieldLabel}>البريد الإلكتروني</Text>
        <Text style={styles.fieldValue}>{user?.email as string}</Text>
        <Text style={styles.fieldLabel}>المدينة</Text>
        <Text style={styles.fieldValue}>{city || '—'}</Text>
        <Text style={styles.fieldLabel}>المنطقة</Text>
        <Text style={styles.fieldValue}>{area || '—'}</Text>
      </View>

      {/* Services */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>الخدمات المقدمة</Text>
        {serviceMsg ? <Text style={{ color: '#10b981', fontSize: 14, textAlign: 'center', marginBottom: 8 }}>{serviceMsg}</Text> : null}

        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          <View style={{ flex: 1 }}>
            <ScrollView style={{ maxHeight: 44 }}>
              {allServices.map((s: Record<string, unknown>) => (
                <TouchableOpacity
                  key={s.id as number}
                  style={[styles.svcOption, selectedSvcId === (s.id as number) && styles.svcActive]}
                  onPress={() => setSelectedSvcId(s.id as number)}
                >
                  <Text style={styles.svcText}>{((s.titleJson as Record<string, string>)?.ar ?? '').slice(0, 30)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={handleAddService} disabled={!selectedSvcId}>
            <Text style={styles.addBtnText}>+ إضافة</Text>
          </TouchableOpacity>
        </View>

        {myServices.length === 0 ? (
          <Text style={styles.noData}>لا توجد خدمات مضافة</Text>
        ) : (
          myServices.map((m: Record<string, unknown>) => {
            const svc = m.service as Record<string, unknown> | undefined;
            return (
              <View key={m.id as number} style={styles.svcRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.svcName}>{((svc?.titleJson as Record<string, string>)?.ar ?? '')}</Text>
                  <Text style={styles.svcPrice}>{Number(m.customPrice ?? svc?.basePrice ?? 0)} ر.س</Text>
                </View>
                <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemoveService(m.id as number)}>
                  <Text style={styles.removeText}>إزالة</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 16 },
  section: { marginBottom: 24, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 12 },
  kycBadge: { alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginBottom: 4 },
  kycPending: { color: '#f59e0b', fontSize: 14, textAlign: 'center', marginTop: 8 },
  kycVerified: { color: '#10b981', fontSize: 14, textAlign: 'center', marginTop: 8 },
  fieldLabel: { fontSize: 13, color: '#9ca3af', marginTop: 8 },
  fieldValue: { fontSize: 16, color: '#111827', fontWeight: '500' },
  docTypeBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: '#f3f4f6' },
  docTypeActive: { backgroundColor: '#7c3aed' },
  docTypeText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, padding: 14, fontSize: 16, backgroundColor: '#f9fafb', textAlign: 'right' },
  btn: { backgroundColor: '#7c3aed', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  svcOption: { padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 4 },
  svcActive: { borderColor: '#7c3aed', backgroundColor: '#f5f3ff' },
  svcText: { fontSize: 13, color: '#374151' },
  addBtn: { backgroundColor: '#7c3aed', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10, justifyContent: 'center' },
  addBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  noData: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 8 },
  svcRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 8, backgroundColor: '#f9fafb', marginBottom: 6 },
  svcName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  svcPrice: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  removeBtn: { borderWidth: 1, borderColor: '#fecaca', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  removeText: { color: '#ef4444', fontSize: 13, fontWeight: '600' },
  centered: { alignItems: 'center', marginTop: 80 },
  error: { color: '#ef4444', fontSize: 16, marginBottom: 12 },
  retryBtn: { backgroundColor: '#7c3aed', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 10 },
  retryText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
