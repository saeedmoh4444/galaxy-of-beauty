import { View, Text, ScrollView, StyleSheet } from 'react-native';
const LOGS = [
  {
    action: 'إضافة خدمة جديدة',
    user: 'م. سارة',
    time: 'قبل 10 دقائق',
    emoji: '➕',
    type: 'create',
  },
  { action: 'تعديل سعر الخدمة', user: 'أ. نورة', time: 'قبل ساعة', emoji: '✏️', type: 'update' },
  { action: 'تعطيل حساب فنية', user: 'م. سارة', time: 'قبل 3 ساعات', emoji: '🚫', type: 'delete' },
  { action: 'تفعيل ميزة جديدة', user: 'أ. نورة', time: 'قبل 5 ساعات', emoji: '✅', type: 'update' },
  { action: 'إضافة قسيمة خصم', user: 'م. سارة', time: 'قبل يوم', emoji: '🎫', type: 'create' },
  { action: 'تصدير تقرير مالي', user: 'أ. نورة', time: 'قبل يومين', emoji: '📊', type: 'export' },
];
export default function AuditLogScreen(): JSX.Element {
  return (
    <ScrollView style={s.c} contentContainerStyle={s.i}>
      <Text style={s.h}>📋 سجل التدقيق</Text>
      <Text style={s.sub}>مراقبة جميع التغييرات في المنصة</Text>
      {LOGS.map((l, i) => (
        <View key={i} style={s.card}>
          <Text style={s.ce}>{l.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.cn}>{l.action}</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 2 }}>
              <Text style={s.cu}>👤 {l.user}</Text>
              <Text style={s.ct}>🕐 {l.time}</Text>
            </View>
          </View>
          <View
            style={[
              s.tag,
              {
                backgroundColor:
                  l.type === 'create'
                    ? '#d1fae5'
                    : l.type === 'delete'
                      ? '#fee2e2'
                      : l.type === 'export'
                        ? '#dbeafe'
                        : '#fef3c7',
              },
            ]}
          >
            <Text
              style={[
                s.tt,
                {
                  color:
                    l.type === 'create'
                      ? '#059669'
                      : l.type === 'delete'
                        ? '#dc2626'
                        : l.type === 'export'
                          ? '#2563eb'
                          : '#d97706',
                },
              ]}
            >
              {l.type === 'create'
                ? 'إنشاء'
                : l.type === 'delete'
                  ? 'حذف'
                  : l.type === 'export'
                    ? 'تصدير'
                    : 'تعديل'}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
const sc = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#f9fafb' },
  i: { padding: 16, paddingTop: 40, paddingBottom: 60 },
  h: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center' },
  sub: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    gap: 10,
  },
  ce: { fontSize: 24 },
  cn: { fontSize: 14, fontWeight: '600', color: '#111827' },
  cu: { fontSize: 11, color: '#6b7280' },
  ct: { fontSize: 11, color: '#9ca3af' },
  tag: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  tt: { fontSize: 11, fontWeight: '700' },
});
const s = sc;
