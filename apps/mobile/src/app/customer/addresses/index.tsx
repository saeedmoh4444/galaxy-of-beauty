import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function AddressesScreen() {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [label, setLabel] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [street, setStreet] = useState('');
  const [saveMsg, setSaveMsg] = useState('');

  const fetch = () => {
    setLoading(true);
    setError('');
    (trpc.addresses.list as any).query({} as never)
      .then((d: Record<string, unknown>[]) => { setData(d ?? []); setLoading(false); })
      .catch(() => { setError('فشل تحميل العناوين'); setLoading(false); });
  };

  useEffect(() => { fetch(); }, []);

  const resetForm = () => { setLabel(''); setCity(''); setArea(''); setStreet(''); setEditId(null); setShowForm(false); setSaveMsg(''); };

  const handleSave = async () => {
    if (!label || !city) { setSaveMsg('الاسم والمدينة مطلوبان'); return; }
    try {
      if (editId) {
        await (trpc.addresses.update as any).mutate({ id: editId, label, city, area, street });
      } else {
        await (trpc.addresses.create as any).mutate({ label, city, area, street });
      }
      resetForm();
      fetch();
    } catch (e: any) { setSaveMsg(e?.message ?? 'فشل الحفظ'); }
  };

  const handleDelete = async (id: number) => {
    try { await (trpc.addresses.delete as any).mutate({ id }); fetch(); } catch {}
  };

  const handleSetDefault = async (id: number) => {
    try { await (trpc.addresses.setDefault as any).mutate({ id }); fetch(); } catch {}
  };

  const openEdit = (addr: Record<string, unknown>) => {
    setEditId(addr.id as number);
    setLabel((addr.label as string) ?? '');
    setCity((addr.city as string) ?? '');
    setArea((addr.area as string) ?? '');
    setStreet((addr.street as string) ?? '');
    setShowForm(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>العناوين</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => { resetForm(); setShowForm(true); }}>
          <Text style={styles.addBtnText}>+ إضافة</Text>
        </TouchableOpacity>
      </View>

      {loading ? <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} /> :
       error ? (
        <View style={styles.centered}>
          <Text style={styles.error}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetch}><Text style={styles.retryText}>إعادة المحاولة</Text></TouchableOpacity>
        </View>
       ) : data.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>📍</Text>
          <Text style={styles.empty}>لا توجد عناوين محفوظة</Text>
          <Text style={styles.hint}>أضف عنوانك لتسهيل الحجز</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => setShowForm(true)}>
            <Text style={styles.retryText}>إضافة عنوان</Text>
          </TouchableOpacity>
        </View>
       ) : (
        <ScrollView>
          {data.map((addr: Record<string, unknown>) => (
            <View key={addr.id as number} style={[styles.card, Boolean(addr.isDefault) && styles.cardDefault]}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={styles.addrLabel}>{addr.label as string}</Text>
                  {Boolean(addr.isDefault) ? <View style={styles.defaultBadge}><Text style={styles.defaultText}>افتراضي</Text></View> : null}
                </View>
                <Text style={styles.addrDetail}>{addr.city as string} - {addr.area as string}</Text>
                {addr.street ? <Text style={styles.addrStreet}>{addr.street as string}</Text> : null}
              </View>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => openEdit(addr)}>
                  <Text style={styles.actionText}>✏️</Text>
                </TouchableOpacity>
                {!addr.isDefault && (
                  <>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleSetDefault(addr.id as number)}>
                      <Text style={styles.actionText}>⭐</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDelete(addr.id as number)}>
                      <Text style={styles.actionText}>🗑️</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {showForm && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editId ? 'تعديل العنوان' : 'إضافة عنوان'}</Text>
            {saveMsg ? <Text style={[styles.error, { marginBottom: 8 }]}>{saveMsg}</Text> : null}
            <TextInput style={styles.input} placeholder="اسم العنوان (مثال: المنزل)" value={label} onChangeText={setLabel} />
            <TextInput style={styles.input} placeholder="المدينة" value={city} onChangeText={setCity} />
            <TextInput style={styles.input} placeholder="المنطقة" value={area} onChangeText={setArea} />
            <TextInput style={styles.input} placeholder="الشارع (اختياري)" value={street} onChangeText={setStreet} />
            <View style={styles.formBtns}>
              <TouchableOpacity style={styles.btn} onPress={handleSave}><Text style={styles.btnText}>حفظ</Text></TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={resetForm}><Text style={styles.cancelText}>إلغاء</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827' },
  addBtn: { backgroundColor: '#7c3aed', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 },
  addBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  card: { flexDirection: 'row', alignItems: 'center', padding: 16, marginBottom: 8, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  cardDefault: { borderColor: '#c4b5fd', backgroundColor: '#faf5ff' },
  addrLabel: { fontSize: 16, fontWeight: '600', color: '#111827' },
  defaultBadge: { backgroundColor: '#ede9fe', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  defaultText: { fontSize: 11, fontWeight: '600', color: '#7c3aed' },
  addrDetail: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  addrStreet: { fontSize: 13, color: '#9ca3af', marginTop: 2 },
  actionBtn: { padding: 8 },
  actionText: { fontSize: 16 },
  deleteBtn: {},
  centered: { alignItems: 'center', marginTop: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  empty: { fontSize: 18, fontWeight: '600', color: '#6b7280' },
  hint: { fontSize: 14, color: '#9ca3af', marginTop: 4, textAlign: 'center' },
  error: { color: '#ef4444', fontSize: 14, textAlign: 'center' },
  retryBtn: { backgroundColor: '#7c3aed', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 10, marginTop: 12 },
  retryText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  modal: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 16, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, padding: 14, fontSize: 16, backgroundColor: '#f9fafb', textAlign: 'right', marginBottom: 10 },
  formBtns: { flexDirection: 'row', gap: 8, marginTop: 8 },
  btn: { flex: 1, backgroundColor: '#7c3aed', borderRadius: 12, padding: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  cancelBtn: { flex: 1, backgroundColor: '#f3f4f6', borderRadius: 12, padding: 14, alignItems: 'center' },
  cancelText: { color: '#374151', fontSize: 16, fontWeight: '600' },
});
