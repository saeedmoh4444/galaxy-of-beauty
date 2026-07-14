import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', role: 'CUSTOMER', city: '' });
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);

  const handleRegister = async () => {
    if (form.password !== form.confirmPassword) return Alert.alert('خطأ', 'كلمات المرور غير متطابقة');
    if (!form.name || !form.email || !form.phone || !form.password) return Alert.alert('خطأ', 'جميع الحقول مطلوبة');
    setLoading(true);
    try {
      const payload = { ...form, acceptTerms: true, idempotencyKey: `mob-${Date.now()}-${Math.random()}` };
      delete payload.confirmPassword;
      if (form.role === 'CUSTOMER') delete payload.city;
      const { data } = await api.post('/auth/register', payload);
      await login(data.user, data.accessToken, data.refreshToken);
    } catch (err) {
      Alert.alert('خطأ', err.response?.data?.error?.message || 'فشل إنشاء الحساب');
    } finally { setLoading(false); }
  };

  const update = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.emoji}>✨</Text>
        <Text style={styles.title}>إنشاء حساب</Text>

        <View style={styles.roleRow}>
          <TouchableOpacity style={[styles.roleBtn, form.role === 'CUSTOMER' && styles.roleActive]} onPress={() => update('role', 'CUSTOMER')}>
            <Text style={styles.roleText}>👩‍🦰 عميلة</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.roleBtn, form.role === 'TECHNICIAN' && styles.roleActive]} onPress={() => update('role', 'TECHNICIAN')}>
            <Text style={styles.roleText}>💇‍♀️ متخصصة</Text>
          </TouchableOpacity>
        </View>

        <TextInput style={styles.input} placeholder="الاسم الكامل" value={form.name} onChangeText={(v) => update('name', v)} autoComplete="name" textContentType="name" textAlign="right" />
        <TextInput style={styles.input} placeholder="البريد الإلكتروني" value={form.email} onChangeText={(v) => update('email', v)} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" textAlign="right" />
        <TextInput style={styles.input} placeholder="رقم الجوال (+9665XXXXXXXX)" value={form.phone} onChangeText={(v) => update('phone', v)} keyboardType="phone-pad" autoComplete="tel" textContentType="telephoneNumber" textAlign="right" />

        {form.role === 'TECHNICIAN' && (
          <TextInput style={styles.input} placeholder="المدينة" value={form.city} onChangeText={(v) => update('city', v)} textAlign="right" />
        )}

        <TextInput style={styles.input} placeholder="كلمة المرور" value={form.password} onChangeText={(v) => update('password', v)} secureTextEntry autoComplete="password-new" textContentType="newPassword" textAlign="right" />
        <TextInput style={styles.input} placeholder="تأكيد كلمة المرور" value={form.confirmPassword} onChangeText={(v) => update('confirmPassword', v)} secureTextEntry autoComplete="password-new" textContentType="newPassword" textAlign="right" />

        <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleRegister} disabled={loading}>
          <Text style={styles.btnText}>{loading ? 'جاري التسجيل...' : 'إنشاء حساب'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>لديك حساب بالفعل؟ تسجيل الدخول</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  emoji: { fontSize: 48, textAlign: 'center', marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center', color: '#111827', marginBottom: 20 },
  roleRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  roleBtn: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 2, borderColor: '#E5E7EB', alignItems: 'center' },
  roleActive: { borderColor: '#7C3AED', backgroundColor: '#F5F3FF' },
  roleText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 10, backgroundColor: '#F9FAFB' },
  btn: { backgroundColor: '#7C3AED', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { color: '#7C3AED', textAlign: 'center', marginTop: 16, fontSize: 14 },
});
