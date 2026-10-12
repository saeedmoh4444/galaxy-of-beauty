/**
 * Vendor portal contracts (A2) — single source of truth derived from the
 * vendorPortal router itself, so web and mobile can drop their ad-hoc
 * `Record<string, unknown>` casts without hand-written interfaces drifting
 * from the serializers.
 *
 * NOTE: Decimal columns arrive at the client as strings (superjson falls
 * back to toJSON for Prisma Decimal) — wrap with Number() at render sites.
 */
import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '../routers';

export type RouterOutputs = inferRouterOutputs<AppRouter>;
export type VendorPortalOutputs = RouterOutputs['vendorPortal'];

/** The caller's Vendor row — null when they have not registered a venue. */
export type MyStore = VendorPortalOutputs['myStore'];

/** Aggregated store KPIs (zeros for non-owners). */
export type VendorDashboard = VendorPortalOutputs['dashboard'];

/** toPortalProduct shape — the product rows the portal UIs render. */
export type PortalProduct = VendorPortalOutputs['myProducts'][number];

/** A store order with its customer summary. */
export type StoreOrderRow = VendorPortalOutputs['orders'][number];

/** A store_promotion provider submission (My Deals). */
export type StoreDealRow = VendorPortalOutputs['myDeals'][number];

/** The known shape of a store_promotion submission payload (JSON column —
 *  narrow once per row instead of casting every field). */
export type StoreDealPayload = {
  productId: number;
  vendorId: number;
  titleAr: string;
  originalPrice: number;
  dealPrice: number;
  startsAt: string;
  endsAt: string;
};

/** A store payout statement row (Earnings). */
export type PayoutRow = VendorPortalOutputs['earnings'][number];

/** Vertical dashboards — clinic (flat procedures with dotted names). */
export type ClinicSlot = VendorPortalOutputs['clinicSlots.list'][number];
export type ClinicConsultation = VendorPortalOutputs['clinicConsultations'][number];

/** Vertical dashboards — gym. */
export type GymClass = VendorPortalOutputs['gymClasses.list'][number];
export type GymClassBooking = VendorPortalOutputs['gymClassBookings'][number];

/** Vertical dashboards — nail bar. */
export type NailBarSlot = VendorPortalOutputs['nailBarSlots.list'][number];
export type NailBarBooking = VendorPortalOutputs['nailBarBookings'][number];

/** Vertical dashboards — at-home salon. */
export type HomeRequest = VendorPortalOutputs['homeRequests.list'][number];
