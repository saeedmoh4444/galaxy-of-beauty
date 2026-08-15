import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { trpc } from '@/lib/trpc-react';
import { useToast } from '@/components/Toast';

export default function RegisterScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '+9665',
    password: '',
    role: 'CUSTOMER' as 'CUSTOMER' | 'TECHNICIAN',
    city: '',
  });

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const registerMut = trpc.auth.register.useMutation({
    onSuccess: () => {
      showToast('success', 'تم إنشاء الحساب بنجاح');
      setTimeout(() => router.replace('/(auth)/login'), 1000);
    },
    onError: (err) => {
      showToast('error', err.message || 'فشل إنشاء الحساب');
    },
  });

  const handleRegister = () => {
    registerMut.mutate({
      email: form.email,
      phone: form.phone,
      password: form.password,
      name: form.name,
      role: form.role,
      acceptedTerms: true,
      city: form.role === 'TECHNICIAN' ? form.city : undefined,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>إنشاء حساب</Text>
      <TextInput
        style={styles.input}
        placeholder="الاسم"
        value={form.name}
        onChangeText={(t) => set('name', t)}
      />
      <TextInput
        style={styles.input}
        placeholder="البريد الإلكتروني"
        value={form.email}
        onChangeText={(t) => set('email', t)}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="رقم الجوال (+9665xxxxxxxx)"
        value={form.phone}
        onChangeText={(t) => set('phone', t)}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="كلمة المرور"
        value={form.password}
        onChangeText={(t) => set('password', t)}
        secureTextEntry
      />
      <View style={styles.roleRow}>
        <TouchableOpacity
          style={[styles.roleBtn, form.role === 'CUSTOMER' && styles.roleActive]}
          onPress={() => set('role', 'CUSTOMER')}
        >
          <Text style={[styles.roleText, form.role === 'CUSTOMER' && styles.roleTextActive]}>
            عميلة
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.roleBtn, form.role === 'TECHNICIAN' && styles.roleActive]}
          onPress={() => set('role', 'TECHNICIAN')}
        >
          <Text style={[styles.roleText, form.role === 'TECHNICIAN' && styles.roleTextActive]}>
            فنية
          </Text>
        </TouchableOpacity>
      </View>
      {form.role === 'TECHNICIAN' && (
        <TextInput
          style={styles.input}
          placeholder="المدينة"
          value={form.city}
          onChangeText={(t) => set('city', t)}
        />
      )}
      <TouchableOpacity
        style={[styles.button, registerMut.isPending && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={registerMut.isPending}
      >
        <Text style={styles.buttonText}>
          {registerMut.isPending ? 'جاري الإنشاء...' : 'إنشاء حساب'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.link}>لديك حساب؟ تسجيل الدخول</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: '#fff' },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#7c3aed',
    textAlign: 'center',
    marginBottom: 32,
    marginTop: 60,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#f9fafb',
  },
  button: {
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { color: '#7c3aed', textAlign: 'center', marginTop: 16, fontSize: 14 },
  roleRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  roleBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  roleActive: { borderColor: '#7c3aed', backgroundColor: '#f5f3ff' },
  roleText: { fontSize: 14, color: '#6b7280' },
  roleTextActive: { color: '#7c3aed', fontWeight: '600' },
});
