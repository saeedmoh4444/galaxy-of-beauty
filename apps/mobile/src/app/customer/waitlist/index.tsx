import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function WaitlistScreen() {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showJoin, setShowJoin] = useState(false);
  const [techId, setTechId] = useState('');
  const [joinMsg, setJoinMsg] = useState('');
  const [techs, setTechs] = useState<Record<string, unknown>[]>([]);

  const fetch = () => {
    setLoading(true);
    setError('');
    (trpc.waitlist.listMyEntries as any).query({} as never)
      .then((d: Record<string, unknown>[]) => { setData(d ?? []); setLoading(false); })
      .catch(() => { setError('فشل تحميل قائمة الانتظار'); setLoading(false); });
  };

  useEffect(() => { fetch(); }, []);

  const fetchTechs = () => {
    (trpc.technicians.list as any).query({ limit: 100 })
      .then((d: Record<string, unknown>) => { setTechs((d?.items ?? []) as Record<string, unknown>[]); })
      .catch(() => {});
  };

  const handleJoin = async () => {
    if (!techId) { setJoinMsg('يرجى اختيار فني'); return; }
    try {
      await (trpc.waitlist.join as any).mutate({ technicianId: Number(techId) });
      setShowJoin(false);
      setTechId('');
      fetch();
    } catch (e: any) { setJoinMsg(e?.message ?? 'فشل الانضمام'); }
  };

  const handleLeave = async (tid: number) => {
    try {
      await (trpc.waitlist.leave as any).mutate({ technicianId: tid });
      fetch();
    } catch {}
  };

  const statusColor = (s: string) => {
    if (s === 'WAITING') return '#f59e0b';
    if (s === 'NOTIFIED') return '#3b82f6';
    if (s === 'CLAIMED') return '#10b981';
    return '#9ca3af';
  };

  const statusLabel = (s: string) => {
    if (s === 'WAITING') return 'بانتظار الدور';
    if (s === 'NOTIFIED') return 'تم الإشعار';
    if (s === 'CLAIMED') return 'تم الحجز';
    return 'منتهي';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>قائمة الانتظار</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => { setShowJoin(true); fetchTechs(); }}>
          <Text style={styles.addBtnText}>+ انضمام</Text>
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
          <Text style={styles.emptyIcon}>⏳</Text>
          <Text style={styles.empty}>قائمة الانتظار فارغة</Text>
          <Text style={styles.hint}>لم تنضم لأي قائمة انتظار بعد</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => { setShowJoin(true); fetchTechs(); }}>
            <Text style={styles.retryText}>انضم الآن</Text>
          </TouchableOpacity>
        </View>
       ) : (
        <ScrollView>
          {data.map((e: Record<string, unknown>) => (
            <View key={e.id as number} style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{e.technicianName as string}</Text>
                <Text style={styles.itemSub}>الترتيب: #{e.position as number}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 8 }}>
                <View style={[styles.badge, { backgroundColor: statusColor(e.status as string) + '20' }]}>
                  <Text style={{ color: statusColor(e.status as string), fontSize: 12, fontWeight: '600' }}>{statusLabel(e.status as string)}</Text>
                </View>
                {(e.status as string) === 'WAITING' && (
                  <TouchableOpacity style={styles.leaveBtn} onPress={() => handleLeave(e.technicianId as number)}>
                    <Text style={styles.leaveText}>مغادرة</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {showJoin && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>انضمام لقائمة الانتظار</Text>
            {joinMsg ? <Text style={styles.error}>{joinMsg}</Text> : null}
            <Text style={styles.label}>اختر الفني</Text>
            <ScrollView style={{ maxHeight: 200 }}>
              {techs.map((t: Record<string, unknown>) => (
                <TouchableOpacity
                  key={t.id as number}
                  style={[styles.techOption, Number(techId) === (t.id as number) && styles.techActive]}
                  onPress={() => setTechId(String(t.id))}
                >
                  <Text style={styles.techName}>{t.name as string}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.btn} onPress={handleJoin}><Text style={styles.btnText}>تأكيد</Text></TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowJoin(false)}><Text style={styles.cancelText}>إلغاء</Text></TouchableOpacity>
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
  itemTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  itemSub: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  leaveBtn: { borderWidth: 1, borderColor: '#fecaca', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  leaveText: { color: '#ef4444', fontSize: 13, fontWeight: '600' },
  centered: { alignItems: 'center', marginTop: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  empty: { fontSize: 18, fontWeight: '600', color: '#6b7280' },
  hint: { fontSize: 14, color: '#9ca3af', marginTop: 4, textAlign: 'center' },
  error: { color: '#ef4444', fontSize: 14, textAlign: 'center', marginBottom: 8 },
  retryBtn: { backgroundColor: '#7c3aed', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 10, marginTop: 12 },
  retryText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  modal: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 16, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  techOption: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 6 },
  techActive: { borderColor: '#7c3aed', backgroundColor: '#f5f3ff' },
  techName: { fontSize: 15, color: '#111827' },
  modalBtns: { flexDirection: 'row', gap: 8, marginTop: 16 },
  btn: { flex: 1, backgroundColor: '#7c3aed', borderRadius: 12, padding: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  cancelBtn: { flex: 1, backgroundColor: '#f3f4f6', borderRadius: 12, padding: 14, alignItems: 'center' },
  cancelText: { color: '#374151', fontSize: 16, fontWeight: '600' },
});
