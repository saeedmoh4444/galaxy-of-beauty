import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { trpc } from '@/lib/api';
import { useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';

export default function TechnicianDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [tech, setTech] = useState<Record<string, unknown> | null>(null);
  const [busy, setBusy] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetch = () => {
    if (!id) return;
    setLoading(true);
    setError('');
    Promise.all([
      (trpc.technicians.getById as any).query({ userId: Number(id) }),
      (trpc.technicians.getBusyStatus as any).query({ userId: Number(id) }),
    ])
      .then(([t, b]: [Record<string, unknown>, Record<string, unknown>]) => {
        setTech(t);
        setBusy(b);
        setLoading(false);
      })
      .catch(() => { setError('فشل تحميل بيانات الفنية'); setLoading(false); });
  };

  useEffect(() => { fetch(); }, [id]);

  const handleWaitlist = async () => {
    try {
      await (trpc.waitlist.join as any).mutate({ technicianId: Number(id) });
    } catch {}
  };

  if (loading) return <ActivityIndicator color="#7c3aed" style={{ marginTop: 80 }} />;
  if (error || !tech) return (
    <View style={styles.centered}>
      <Text style={styles.error}>{error || 'الفنية غير موجودة'}</Text>
      <TouchableOpacity style={styles.retryBtn} onPress={fetch}><Text style={styles.retryText}>إعادة المحاولة</Text></TouchableOpacity>
    </View>
  );

  const user = tech.user as Record<string, unknown>;
  const services = (tech.technicianServices as Record<string, unknown>[]) ?? [];
  const isBusy = Boolean(busy?.isBusy);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
        <Text style={styles.name}>{user.name as string}</Text>
        <Text style={styles.city}>{tech.city as string} - {tech.area as string}</Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statVal}>⭐ {Number(tech.ratingAvg ?? 0).toFixed(1)}</Text>
            <Text style={styles.statLabel}>({String(tech.totalReviews ?? 0)})</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: isBusy ? '#fee2e2' : '#d1fae5' }]}>
            <Text style={{ color: isBusy ? '#ef4444' : '#10b981', fontWeight: '600', fontSize: 14 }}>{isBusy ? 'مشغولة' : 'متاحة'}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.bookBtn} onPress={handleWaitlist}>
          <Text style={styles.bookText}>انضم لقائمة الانتظار</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>نبذة</Text>
        <Text style={styles.bio}>{tech.bioAr as string ?? 'لا توجد نبذة'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>الخدمات ({services.length})</Text>
        {services.length === 0 ? (
          <Text style={styles.noData}>لا توجد خدمات</Text>
        ) : (
          services.map((ts: Record<string, unknown>) => {
            const svc = ts.service as Record<string, unknown>;
            return (
              <View key={ts.id as number} style={styles.serviceCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.svcName}>{((svc?.titleJson as Record<string, string>)?.ar ?? '')}</Text>
                  <Text style={styles.svcMeta}>{String(svc?.durationMin ?? 0)} دقيقة</Text>
                </View>
                <Text style={styles.svcPrice}>{Number(ts.customPrice ?? svc?.basePrice ?? 0).toFixed(0)} ر.س</Text>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  profileHeader: { alignItems: 'center', padding: 24, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#f5f3ff', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 36 },
  name: { fontSize: 22, fontWeight: '800', color: '#111827' },
  city: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 12 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statVal: { fontSize: 16, fontWeight: '600', color: '#111827' },
  statLabel: { fontSize: 13, color: '#9ca3af' },
  statusBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  bookBtn: { backgroundColor: '#7c3aed', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 16, width: '100%' },
  bookText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  section: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 8 },
  bio: { fontSize: 14, color: '#6b7280', lineHeight: 22 },
  noData: { fontSize: 14, color: '#9ca3af', textAlign: 'center' },
  serviceCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 8, backgroundColor: '#f9fafb', marginBottom: 6 },
  svcName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  svcMeta: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  svcPrice: { fontSize: 16, fontWeight: '800', color: '#7c3aed' },
  centered: { alignItems: 'center', marginTop: 80, padding: 16 },
  error: { color: '#ef4444', fontSize: 16, marginBottom: 12 },
  retryBtn: { backgroundColor: '#7c3aed', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 10 },
  retryText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
