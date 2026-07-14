/**
 * Saudi Arabia Cities & Regions Data
 *
 * Used for:
 *   - Technician profile city selection
 *   - Customer address autocomplete
 *   - Search/filter by city
 *   - Location-based recommendations
 *
 * Covers all 13 administrative regions with major cities.
 */

export const SAUDI_REGIONS = [
  {
    nameAr: 'منطقة الرياض',
    nameEn: 'Riyadh Region',
    cities: [
      { nameAr: 'الرياض', nameEn: 'Riyadh', areas: ['العليا', 'النرجس', 'الياسمين', 'الملقا', 'الربيع', 'الازدهار', 'المروج', 'الشفا', 'السليمانية', 'الروضة', 'قرطبة', 'القدس', 'النسيم', 'اليرموك'] },
      { nameAr: 'الخرج', nameEn: 'Al Kharj', areas: ['وسط المدينة', 'المنصورة', 'النهضة'] },
      { nameAr: 'الدرعية', nameEn: 'Diriyah', areas: ['البجيري', 'الطريف'] },
      { nameAr: 'المجمعة', nameEn: 'Al Majmaah', areas: ['وسط المدينة'] },
    ],
  },
  {
    nameAr: 'منطقة مكة المكرمة',
    nameEn: 'Makkah Region',
    cities: [
      { nameAr: 'جدة', nameEn: 'Jeddah', areas: ['الروضة', 'السلامة', 'الحمراء', 'الشاطئ', 'الزهراء', 'المروة', 'البساتين', 'النعيم', 'الصفا', 'الرحاب', 'الأندلس', 'الخالدية'] },
      { nameAr: 'مكة المكرمة', nameEn: 'Makkah', areas: ['العزيزية', 'الشرائع', 'العوالي', 'النسيم'] },
      { nameAr: 'الطائف', nameEn: 'Taif', areas: ['شهار', 'الوسام', 'الحوية', 'السلامة'] },
    ],
  },
  {
    nameAr: 'المنطقة الشرقية',
    nameEn: 'Eastern Region',
    cities: [
      { nameAr: 'الدمام', nameEn: 'Dammam', areas: ['الشاطئ', 'الفيصلية', 'الروضة', 'النزهة', 'الشرقية', 'الخالدية', 'الندى'] },
      { nameAr: 'الخبر', nameEn: 'Al Khobar', areas: ['العقربية', 'الخبر الشمالية', 'الكورنيش', 'الراكة'] },
      { nameAr: 'الأحساء', nameEn: 'Al Ahsa', areas: ['الهفوف', 'المبرز'] },
      { nameAr: 'الجبيل', nameEn: 'Jubail', areas: ['الجبيل البلد', 'الجبيل الصناعية'] },
      { nameAr: 'القطيف', nameEn: 'Al Qatif', areas: ['وسط المدينة', 'تاروت'] },
    ],
  },
  {
    nameAr: 'منطقة المدينة المنورة',
    nameEn: 'Madinah Region',
    cities: [
      { nameAr: 'المدينة المنورة', nameEn: 'Madinah', areas: ['القبلتين', 'العزيزية', 'السلام', 'العوالي'] },
      { nameAr: 'ينبع', nameEn: 'Yanbu', areas: ['ينبع البحر', 'ينبع الصناعية'] },
    ],
  },
  {
    nameAr: 'منطقة القصيم',
    nameEn: 'Qassim Region',
    cities: [
      { nameAr: 'بريدة', nameEn: 'Buraydah', areas: ['وسط المدينة', 'الربيع', 'الريان'] },
      { nameAr: 'عنيزة', nameEn: 'Unaizah', areas: ['وسط المدينة', 'البديعة'] },
    ],
  },
  {
    nameAr: 'منطقة عسير',
    nameEn: 'Asir Region',
    cities: [
      { nameAr: 'أبها', nameEn: 'Abha', areas: ['وسط المدينة', 'النسيم', 'المطار'] },
      { nameAr: 'خميس مشيط', nameEn: 'Khamis Mushait', areas: ['وسط المدينة', 'الضباب'] },
    ],
  },
  {
    nameAr: 'منطقة تبوك',
    nameEn: 'Tabuk Region',
    cities: [
      { nameAr: 'تبوك', nameEn: 'Tabuk', areas: ['وسط المدينة', 'الورود', 'الروضة'] },
    ],
  },
  {
    nameAr: 'منطقة حائل',
    nameEn: 'Hail Region',
    cities: [
      { nameAr: 'حائل', nameEn: 'Hail', areas: ['وسط المدينة', 'الجامعيين'] },
    ],
  },
  {
    nameAr: 'منطقة الحدود الشمالية',
    nameEn: 'Northern Borders',
    cities: [
      { nameAr: 'عرعر', nameEn: 'Arar', areas: ['وسط المدينة'] },
    ],
  },
  {
    nameAr: 'منطقة جازان',
    nameEn: 'Jazan Region',
    cities: [
      { nameAr: 'جازان', nameEn: 'Jazan', areas: ['وسط المدينة', 'الكورنيش'] },
    ],
  },
  {
    nameAr: 'منطقة نجران',
    nameEn: 'Najran Region',
    cities: [
      { nameAr: 'نجران', nameEn: 'Najran', areas: ['وسط المدينة'] },
    ],
  },
  {
    nameAr: 'منطقة الباحة',
    nameEn: 'Al Bahah Region',
    cities: [
      { nameAr: 'الباحة', nameEn: 'Al Bahah', areas: ['وسط المدينة'] },
    ],
  },
  {
    nameAr: 'منطقة الجوف',
    nameEn: 'Al Jouf Region',
    cities: [
      { nameAr: 'سكاكا', nameEn: 'Sakaka', areas: ['وسط المدينة'] },
    ],
  },
];

/**
 * Get flat list of all cities (for dropdowns, autocomplete).
 */
export function getAllCities() {
  const cities = [];
  for (const region of SAUDI_REGIONS) {
    for (const city of region.cities) {
      cities.push({
        nameAr: city.nameAr,
        nameEn: city.nameEn,
        regionAr: region.nameAr,
        regionEn: region.nameEn,
        areas: city.areas,
      });
    }
  }
  return cities;
}

/**
 * Get cities by region name.
 */
export function getCitiesByRegion(regionNameAr) {
  const region = SAUDI_REGIONS.find((r) => r.nameAr === regionNameAr);
  return region?.cities || [];
}

/**
 * Get areas for a specific city.
 */
export function getAreasByCity(cityNameAr) {
  for (const region of SAUDI_REGIONS) {
    const city = region.cities.find((c) => c.nameAr === cityNameAr);
    if (city) return city.areas;
  }
  return [];
}

/**
 * Search cities by name (Arabic or English).
 */
export function searchCities(query) {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  const results = [];
  for (const region of SAUDI_REGIONS) {
    for (const city of region.cities) {
      if (city.nameAr.includes(query) || city.nameEn.toLowerCase().includes(q)) {
        results.push({ ...city, regionAr: region.nameAr, regionEn: region.nameEn });
      }
    }
  }
  return results.slice(0, 20);
}

export default { SAUDI_REGIONS, getAllCities, getCitiesByRegion, getAreasByCity, searchCities };
