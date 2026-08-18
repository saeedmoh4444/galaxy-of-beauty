'use client';

/**
 * Salon Amenities — shows what each salon offers for women's comfort.
 * From Phase W9: Thoughtful Touches.
 *
 * Usage:
 *   <SalonAmenities amenities={['prayer_room', 'period_kit', 'child_friendly']} />
 */

const AMENITIES: Record<string, { emoji: string; label: { ar: string; en: string } }> = {
  prayer_room: { emoji: '', label: { ar: 'غرفة صلاة', en: 'Prayer room' } },
  period_kit: { emoji: '🩸', label: { ar: 'أدوات الدورة الشهرية', en: 'Period kit' } },
  child_friendly: { emoji: '', label: { ar: 'مناسب للأطفال', en: 'Child friendly' } },
  phone_charger: { emoji: '', label: { ar: 'شاحن جوال', en: 'Phone charger' } },
  wifi: { emoji: '', label: { ar: 'واي فاي مجاني', en: 'Free Wi-Fi' } },
  coffee_tea: { emoji: '', label: { ar: 'مشروبات ساخنة', en: 'Hot drinks' } },
  wheelchair: { emoji: '', label: { ar: 'مناسب لذوي الاحتياجات', en: 'Wheelchair accessible' } },
  private_room: { emoji: '', label: { ar: 'غرفة خاصة', en: 'Private room' } },
  parking: { emoji: '🅿️', label: { ar: 'مواقف سيارات', en: 'Parking' } },
  luxury_robe: { emoji: '', label: { ar: 'روب فاخر', en: 'Luxury robe' } },
  makeup_touchup: { emoji: '', label: { ar: 'تعديل مكياج مجاني', en: 'Free makeup touch-up' } },
  sensory_friendly: { emoji: '', label: { ar: 'مناسب للحساسية الحسية', en: 'Sensory friendly' } },
};

interface SalonAmenitiesProps {
  amenities: string[];
  className?: string;
  /** Display locale for amenity labels */
  locale?: 'ar' | 'en';
}

export function SalonAmenities({
  amenities,
  className = '',
  locale = 'ar',
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
            title={a.label[locale]}
          >
            {a.emoji} {a.label[locale]}
          </span>
        );
      })}
    </div>
  );
}
