import type { JSX } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Share,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { SkeletonList } from '@/components/SkeletonCard';
import { ErrorAlert } from '@/components/ErrorAlert';
import { Icon, type IconName } from '@/components/Icon';
import { ServiceImage } from '@/components/ServiceImage';
import { trpc } from '@/lib/trpc-react';
import { buildServiceTrust, localize, serviceKeyFromCategorySlug } from '@galaxy/shared';
import { useLocale } from '@/components/LocaleProvider';
import { useToast } from '@/components/Toast';
import { copyText } from '@/utils/clipboard';

type ServiceJson = { ar?: string; en?: string };

interface ServiceDetail {
  id: number;
  emoji?: string;
  titleJson?: ServiceJson;
  descriptionJson?: ServiceJson | null;
  basePrice?: number;
  durationMin?: number;
  imageUrl?: string | null;
  isWomenOnlyStaff?: boolean;
  isPrivateSuite?: boolean;
  isPregnancySafe?: boolean;
  isMommyFriendly?: boolean;
  isHourly?: boolean;
  category?: { slug?: string | null; nameAr?: string | null };
  variants?: Array<{ id: number; nameJson?: ServiceJson | null; priceDelta?: number }>;
  technicianServices?: Array<{
    id: number;
    technician?: {
      user?: { id?: number; name?: string | null } | null;
      kycStatus?: string | null;
      ratingAvg?: number | null;
      city?: string | null;
      bioJson?: ServiceJson | null;
    } | null;
  }>;
  tags?: Array<{ tag: { nameJson?: ServiceJson | null } }>;
}

interface RelatedItem {
  id: number;
  titleJson?: ServiceJson | null;
  basePrice?: number;
  imageUrl?: string | null;
}

interface GalleryItem {
  id: number;
  thumbnailUrl?: string | null;
  beforeImageUrl?: string | null;
  titleJson?: ServiceJson | null;
}

const VARIANT_ICON: Record<string, IconName> = {
  safeSpace: 'shield-check',
  womenOnly: 'users',
  private: 'lock',
  verified: 'check',
  rating: 'star',
};

