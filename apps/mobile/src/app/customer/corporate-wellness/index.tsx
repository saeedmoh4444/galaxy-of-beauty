import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useState } from 'react';
import { trpc } from '@/lib/api';
import { useQuery } from '@/lib/useQuery';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';
import { typedTrpc } from '@/lib/trpc-react';

interface CorporatePlan {
  id?: string;
  emoji?: string;
  nameAr?: string;
  price?: number;
  employees?: number;
  services?: string[];
}

interface CorporateEnquiry {
  companyName?: string;
  planId?: string;
  createdAt?: string;
}

export default function CorporateWellnessScreen(): JSX.Element {
  const {
    data: plans,
    loading,
    error,
    refetch,
    refreshing,
    refresh,
  } = useQuery(() => typedTrpc().corporateWellness.plans.query());
  const { data: enquiries } = useQuery(() => typedTrpc().corporateWellness.myEnquiries.query());
  const [planId, setPlanId] = useState('growth');
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleEnquire = async () => {
    if (!companyName || !contactName || !email) return;
    try {
      await typedTrpc().corporateWellness.enquire.mutate({
        companyName,
        contactName,
        email,
        planId,
      });
      setSubmitted(true);
      setShowForm(false);
    } catch {}
  };

  if (loading) return <SkeletonList count={3} />;
  if (error) return <ErrorAlert message="فشل تحميل الباقات" onRetry={refetch} />;

  const items = (plans ?? []) as CorporatePlan[];
  const enquiryItems = ((enquiries as CorporateEnquiry[] | undefined) ?? []);

  return (
    <ScrollView
      style={s.c}
      contentContainerStyle={s.i}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} colors={['#db2777']} />
      }
    >
      <Text style={s.t}> عافية الشركات</Text>
      <Text style={s.sub}>باقات تجميل وعناية لمنسوبات الشركات</Text>

      {submitted && (
        <View
          style={{
            backgroundColor: '#ecfdf5',
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 32 }}></Text>
          <Text style={{ fontWeight: '700', color: '#059669', marginTop: 8 }}>
            تم استلام طلبكِ وسنتواصل معكِ
          </Text>
        </View>
      )}

      {items.map((p) => (
        <TouchableOpacity
          key={p.id}
          onPress={() => setPlanId(p.id ?? '')}
          style={[
            s.card,
            planId === p.id && { borderColor: '#db2777', backgroundColor: '#fdf2f8' },
          ]}
        >
          <Text style={{ fontSize: 40 }}>{p.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.cTitle}>{p.nameAr}</Text>
            <Text style={s.cPrice}>{(p.price ?? 0).toLocaleString()} ر.س / سنوياً</Text>
            <Text style={s.cSub}> حتى {p.employees} موظفة</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
              {(p.services ?? []).map((svc, i) => (
                <Text key={i} style={{ fontSize: 11, color: '#059669' }}>
                   {svc}
                </Text>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      ))}

      <TouchableOpacity onPress={() => setShowForm(!showForm)} style={[s.btn, { marginTop: 16 }]}>
        <Text style={s.btnText}>{showForm ? ' إغلاق' : ' تقديم طلب'}</Text>
      </TouchableOpacity>

      {showForm && (
        <View style={{ marginTop: 12, gap: 10 }}>
          <TextInput
            value={companyName}
            onChangeText={setCompanyName}
            placeholder="اسم الشركة"
            style={s.inp}
            placeholderTextColor="#9ca3af"
          />
          <TextInput
            value={contactName}
            onChangeText={setContactName}
            placeholder="اسم المسؤولة"
            style={s.inp}
            placeholderTextColor="#9ca3af"
          />
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="البريد الإلكتروني"
            style={s.inp}
            placeholderTextColor="#9ca3af"
            keyboardType="email-address"
          />
          <TouchableOpacity onPress={handleEnquire} style={s.btn}>
            <Text style={s.btnText}>إرسال الطلب</Text>
          </TouchableOpacity>
        </View>
      )}

      {enquiryItems.length > 0 && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 8 }}>
             طلباتي السابقة
          </Text>
          {enquiryItems.map((e, i) => (
            <View
              key={i}
              style={{ backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 6 }}
            >
              <Text style={{ fontWeight: '600', fontSize: 14 }}>{e.companyName}</Text>
              <Text style={{ fontSize: 12, color: '#6b7280' }}>
                {e.planId} · {new Date(e.createdAt ?? '').toLocaleDateString('ar-SA')}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 8 },
  sub: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 20 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  cTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  cPrice: { fontSize: 18, fontWeight: '800', color: '#db2777', marginTop: 4 },
  cSub: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  btn: { backgroundColor: '#db2777', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  inp: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    textAlign: 'right',
  },
});
