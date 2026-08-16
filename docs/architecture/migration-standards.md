# Migration Standards — DATA-006

**Adopted**: 2026-08-11
**Applies to**: All Prisma migrations in `packages/db/prisma/migrations/`

## Naming Convention

```
<YYYYMMDDHHMMSS>_<verb>_<entity>.sql

Examples:
  20260811120000_add_family_id_to_refresh_tokens.sql
  20260811120100_drop_redundant_indexes.sql
  20260811120200_add_check_constraints.sql
```

## Required Migration Template

Every migration file MUST include a comment header:

```sql
-- Migration: <one-line summary>
-- Author: <name>
-- Lock duration: <estimate> (e.g., <1s on 10k rows)
-- Data rewrite: <yes/no — if yes, describe>
-- Rollback: <SQL to undo this migration>
-- Compatibility: <any breaking changes to note>
```

## Rules

1. **Backward-compatible first.** Use expand/migrate/contract pattern:
   - **Expand**: Add new columns/tables (safe, no lock)
   - **Migrate**: Backfill data, add NOT NULL after data exists
   - **Contract**: Drop old columns/tables after deploy verified

2. **No `prisma db push` in production.** Use versioned migrations only. `db push` is for local prototyping.

3. **Index before query.** When adding a new query pattern, add the supporting index in the SAME migration.

4. **Validate constraints.** Before adding NOT NULL or CHECK constraints, verify existing data satisfies them:

   ```sql
   -- Validate before adding constraint
   SELECT count(*) FROM bookings WHERE total_amount < 0;
   -- If 0, safe to add: ALTER TABLE bookings ADD CONSTRAINT ...
   ```

5. **Test forward AND rollback.** Every migration PR must include evidence that both `migrate deploy` and manual rollback work against a sanitized production snapshot.

6. **No data loss in migration.** Deletes and destructive changes go in a separate "contract" migration deployed at least one release after the "expand" step.

## Redundant Index Cleanup — August 2026

Found 12 redundant single-column indexes that duplicate `@unique` constraints. In PostgreSQL, `@unique` automatically creates a unique B-tree index. An additional `@@index` on the same column is wasted storage and write overhead.

| Column          | @unique model                              | Redundant @@index model         | Action                                           |
| --------------- | ------------------------------------------ | ------------------------------- | ------------------------------------------------ |
| `token`         | RefreshToken, ResetToken, EmailVerifyToken | Various                         | Drop @@index                                     |
| `bookingCode`   | Booking                                    | Booking                         | Drop @@index                                     |
| `code`          | PromoCode, GiftCard                        | PromoCode, GiftCard             | Drop @@index                                     |
| `slug`          | Category, BlogPost, VendorStore            | Category, BlogPost, VendorStore | Drop @@index                                     |
| `referralCode`  | Referral                                   | Referral                        | Drop @@index                                     |
| `phone`         | User                                       | User                            | Drop @@index                                     |
| `invoiceNumber` | Payment                                    | Payment                         | Drop @@index                                     |
| `bookingId`     | Various                                    | Various                         | Drop @@index                                     |
| `roomId`        | VideoSession                               | VideoSession                    | Drop @@index                                     |
| `storeSlug`     | VendorStore                                | VendorStore                     | Drop @@index                                     |
| `userId`        | Various                                    | Various                         | Drop @@index (on models where userId is @unique) |
| `customerId`    | Various                                    | Various                         | Verify before dropping (may be composite)        |

## Missing Database Constraints — August 2026

These should be added in a follow-up migration after data validation:

| Table                 | Constraint          | SQL                                                                                                 |
| --------------------- | ------------------- | --------------------------------------------------------------------------------------------------- |
| `users`               | Language enum       | `CONSTRAINT chk_language CHECK (preferred_language IN ('ar', 'en'))`                                |
| `bookings`            | Non-negative amount | `CONSTRAINT chk_total_amount CHECK (total_amount >= 0)`                                             |
| `bookings`            | Non-negative fee    | `CONSTRAINT chk_platform_fee CHECK (platform_fee >= 0)`                                             |
| `reviews`             | Valid rating        | `CONSTRAINT chk_rating CHECK (rating >= 1 AND rating <= 5)`                                         |
| `payments`            | Non-negative amount | `CONSTRAINT chk_amount CHECK (amount >= 0)`                                                         |
| `wallet_transactions` | Non-negative amount | `CONSTRAINT chk_amount CHECK (amount >= 0)`                                                         |
| `loyalty_tiers`       | Valid discount      | `CONSTRAINT chk_discount CHECK (discount_percent >= 0 AND discount_percent <= 100)`                 |
| `notifications`       | Valid channel       | `CONSTRAINT chk_channel CHECK (channel IN ('push', 'email', 'sms', 'in_app'))`                      |
| `notifications`       | Valid type          | `CONSTRAINT chk_type CHECK (type IN ('booking', 'payment', 'reminder', 'promo', 'system', 'chat'))` |
