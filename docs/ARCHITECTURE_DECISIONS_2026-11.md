# Architecture Decisions — November 2026 Build-Out

> ADR-style log of the decisions made while closing the audit gaps (W1–W4 waves,
> seller program, imagery program). Each entry: context → decision → consequences.
> Companion: `brain_code.md` (the architecture) + `Rules_to_make_well_archtichtrue-platform.md` (the rules).

| #   | Date       | Decision                                                                                                                                                                                                                                   | Status                             |
| --- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------- |
| 1   | 2026-11-12 | **Money-integrity first (W1)**: races closed in-transaction (complete/refund/approve/cashback), all client errors are 4xx TRPCErrors, reconciliation pages + queue registry + graceful shutdown                                            | ✅ shipped                         |
| 2   | 2026-11-12 | **Whole-catalog bookability (W2)**: round-robin seed mapping + technician↔service guards on every book path + booking→payment→confirm completion + flash-deal totals                                                                       | ✅ shipped                         |
| 3   | 2026-11-15 | **Cross-process socket emits (W3-1)**: emit helpers fall back to a broadcast-only Socket.IO Server sharing the Redis adapter when no local server exists — exactly-once per client, no custom pub/sub channel                              | ✅ shipped                         |
| 4   | 2026-11-15 | **Seller lane adopted (W3-2)**: payouts.requestPayout/listMyRequests → sellerProcedure/sellerMutation (safe: the R1 backfill made every vendor owner SELLER)                                                                               | ✅ shipped                         |
| 5   | 2026-11-15 | **ensureVendor approval gate (W3-2)**: auto-created stores start INACTIVE + file a PENDING_REVIEW ProviderSubmission; approve ACTIVATES (was: pending stores could never activate), public product surfaces filter `vendor.isActive`       | ✅ shipped                         |
| 6   | 2026-11-15 | **Women-only gate, option 1 (W3-5)**: self-declared `User.gender` (default female) + womenOnlyGuard middleware on womens/kids book (live row read — gender is not in the JWT). Option 2 (verified-female KYC) is the tracked upgrade pass. | ✅ shipped (option 1); 🔜 option 2 |
| 7   | 2026-11-15 | **Imagery fallback chain (I1)**: `resolveEntityImage` (entity → category default → kind default → brand) in @galaxy/shared; the AI starter library plugs in as manifest-only content                                                       | ✅ shipped                         |
| 8   | 2026-11-15 | **Biometric login for real (W3-4)**: device auth → stored refresh token → auth.refresh → session + role routing. Token stays in AsyncStorage for now — expo-secure-store is the hardening follow-up                                        | ✅ shipped (hardening 🔜)          |
| 9   | 2026-11-15 | **No fabricated analytics (W4-1)**: pro-tools page wired to real data (myStats extensions, dynamic-pricing engine suggestion, real fees as the expense line); SheLeadsProgramCard removed (no real program data — fail closed)             | ✅ in CI                           |
| 10  | 2026-11-15 | **Mobile vendor-portal guard (W3-3)**: stricter than web on purpose (web hosts the registration wizard, mobile is a vendor-management surface)                                                                                             | ✅ shipped                         |

## Open decisions (need the boss)

- **AI generator account** for the imagery starter library (Midjourney / Flux / Replicate)
- **AWS console**: S3 bucket + CloudFront (imagery I3/I6)
- **Verified-female KYC depth** (option 2): ID upload → provider review, vendor-license pattern
- **Fatoorah live token / Sentry DSNs / pentest execution** — the standing user-gated list
