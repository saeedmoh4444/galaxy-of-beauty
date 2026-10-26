import type { JSX } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SkeletonList } from '@/components/SkeletonCard';
import { SellerHomeCard } from '@/components/SellerHomeCard';
import { sellerHomeSummary } from '@/utils/vendorHome';
import { useAuthState } from '@/hooks/useAuthState';
import { trpc } from '@/lib/trpc-react';
import { useLocale } from '@/components/LocaleProvider';

export default function VendorPortalScreen(): JSX.Element {
  const { t, locale } = useLocale();
  const router = useRouter();
  const isAuthed = useAuthState();
  const dashQ = trpc.vendorPortal.dashboard.useQuery(undefined, { enabled: isAuthed });
  const productsQ = trpc.vendorPortal.myProducts.useQuery({}, { enabled: isAuthed });
  const storeQ = trpc.vendorPortal.myStore.useQuery(undefined, { enabled: isAuthed });
  const unreadQ = trpc.notifications.unreadCount.useQuery(undefined, { enabled: isAuthed });
  const dash = dashQ.data;
  const unread = unreadQ.data?.count ?? 0;
  // A5 — myProducts is cursor-paginated; the mobile portal renders the
  // first page (browse-only by design — web-first dashboards).
  const products = productsQ.data?.items ?? [];
  // E1 — seller home: the caller's own store profile card (myStore is
  // staff-aware — staff sellers see their vendor's identity too).
  const home = sellerHomeSummary(storeQ.data, dash, locale);

  const deleteMut = trpc.vendorPortal.deleteProduct.useMutation({
    onSuccess: () => {
      void dashQ.refetch();
      void productsQ.refetch();
    },
  });
  const remove = (id: number) => {
    deleteMut.mutate({ id });
  };
  if (dashQ.isLoading || productsQ.isLoading || storeQ.isLoading) return <SkeletonList count={4} />;
  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={dashQ.isRefetching || productsQ.isRefetching}
          onRefresh={() => {
            void dashQ.refetch();
            void productsQ.refetch();
          }}
          colors={['#c2255c']}
        />
      }
    >
      <Text style={styles.t}>{t('mobile.vendorPortal.title')}</Text>
      {home ? (
        <SellerHomeCard
          summary={home}
          onViewStorefront={() => router.push(`/customer/stores/${home.slug}`)}
        />
      ) : null}
      <View style={styles.kr}>
        <View style={styles.k}>
          <Text style={styles.ke}>📦</Text>
          <Text style={styles.kv}>{dash?.totalProducts ?? 0}</Text>
          <Text style={styles.kl}>{t('mobile.vendorPortal.products')}</Text>
        </View>
        <View style={styles.k}>
          <Text style={styles.ke}>💰</Text>
          <Text style={[styles.kv, { color: '#059669' }]}>
            {(dash?.revenue ?? 0)?.toLocaleString(locale === 'en' ? 'en-GB' : 'ar-SA')}
          </Text>
          <Text style={styles.kl}>{t('mobile.vendorPortal.sar')}</Text>
        </View>
      </View>
      {/* E2 — orders entry: the daily run loop (list + fulfill/cancel). */}
      <TouchableOpacity
        style={styles.ordersRow}
        onPress={() => router.push('/vendor-portal/orders')}
      >
        <Text style={styles.ordersEmoji}>📦</Text>
        <Text style={styles.ordersLabel}>{t('mobile.vendorPortal.orders.title')}</Text>
        {(dash?.pendingOrders ?? 0) > 0 ? (
          <Text style={styles.ordersBadge}>{dash?.pendingOrders}</Text>
        ) : null}
        <Text style={styles.ordersArrow}>›</Text>
      </TouchableOpacity>
      {/* E3 — the seller inbox: low-stock, SLA, dispute and payout notices. */}
      <TouchableOpacity style={styles.inboxRow} onPress={() => router.push('/vendor-portal/inbox')}>
        <Text style={styles.inboxEmoji}>🔔</Text>
        <Text style={styles.inboxLabel}>{t('mobile.notifications.title')}</Text>
        {unread > 0 ? <Text style={styles.inboxBadge}>{unread}</Text> : null}
        <Text style={styles.inboxArrow}>›</Text>
      </TouchableOpacity>
      {/* E4 — earnings glance: pending/processed nets + payout schedule. */}
      <TouchableOpacity
        style={styles.earningsRow}
        onPress={() => router.push('/vendor-portal/earnings')}
      >
        <Text style={styles.earningsEmoji}>💰</Text>
        <Text style={styles.earningsLabel}>{t('mobile.vendorPortal.earnings.title')}</Text>
        <Text style={styles.earningsArrow}>›</Text>
      </TouchableOpacity>
      {/* E4b — social links editable from the phone (B6 fields). */}
      <TouchableOpacity
        style={styles.socialsRow}
        onPress={() => router.push('/vendor-portal/socials')}
      >
        <Text style={styles.socialsEmoji}>🌐</Text>
        <Text style={styles.socialsLabel}>{t('mobile.vendorPortal.socials.title')}</Text>
        <Text style={styles.socialsArrow}>›</Text>
      </TouchableOpacity>
      {products.map((p) => (
        <View key={p.id} style={styles.card}>
          <Text style={styles.em}>🧴</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.nm}>{locale === 'ar' ? p.nameAr : p.nameEn}</Text>
            <Text style={styles.meta}>
              {t('marketing.compare.price-sar', {
                price: p.price?.toLocaleString(locale === 'en' ? 'en-GB' : 'ar-SA') ?? '',
              })}
            </Text>
          </View>
          <TouchableOpacity onPress={() => remove(p.id)}>
            <Text style={styles.del}>🗑️</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#faf5ff' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  t: { fontSize: 24, fontWeight: '800', color: '#7c3aed', textAlign: 'center', marginBottom: 20 },
  kr: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  k: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center' },
  ke: { fontSize: 28, marginBottom: 4 },
  kv: { fontSize: 22, fontWeight: '800', color: '#111827' },
  kl: { fontSize: 11, color: '#9ca3af' },
  ordersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  ordersEmoji: { fontSize: 22 },
  ordersLabel: { flex: 1, fontSize: 14, fontWeight: '700', color: '#111827' },
  ordersBadge: {
    fontSize: 12,
    fontWeight: '800',
    color: '#fff',
    backgroundColor: '#7c3aed',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  ordersArrow: { fontSize: 20, color: '#9ca3af' },
  inboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  inboxEmoji: { fontSize: 22 },
  inboxLabel: { flex: 1, fontSize: 14, fontWeight: '700', color: '#111827' },
  inboxBadge: {
    fontSize: 12,
    fontWeight: '800',
    color: '#fff',
    backgroundColor: '#7c3aed',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  inboxArrow: { fontSize: 20, color: '#9ca3af' },
  earningsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  earningsEmoji: { fontSize: 22 },
  earningsLabel: { flex: 1, fontSize: 14, fontWeight: '700', color: '#111827' },
  earningsArrow: { fontSize: 20, color: '#9ca3af' },
  socialsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  socialsEmoji: { fontSize: 22 },
  socialsLabel: { flex: 1, fontSize: 14, fontWeight: '700', color: '#111827' },
  socialsArrow: { fontSize: 20, color: '#9ca3af' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  em: { fontSize: 28 },
  nm: { fontSize: 14, fontWeight: '600', color: '#111827' },
  meta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  del: { fontSize: 18 },
});
