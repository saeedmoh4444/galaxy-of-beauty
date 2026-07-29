import { publicProcedure, router } from '../trpc';

const VIDEOS = [
  { id: 1, title: 'تحضيرات مكياج عروس', technicianName: 'نورة العمري', duration: '٨:٣٢', category: 'makeup', thumbnail: '', views: 3200, emoji: '👰' },
  { id: 2, title: 'تنظيف أدوات المكياج', technicianName: 'نورة العمري', duration: '٥:١٥', category: 'makeup', thumbnail: '', views: 1800, emoji: '🧹' },
  { id: 3, title: 'جولة في صالوني', technicianName: 'سارة الحربي', duration: '١٢:٤٥', category: 'salon', thumbnail: '', views: 4500, emoji: '🏠' },
  { id: 4, title: 'فتح علبة منتجات جديدة', technicianName: 'هند المطيري', duration: '٦:٢٠', category: 'unboxing', thumbnail: '', views: 2100, emoji: '📦' },
  { id: 5, title: 'رحلة شراء مستلزمات التجميل', technicianName: 'د. ليلى القحطاني', duration: '١٠:١٠', category: 'shopping', thumbnail: '', views: 2800, emoji: '🛍️' },
];

export const behindScenesRouter = router({
  feed: publicProcedure.query(() => VIDEOS),
});