export default function ServiceDetailScreen(): JSX.Element {
  const { locale, t } = useLocale();
  const router = useRouter();
  const { showToast } = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();
  const q = trpc.services.getById.useQuery({ id: parseInt(id, 10) });
  const data = (q.data as unknown as ServiceDetail | null) ?? null;

  const techs = data?.technicianServices ?? [];
  const galleryTechUserId = techs[0]?.technician?.user?.id;
  const galleryQ = trpc.beautyShorts.gallery.useQuery(
    { technicianUserId: galleryTechUserId ?? 0 },
    { enabled: !!galleryTechUserId },
  );
  const galleryItems = (galleryQ.data as unknown as GalleryItem[] | undefined) ?? [];

  const relatedQ = trpc.services.getRelated.useQuery(
    { serviceId: parseInt(id, 10), limit: 4 },
    { enabled: !!data?.id },
  );
  const related = (relatedQ.data as unknown as RelatedItem[] | undefined) ?? [];

  const trust = buildServiceTrust({
    isWomenOnlyStaff: Boolean(data?.isWomenOnlyStaff),
    isPrivateSuite: Boolean(data?.isPrivateSuite),
    isPregnancySafe: Boolean(data?.isPregnancySafe),
    isMommyFriendly: Boolean(data?.isMommyFriendly),
    technicians: techs.map((ts) => ({
      kycStatus: ts.technician?.kycStatus,
      ratingAvg: ts.technician?.ratingAvg,
    })),
    labels: {
      safeSpace: t('mobile.public.service-detail.trust.safeSpace'),
      womenOnly: t('mobile.public.service-detail.trust.womenOnly'),
      privateSuite: t('mobile.public.service-detail.trust.privateSuite'),
      verified: t('mobile.public.service-detail.trust.verified'),
      rating: t('mobile.public.service-detail.trust.rating'),
      pregnancySafe: t('mobile.public.service-detail.trust.pregnancySafe'),
      mommyFriendly: t('mobile.public.service-detail.trust.mommyFriendly'),
    },
  });

  if (q.isLoading) return <SkeletonList count={4} />;
  if (q.isError)
    return (
      <ErrorAlert
        message={t('mobile.public.service-detail.load-error')}
        onRetry={() => q.refetch()}
      />
    );
  if (!data)
    return (
      <View style={styles.c}>
        <Text style={styles.e}>{t('mobile.public.service-detail.not-found')}</Text>
      </View>
    );

  const title = localize(data.titleJson, locale);
  const desc = data.descriptionJson ? localize(data.descriptionJson, locale) : '';
  const variants = data.variants ?? [];
  const tags = data.tags ?? [];

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={styles.i}
      refreshControl={
        <RefreshControl
          refreshing={q.isRefetching}
          onRefresh={async () => {
            await q.refetch();
          }}
          colors={['#db2777']}
        />
      }
    >
      {/* Hero — real imagery with category-mapping fallback (web parity) */}
      <ServiceImage
        src={data.imageUrl}
        service={serviceKeyFromCategorySlug(data.category?.slug)}
        alt={title}
        height={220}
        style={styles.hero}
      />

      {/* Tags */}
      {tags.length > 0 && (
        <View style={styles.row}>
          {tags.map((tag, i) => (
            <View key={i} style={styles.tagChip}>
              <Text style={styles.tagText}>{localize(tag.tag.nameJson, locale)}</Text>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.t}>{title}</Text>
      {data.category?.nameAr ? <Text style={styles.cat}>{data.category.nameAr}</Text> : null}
      {desc ? <Text style={styles.desc}>{desc}</Text> : null}

      {/* Trust layer — shared buildServiceTrust (E6d) */}
      <View style={styles.row}>
        {trust.items.map((item) => (
          <View key={item.variant} style={styles.trustBadge}>
            <Icon name={VARIANT_ICON[item.variant] ?? 'sparkle'} size={11} color="#9d174d" />
            <Text style={styles.trustBadgeText}>
              {item.label}
              {item.value ? ` ${item.value}` : ''}
            </Text>
          </View>
        ))}
      </View>

      {/* Stage-friendly chips */}
      {trust.stageChips.length > 0 && (
        <View style={styles.row}>
          {trust.stageChips.map((chip) => (
            <View key={chip} style={styles.stageChip}>
              <Text style={styles.stageChipText}>{chip}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Share + copy link */}
      <View style={styles.shareRow}>
        <TouchableOpacity
          style={styles.shareBtn}
          onPress={() => Share.share({ title, message: `${title}` }).catch(() => undefined)}
        >
          <Text style={styles.shareText}>{t('mobile.public.service-detail.share')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.shareBtn}
          onPress={() => {
            const link = Linking.createURL(`/services/${data.id}`);
            void copyText(link).then((ok) =>
              showToast(
                ok ? 'success' : 'error',
                ok ? t('mobile.clipboard.copied') : t('mobile.clipboard.copy-failed'),
              ),
            );
          }}
        >
          <Text style={styles.shareText}>{t('mobile.public.service-detail.copy-link')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View>
          <Text style={styles.cardLabel}>{t('mobile.public.service-detail.price')}</Text>
          <Text style={styles.price}>
            {t('mobile.public.currency', { price: (data.basePrice ?? 0).toLocaleString() })}
            {data.isHourly ? ` / ${t('mobile.booking.per-hour')}` : ''}
          </Text>
        </View>
        <View>
          <Text style={styles.cardLabel}>
            {t('mobile.public.service-detail.duration', { minutes: data.durationMin ?? 0 })}
          </Text>
        </View>
      </View>

      {/* Variants */}
      {variants.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('mobile.public.service-detail.options')}</Text>
          <View style={styles.row}>
            {variants.map((v) => (
              <View key={v.id} style={styles.variantChip}>
                <Text style={styles.variantText}>
                  {localize(v.nameJson, locale)}
                  {Number(v.priceDelta) > 0
                    ? ` (+${t('mobile.public.currency', { price: Number(v.priceDelta).toLocaleString() })})`
                    : ''}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* CTA */}
      <TouchableOpacity
        testID="service-book-now"
        style={styles.cta}
        onPress={() => router.push(`/customer/bookings/create?serviceId=${data.id}`)}
      >
        <Text style={styles.ctaText}>{t('mobile.public.service-detail.book-now')}</Text>
      </TouchableOpacity>

      {/* Technicians — with verified badges (kycStatus) */}
      {techs.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('mobile.public.service-detail.available-technicians')}
          </Text>
          {techs.map((ts) => {
            const tech = ts.technician ?? {};
            const user = tech.user ?? {};
            return (
              <View key={ts.id} style={styles.techCard}>
                <View style={styles.techInfo}>
                  <View style={styles.techNameRow}>
                    <Text style={styles.techName}>{user.name}</Text>
                    {tech.kycStatus === 'VERIFIED' && (
                      <View style={styles.verifiedBadge}>
                        <Icon name="check" size={10} color="#15803d" />
                        <Text style={styles.verifiedText}>
                          {t('mobile.public.service-detail.trust.verified')}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.techMeta}>
                    {tech.city} · {Number(tech.ratingAvg ?? 0).toFixed(1)}
                  </Text>
                  {tech.bioJson ? (
                    <Text style={styles.techBio} numberOfLines={2}>
                      {localize(tech.bioJson, locale)}
                    </Text>
                  ) : null}
                </View>
                <TouchableOpacity
                  style={styles.bookBtn}
                  onPress={() => router.push(`/customer/bookings/create?serviceId=${data.id}`)}
                >
                  <Text style={styles.bookBtnText}>{t('mobile.public.service-detail.book')}</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      )}
      {techs.length === 0 && (
        <Text style={styles.noTechs}>{t('mobile.public.service-detail.no-technicians')}</Text>
      )}

      {/* E6e — before/after gallery (approved shorts of the first technician) */}
      {galleryItems.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('mobile.public.service-detail.gallery-title')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {galleryItems.slice(0, 4).map((g) => (
              <ServiceImage
                key={g.id}
                src={g.thumbnailUrl ?? g.beforeImageUrl}
                alt={localize(g.titleJson, locale)}
                height={110}
                style={styles.galleryThumb}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Related — real imagery, same mapping as hero */}
      {related.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('mobile.public.service-detail.related-services')}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {related.map((r) => (
              <TouchableOpacity
                key={r.id}
                style={styles.relatedCard}
                onPress={() => router.push(`/services/${r.id}`)}
              >
                <ServiceImage
                  src={r.imageUrl}
                  service={serviceKeyFromCategorySlug(data.category?.slug)}
                  alt={localize(r.titleJson, locale)}
                  height={90}
                  style={styles.relatedImage}
                />
                <Text style={styles.relatedTitle} numberOfLines={1}>
                  {localize(r.titleJson, locale)}
                </Text>
                <Text style={styles.relatedPrice}>
                  {t('mobile.public.currency', { price: (r.basePrice ?? 0).toLocaleString() })}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fdf2f8' },
  i: { padding: 16, paddingTop: 30, paddingBottom: 40 },
  hero: { borderRadius: 20, marginBottom: 12 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  tagChip: {
    backgroundColor: '#fce7f3',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  tagText: { fontSize: 11, color: '#be185d' },
  t: { fontSize: 22, fontWeight: '800', color: '#111827', textAlign: 'right', marginTop: 8 },
  cat: { fontSize: 13, color: '#6b7280', textAlign: 'right', marginTop: 2 },
  desc: { fontSize: 14, color: '#374151', lineHeight: 24, textAlign: 'right', marginTop: 10 },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff',
    borderColor: '#f9a8d4',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  trustBadgeText: { fontSize: 11, color: '#9d174d', fontWeight: '600' },
  stageChip: {
    backgroundColor: '#ede9fe',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  stageChipText: { fontSize: 11, color: '#6d28d9', fontWeight: '700' },
  shareRow: { flexDirection: 'row', gap: 8 },
  shareBtn: {
    alignSelf: 'flex-start',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 12,
  },
  shareText: { fontSize: 11, color: '#6b7280' },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
  },
  cardLabel: { fontSize: 12, color: '#6b7280' },
  price: { fontSize: 22, fontWeight: '800', color: '#db2777' },
  section: { marginTop: 20 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'right',
    marginBottom: 10,
  },
  variantChip: {
    backgroundColor: '#f3f4f6',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  variantText: { fontSize: 12, color: '#374151' },
  cta: {
    backgroundColor: '#db2777',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  techCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  techInfo: { flex: 1, marginRight: 10 },
  techNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'flex-end' },
  techName: { fontSize: 14, fontWeight: '700', color: '#111827' },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#dcfce7',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  verifiedText: { fontSize: 10, color: '#15803d', fontWeight: '700' },
  techMeta: { fontSize: 12, color: '#6b7280', textAlign: 'right', marginTop: 2 },
  techBio: { fontSize: 11, color: '#9ca3af', textAlign: 'right', marginTop: 4 },
  bookBtn: {
    backgroundColor: '#fce7f3',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  bookBtnText: { fontSize: 12, color: '#be185d', fontWeight: '700' },
  noTechs: { fontSize: 13, color: '#9ca3af', textAlign: 'center', marginTop: 16 },
  galleryThumb: { width: 110, borderRadius: 12, marginRight: 8 },
  relatedCard: { width: 130, marginRight: 10 },
  relatedImage: { borderRadius: 10 },
  relatedTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'right',
    marginTop: 6,
  },
  relatedPrice: {
    fontSize: 12,
    fontWeight: '800',
    color: '#db2777',
    textAlign: 'right',
    marginTop: 2,
  },
  e: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginTop: 40 },
});
