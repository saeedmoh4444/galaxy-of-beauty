'use client';

/**
 * Salon Amenities — shows what each salon offers for women's comfort.
 * From Phase W9: Thoughtful Touches.
 *
 * Usage:
 *   <SalonAmenities amenities={['prayer_room', 'period_kit', 'child_friendly']} />
 */

const AMENITIES: Record<string, { emoji: string; label: string }> = {
  prayer_room: { emoji: '', label: 'غرفة صلاة' },
  period_kit: { emoji: '🩸', label: 'أدوات الدورة الشهرية' },
  child_friendly: { emoji: '', label: 'مناسب للأطفال' },
  phone_charger: { emoji: '', label: 'شاحن جوال' },
  wifi: { emoji: '', label: 'واي فاي مجاني' },
  coffee_tea: { emoji: '', label: 'مشروبات ساخنة' },
  wheelchair: { emoji: '', label: 'مناسب لذوي الاحتياجات' },
  private_room: { emoji: '', label: 'غرفة خاصة' },
  parking: { emoji: '🅿️', label: 'مواقف سيارات' },
  luxury_robe: { emoji: '', label: 'روب فاخر' },
  makeup_touchup: { emoji: '', label: 'تعديل مكياج مجاني' },
  sensory_friendly: { emoji: '', label: 'مناسب للحساسية الحسية' },
};

interface SalonAmenitiesProps {
  amenities: string[];
  className?: string;
}

export function SalonAmenities({
  amenities,
  className = '',
}: SalonAmenitiesProps): JSX.Element | null {
  if (!amenities.length) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {amenities.map((key) => {
        const a = AMENITIES[key];
        if (!a) return null;
        return (
          <span
            key={key}
            className="inline-flex items-center gap-1 rounded-full bg-pink-50 px-2.5 py-1 text-xs font-medium text-pink-700 dark:bg-pink-950 dark:text-pink-300"
            title={a.label}
          >
            {a.emoji} {a.label}
          </span>
        );
      })}
    </div>
  );
}
