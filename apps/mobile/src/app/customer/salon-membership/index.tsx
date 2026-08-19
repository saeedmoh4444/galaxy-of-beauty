import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { ErrorAlert } from '@/components/ErrorAlert';
import { SkeletonList } from '@/components/SkeletonCard';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

interface MembershipInfo {
  tier?: string;
  autoRenew?: boolean;
}

const MEMBERSHIPS = [
  {
    key: 'basic',
    emoji: '',
    name: 'الأساسية',
    price: 0,
    color: '#9ca3af',
    benefits: ['حجز المواعيد', 'تصفح الخدمات', 'تقييم الفنيات'],
    notIncluded: ['خصم على الخدمات', 'حجز أولوية', 'استشارات مجانية'],
  },
  {
    key: 'premium',
    emoji: '',
    name: 'المميزة',
    price: 99,
    color: '#f59e0b',
    benefits: [
      'خصم ١٠٪',
      'حجز أولوية',
      'استشارة مجانية شهرياً',
      'هدية ترحيبية',
      'نقاط مضاعفة',
      'دخول فعاليات حصرية',
    ],
    notIncluded: [],
  },
  {
    key: 'platinum',
    emoji: '',
    name: 'البلاتينية',
    price: 299,
    color: '#7c3aed',
    benefits: [
      'خصم ٢٠٪',
      'حجز فوري',
      'استشارات غير محدودة',
      'مديرة حساب شخصية',
      'هدية شهرية',
      'نقاط ×٣',
      'فعاليات VIP',
      'خدمة توصيل مجانية',
    ],
    notIncluded: [],
  },
];

export default function SalonMembershipScreen(): JSX.Element {
  const { t } = useLocale();
  const membershipQ = trpc.salonMembership.myMembership.useQuery();

  const subscribeMut = trpc.salonMembership.subscribe.useMutation({
    onSuccess: () => {
      void membershipQ.refetch();
    },
    onError: () => {},
  });
  const cancelMut = trpc.salonMembership.cancel.useMutation({
    onSuccess: () => {
      void membershipQ.refetch();
    },
    onError: () => {},
  });
  const handleSubscribe = (tier: string) => {
    subscribeMut.mutate({ tier, autoRenew: true });
  };
  const handleCancel = () => {
    cancelMut.mutate();
  };

  if (membershipQ.isLoading) return <SkeletonList count={3} />;
  if (membershipQ.isError)
    return (
      <ErrorAlert
        message={t('mobile.salonMembership.load-error')}
        onRetry={() => membershipQ.refetch()}
      />
    );

  const current = membershipQ.data as MembershipInfo | undefined;

  return (
    <ScrollView
      style={s.c}
      contentContainerStyle={s.i}
      refreshControl={
        <RefreshControl
          refreshing={membershipQ.isRefetching}
          onRefresh={() => membershipQ.refetch()}
          colors={['#db2777']}
        />
      }
    >
      <Text style={s.t}>{t('mobile.salonMembership.title')}</Text>
      <Text style={s.sub}>{t('mobile.salonMembership.subtitle')}</Text>

      {current?.tier && (
        <View
          style={{
            backgroundColor: '#faf5ff',
            borderRadius: 14,
            borderWidth: 2,
            borderColor: '#7c3aed',
            padding: 16,
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center' }}>
            {t('mobile.salonMembership.current')}
          </Text>
          <Text
            style={{
              fontSize: 24,
              fontWeight: '800',
              color: '#7c3aed',
              textAlign: 'center',
              marginTop: 4,
            }}
          >
            {current.tier === 'platinum'
              ? t('mobile.salonMembership.tier-platinum')
              : current.tier === 'premium'
                ? t('mobile.salonMembership.tier-premium')
                : t('mobile.salonMembership.tier-basic')}
          </Text>
          {current.autoRenew && (
            <TouchableOpacity
              onPress={handleCancel}
              style={{ marginTop: 10, alignItems: 'center' }}
            >
              <Text style={{ color: '#ef4444', fontWeight: '600' }}>
                {t('mobile.salonMembership.cancel-auto-renew')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {MEMBERSHIPS.map((m) => (
        <View key={m.key} style={[s.card, { borderColor: m.color }]}>
          <Text style={{ fontSize: 40, textAlign: 'center' }}>{m.emoji}</Text>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '800',
              textAlign: 'center',
              color: m.color,
              marginTop: 8,
            }}
          >
            {m.name}
          </Text>
          <Text style={{ fontSize: 22, fontWeight: '800', textAlign: 'center', marginTop: 4 }}>
            {m.price === 0
              ? t('mobile.salonMembership.free')
              : t('mobile.salonMembership.monthly-price', { price: m.price })}
          </Text>
          <View style={{ marginTop: 12, gap: 4 }}>
            <Text style={{ fontWeight: '600', color: '#374151', marginBottom: 4 }}>
              {t('mobile.salonMembership.benefits')}
            </Text>
            {m.benefits.map((b, i) => (
              <Text key={i} style={{ color: '#059669', fontSize: 12 }}>
                {b}
              </Text>
            ))}
            {m.notIncluded.length > 0 && (
              <>
                <Text
                  style={{ fontWeight: '600', color: '#9ca3af', marginTop: 8, marginBottom: 4 }}
                >
                  {t('mobile.salonMembership.not-included')}
                </Text>
                {m.notIncluded.map((b, i) => (
                  <Text key={i} style={{ color: '#d1d5db', fontSize: 12 }}>
                    {b}
                  </Text>
                ))}
              </>
            )}
          </View>
          <TouchableOpacity
            onPress={() => handleSubscribe(m.key)}
            style={[s.btn, { backgroundColor: m.color, marginTop: 14 }]}
          >
            <Text style={s.btnText}>
              {m.price === 0
                ? t('mobile.salonMembership.free')
                : t('mobile.salonMembership.subscribe')}
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 8 },
  sub: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 2,
    padding: 16,
    marginBottom: 12,
  },
  btn: { borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
