import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ScreenState } from '@/components/ScreenState';
import { trpc } from '@/lib/trpc-react';

const COLORS = { brand: '#7c3aed', white: '#ffffff', gray400: '#6b7280', gray900: '#111827' };

export default function CustomerProfileScreen(): JSX.Element {
  const user = trpc.users.getMe.useQuery();
  const data = user.data as Record<string, unknown> | undefined;

  return (
    <ScreenState
      isLoading={user.isLoading}
      isError={user.isError}
      isEmpty={!data}
      errorMessage="فشل تحميل الملف الشخصي"
      onRetry={() => user.refetch()}
    >
      <Text style={styles.title}> حسابي</Text>
      {(data
        ? [
            { label: 'الاسم', value: data.name as string },
            { label: 'البريد', value: data.email as string },
            { label: 'الهاتف', value: data.phone as string },
            {
              label: 'الدور',
              value:
                (data.role as string) === 'CUSTOMER'
                  ? 'عميلة'
                  : (data.role as string) === 'TECHNICIAN'
                    ? 'فنية'
                    : 'مشرفة',
            },
            {
              label: 'اللغة',
              value: (data.preferredLanguage as string) === 'ar' ? 'العربية' : 'English',
            },
          ]
        : []
      ).map((row, i) => (
        <View key={i} style={styles.row}>
          <Text style={styles.label}>{row.label}</Text>
          <Text style={styles.value}>{row.value ?? '—'}</Text>
        </View>
      ))}
      <TouchableOpacity style={styles.editBtn}>
        <Text style={styles.editText}>️ تعديل الملف</Text>
      </TouchableOpacity>
    </ScreenState>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.brand,
    textAlign: 'center',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  label: { fontSize: 14, color: COLORS.gray400 },
  value: { fontSize: 14, fontWeight: '600', color: COLORS.gray900 },
  editBtn: { marginTop: 24, alignItems: 'center', padding: 16 },
  editText: { fontSize: 15, fontWeight: '600', color: COLORS.brand },
});
