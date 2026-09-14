import { describe, it, expect } from 'vitest';
import { tFrom, webMessages, mobileMessages, sharedMessages } from '@galaxy/shared';

// §2d regression: the single merged catalog let mobile values silently
// override web values (38 AR collisions). Each platform must resolve its
// own catalog, and the three known param-name mismatches must interpolate
// on BOTH platforms without raw placeholders.

type Catalog = Record<string, { ar: string; en: string }>;
const webCat = webMessages as Catalog;
const mobCat = mobileMessages as Catalog;

const noRawPlaceholders = (s: string): boolean => !/\{\w+\}/.test(s);

describe('i18n per-platform catalogs (§2d)', () => {
  it('web and mobile resolve their own values on conflicting keys', () => {
    const conflicts = Object.keys(mobCat).filter((k) => {
      const w = webCat[k];
      return w && w.ar !== mobCat[k]!.ar;
    });
    // Guard the architecture: the collision set still exists but must not
    // leak across platforms.
    expect(conflicts.length).toBeGreaterThan(0);
    for (const key of conflicts.slice(0, 10)) {
      expect(tFrom(webCat, key as never, 'ar')).toBe(webCat[key]!.ar);
      expect(tFrom(mobCat, key as never, 'ar')).toBe(mobCat[key]!.ar);
    }
  });

  it('beautyBingo.completed interpolates on both platforms', () => {
    expect(tFrom(webCat, 'beautyBingo.completed', 'ar', { completed: 3, total: 9 })).toContain('3');
    expect(
      noRawPlaceholders(tFrom(webCat, 'beautyBingo.completed', 'ar', { completed: 3, total: 9 })),
    ).toBe(true);
    expect(
      noRawPlaceholders(tFrom(mobCat, 'beautyBingo.completed', 'ar', { done: 3, total: 9 })),
    ).toBe(true);
  });

  it('beautyCourses.lessons interpolates on both platforms', () => {
    expect(noRawPlaceholders(tFrom(webCat, 'beautyCourses.lessons', 'ar', { count: 12 }))).toBe(
      true,
    );
    expect(noRawPlaceholders(tFrom(mobCat, 'beautyCourses.lessons', 'ar', { lessons: 12 }))).toBe(
      true,
    );
  });

  it('beautyGoals.progress interpolates on both platforms', () => {
    expect(
      noRawPlaceholders(
        tFrom(webCat, 'beautyGoals.progress', 'ar', { done: 2, total: 5, pct: 40 }),
      ),
    ).toBe(true);
    expect(
      noRawPlaceholders(tFrom(mobCat, 'beautyGoals.progress', 'ar', { target: 5, pct: 40 })),
    ).toBe(true);
  });

  it('every mobile key exists in the shared union', () => {
    for (const key of Object.keys(mobCat)) {
      expect(sharedMessages[key as keyof typeof sharedMessages]).toBeDefined();
    }
  });
});
