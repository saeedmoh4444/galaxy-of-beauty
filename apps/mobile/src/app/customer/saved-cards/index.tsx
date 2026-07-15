import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, TextInput, Modal } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function SavedCardsScreen() {
  const [cards, setCards] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ lastFour: '', brand: 'visa', expMonth: '1', expYear: '2026', cardholderName: '' });
  const [saving, setSaving] = useState(false);

  const fetchCards = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (trpc.savedCards.list.query() as any as Promise<Record<string, unknown>[]>)
      .then((d) => { setCards(d || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchCards(); }, []);

  const handleAdd = async () => {
    if (!form.lastFour || !form.cardholderName) {
      Alert.alert('خطأ', 'الرجاء إدخال كافة البيانات');
      return;
    }
    setSaving(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (trpc.savedCards.add.mutate({
        cardToken: `tok_${Date.now()}`,
        lastFour: form.lastFour,
        brand: form.brand as 'visa' | 'mastercard' | 'mada' | 'amex',
        expMonth: Number(form.expMonth),
        expYear: Number(form.expYear),
        cardholderName: form.cardholderName,
        setDefault: cards.length === 0,
      }) as any as Promise<unknown>);
      setShowAdd(false);
      fetchCards();
    } catch { Alert.alert('خطأ', 'فشلت الإضافة'); }
    finally { setSaving(false); }
  };

  const handleDelete = (cardId: number) => {
    Alert.alert('تأكيد', 'هل تريد حذف هذه البطاقة؟', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (trpc.savedCards.delete.mutate({ cardId }) as any as Promise<unknown>);
        fetchCards();
      }},
    ]);
  };

  const brandIcons: Record<string, string> = { visa: '💳', mastercard: '💳', mada: '🏦', amex: '💳' };

  if (loading) return <ActivityIndicator color="#7c3aed" style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <View style={styles.header}>
        <Text style={styles.title}>البطاقات المحفوظة</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)} activeOpacity={0.8}>
          <Text style={styles.addText}>+ إضافة</Text>
        </TouchableOpacity>
      </View>

      {cards.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>💳</Text>
          <Text style={styles.emptyText}>لا توجد بطاقات محفوظة</Text>
        </View>
      ) : (
        cards.map((c) => (
          <View key={c.id as number} style={styles.card}>
            <View style={styles.cardLeft}>
              <Text style={styles.brandIcon}>{brandIcons[c.brand as string] || '💳'}</Text>
              <View>
                <Text style={styles.cardBrand}>{(c.brand as string).toUpperCase()} ···· {c.lastFour as string}</Text>
                <Text style={styles.cardHolder}>{c.cardholderName as string} · {c.expMonth as number}/{c.expYear as number}</Text>
              </View>
            </View>
            <View style={styles.cardRight}>
              {c.isDefault ? <Text style={styles.defaultBadge}>افتراضي</Text> : null}
              <TouchableOpacity onPress={() => handleDelete(c.id as number)}>
                <Text style={styles.deleteBtn}>حذف</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      {/* Add Modal */}
      <Modal visible={showAdd} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>إضافة بطاقة جديدة</Text>
            <TextInput style={styles.input} placeholder="الاسم على البطاقة" value={form.cardholderName} onChangeText={(t) => setForm({ ...form, cardholderName: t })} placeholderTextColor="#9ca3af" />
            <TextInput style={styles.input} placeholder="آخر 4 أرقام" value={form.lastFour} onChangeText={(t) => setForm({ ...form, lastFour: t })} maxLength={4} keyboardType="number-pad" placeholderTextColor="#9ca3af" />
            <View style={styles.row}>
              <TouchableOpacity style={[styles.select, form.brand === 'visa' && styles.selectActive]} onPress={() => setForm({...form, brand:'visa'})}><Text style={form.brand==='visa'?styles.selectTextActive:styles.selectText}>Visa</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.select, form.brand === 'mastercard' && styles.selectActive]} onPress={() => setForm({...form, brand:'mastercard'})}><Text style={form.brand==='mastercard'?styles.selectTextActive:styles.selectText}>MC</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.select, form.brand === 'mada' && styles.selectActive]} onPress={() => setForm({...form, brand:'mada'})}><Text style={form.brand==='mada'?styles.selectTextActive:styles.selectText}>Mada</Text></TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.saveBtn} onPress={handleAdd} disabled={saving} activeOpacity={0.8}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>حفظ البطاقة</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowAdd(false)}><Text style={styles.cancelText}>إلغاء</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { padding: 16, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: '800', color: '#111827' },
  addBtn: { backgroundColor: '#7c3aed', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  addText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, marginBottom: 8 },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  brandIcon: { fontSize: 28 },
  cardBrand: { fontSize: 15, fontWeight: '600', color: '#111827' },
  cardHolder: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  cardRight: { alignItems: 'flex-end', gap: 6 },
  defaultBadge: { backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, fontSize: 11, color: '#16a34a', overflow: 'hidden' },
  deleteBtn: { fontSize: 13, color: '#ef4444' },
  empty: { alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 40, marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#9ca3af' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modal: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, gap: 14 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827', textAlign: 'right', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 12, fontSize: 14, textAlign: 'right', backgroundColor: '#f9fafb' },
  row: { flexDirection: 'row', gap: 8 },
  select: { flex: 1, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 10, alignItems: 'center' },
  selectActive: { borderColor: '#7c3aed', backgroundColor: '#f5f3ff' },
  selectText: { fontSize: 13, color: '#6b7280' },
  selectTextActive: { fontSize: 13, color: '#7c3aed', fontWeight: '600' },
  saveBtn: { backgroundColor: '#7c3aed', borderRadius: 10, padding: 14, alignItems: 'center' },
  saveText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  cancelText: { fontSize: 14, color: '#9ca3af', textAlign: 'center' },
});
