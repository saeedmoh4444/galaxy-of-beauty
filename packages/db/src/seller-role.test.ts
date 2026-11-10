import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * R1 (SELLER_FIRST_CLASS_ROLE_PLAN) — schema contract for the SELLER role.
 *
 * File-level contract (no DB connection needed): the UserRole enum gains
 * SELLER, and the migration is split into TWO files because PostgreSQL
 * forbids using an enum value added by ALTER TYPE in the SAME transaction
 * as the ALTER — the backfill UPDATE must live in its own transaction.
 */

const DIR = fileURLToPath(new URL('.', import.meta.url));
const SCHEMA_PATH = join(DIR, '../prisma/schema.prisma');
const MIGRATIONS_PATH = join(DIR, '../prisma/migrations');

describe('SELLER role schema contract (R1)', () => {
  it('adds SELLER to the UserRole enum in schema.prisma', () => {
    const schema = readFileSync(SCHEMA_PATH, 'utf8');
    const enumBlock = schema.match(/enum UserRole \{([^}]*)\}/);
    expect(enumBlock, 'UserRole enum missing from schema.prisma').not.toBeNull();
    const values = (enumBlock?.[1] ?? '')
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    expect(values).toContain('SELLER');
    // The existing roles stay intact.
    for (const legacy of ['CUSTOMER', 'TECHNICIAN', 'ADMIN']) {
      expect(values, `lost role ${legacy}`).toContain(legacy);
    }
  });

  it('splits the migration: ALTER TYPE in its own file, backfill in a second transaction', () => {
    const enumMigration = join(MIGRATIONS_PATH, '20261110000000_seller_role_enum', 'migration.sql');
    const backfillMigration = join(
      MIGRATIONS_PATH,
      '20261110000100_seller_role_backfill',
      'migration.sql',
    );
    expect(existsSync(enumMigration), 'enum migration missing').toBe(true);
    expect(existsSync(backfillMigration), 'backfill migration missing').toBe(true);

    const alterSql = readFileSync(enumMigration, 'utf8');
    expect(alterSql).toContain('ALTER TYPE "UserRole" ADD VALUE \'SELLER\'');

    const backfillSql = readFileSync(backfillMigration, 'utf8');
    // Every existing store owner becomes SELLER (users with a Vendor row).
    expect(backfillSql).toContain('UPDATE "users"');
    expect(backfillSql).toContain("SET role = 'SELLER'");
    expect(backfillSql).toContain('SELECT "userId" FROM "vendors"');
  });
});
