/**
 * Service detail trust layer — pure computation shared by the web
 * ServiceDetailClient and the React Native service-detail mirror
 * (Phase 3 sprint 2 parity). i18n stays at the call site via `labels`.
 */

export type TrustItemVariant = 'safeSpace' | 'womenOnly' | 'private' | 'verified' | 'rating';

export interface ServiceTrustItem {
  variant: TrustItemVariant;
  label: string;
  value?: string;
}

export interface ServiceTrustInput {
  isWomenOnlyStaff: boolean;
  isPrivateSuite: boolean;
  isPregnancySafe: boolean;
  isMommyFriendly: boolean;
  technicians: Array<{ kycStatus?: string | null; ratingAvg?: unknown }>;
  labels: {
    safeSpace: string;
    womenOnly: string;
    privateSuite: string;
    verified: string;
    rating: string;
    pregnancySafe: string;
    mommyFriendly: string;
  };
}

export interface ServiceTrustResult {
  items: ServiceTrustItem[];
  stageChips: string[];
}

export function buildServiceTrust(input: ServiceTrustInput): ServiceTrustResult {
  const verifiedTechCount = input.technicians.filter((t) => t.kycStatus === 'VERIFIED').length;
  const bestRating = input.technicians.reduce(
    (max, t) => Math.max(max, Number(t.ratingAvg ?? 0)),
    0,
  );

  const items: ServiceTrustItem[] = [
    { variant: 'safeSpace', label: input.labels.safeSpace },
    ...(input.isWomenOnlyStaff
      ? [{ variant: 'womenOnly' as const, label: input.labels.womenOnly }]
      : []),
    ...(input.isPrivateSuite
      ? [{ variant: 'private' as const, label: input.labels.privateSuite }]
      : []),
    ...(verifiedTechCount > 0
      ? [{ variant: 'verified' as const, label: input.labels.verified }]
      : []),
    ...(input.technicians.length > 0
      ? [{ variant: 'rating' as const, label: input.labels.rating, value: bestRating.toFixed(1) }]
      : []),
  ];

  const stageChips = [
    ...(input.isPregnancySafe ? [input.labels.pregnancySafe] : []),
    ...(input.isMommyFriendly ? [input.labels.mommyFriendly] : []),
  ];

  return { items, stageChips };
}
