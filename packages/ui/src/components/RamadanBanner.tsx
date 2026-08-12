'use client';

import { getSaudiSeason } from '@galaxy/shared';

/**
 * Ramadan/Eid themed banner — shows during Islamic seasons.
 *
 * Usage:
 *   <RamadanBanner />
 */

export function RamadanBanner(): JSX.Element | null {
  const season = getSaudiSeason();

  if (!season.seasonLabel) return null;

  const isEid = season.isEidAlFitr || season.isEidAlAdha;
  const bg = isEid ? 'from-amber-500 to-orange-600' : 'from-indigo-700 to-purple-800';

  return (
    <div className={`bg-gradient-to-r ${bg} px-4 py-3 text-center text-white`}>
      <span className="text-lg">{season.seasonEmoji}</span>
      <span className="mx-2 text-sm font-semibold">{season.seasonLabel}</span>
      {season.isRamadan ? (
        <span className="block text-xs text-white/70">
          أوقات العمل: ١٠ صباحاً — ٤ مساءً و ٩ مساءً — ٢ صباحاً
        </span>
      ) : null}
      {isEid ? (
        <span className="block text-xs text-white/70">
          🎉 خصم خاص بمناسبة العيد — استخدمي كود EID20
        </span>
      ) : null}
    </div>
  );
}
