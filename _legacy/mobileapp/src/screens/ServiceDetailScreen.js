import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';

export default function ServiceDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { isAuthenticated, user } = useAuthStore();

  const { data: service, isLoading } = useQuery({
    queryKey: ['services', id],
    queryFn: async () => { const { data } = await api.get(`/services/${id}`); return data.service; },
  });

  if (isLoading) return <ActivityIndicator size="large" color="#7C3AED" style={{ marginTop: 60 }} />;
  if (!service) return <Text style={styles.error}>الخدمة غير موجودة</Text>;

  const handleBook = () => {
    if (!isAuthenticated) return navigation.navigate('Login');
    if (user?.role === 'CUSTOMER') navigation.navigate('Booking', { serviceId: service.id, techUserId: service.technicianServices?.[0]?.technician?.user?.id });
    else Alert.alert('تنبيه', 'العميلات فقط يمكنهن الحجز');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>{service.titleJson?.ar}</Text>
      <Text style={styles.enTitle}>{service.titleJson?.en}</Text>

      <View style={styles.priceRow}>
        <Text style={styles.price}>{Number(service.basePrice).toLocaleString('ar-SA')} ر.س</Text>
        <Text style={styles.duration}>⏱ {service.durationMin} دقيقة</Text>
      </View>

      {service.descriptionJson?.ar && <Text style={styles.desc}>{service.descriptionJson.ar}</Text>}

      {/* Variants */}
      {service.variants?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الخيارات المتاحة</Text>
          {service.variants.map((v) => (
            <View key={v.id} style={styles.variantRow}>
              <Text style={styles.variantName}>{v.nameJson?.ar}</Text>
              {Number(v.priceDelta) !== 0 && <Text style={{ color: v.priceDelta > 0 ? '#EF4444' : '#10B981' }}>{v.priceDelta > 0 ? '+' : ''}{Number(v.priceDelta)} ر.س</Text>}
            </View>
          ))}
        </View>
      )}

      {/* Add-ons */}
      {service.addons?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الإضافات</Text>
          {service.addons.map((a) => (
            <View key={a.addon.id} style={styles.variantRow}>
              <Text>{a.addon.titleJson?.ar}</Text>
              <Text style={styles.price}>+{Number(a.addon.basePrice)} ر.س</Text>
            </View>
          ))}
        </View>
      )}

      {/* Technicians */}
      {service.technicianServices?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>متخصصات يقدمن هذه الخدمة</Text>
          {service.technicianServices.map((ts) => (
            <View key={ts.technician.id} style={styles.techRow}>
              <Text>👩‍🦰 {ts.technician.user?.name}</Text>
              <Text>⭐ {Number(ts.technician.ratingAvg || 0).toFixed(1)}</Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.btn} onPress={handleBook}>
        <Text style={styles.btnText}>احجزي الآن</Text>
      </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '700', color: '#111827' },
  enTitle: { fontSize: 14, color: '#9CA3AF', marginBottom: 16 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  price: { fontSize: 28, fontWeight: '800', color: '#7C3AED' },
  duration: { fontSize: 16, color: '#6B7280' },
  desc: { fontSize: 14, color: '#4B5563', lineHeight: 22, marginBottom: 20 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10 },
  variantRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  variantName: { fontSize: 14, color: '#374151' },
  techRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  btn: { backgroundColor: '#7C3AED', borderRadius: 14, padding: 18, alignItems: 'center', marginTop: 20, marginBottom: 40 },
  btnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  error: { textAlign: 'center', marginTop: 40, fontSize: 16, color: '#9CA3AF' },
});
