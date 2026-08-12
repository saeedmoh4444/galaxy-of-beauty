import { publicProcedure, router } from '../trpc';

const TRENDS = [
  { month: 'يناير', makeup: 45, skincare: 60, hair: 35, nails: 30, massage: 25 },
  { month: 'فبراير', makeup: 50, skincare: 55, hair: 40, nails: 28, massage: 22 },
  { month: 'مارس', makeup: 55, skincare: 65, hair: 38, nails: 35, massage: 28 },
  { month: 'أبريل', makeup: 60, skincare: 70, hair: 45, nails: 40, massage: 30 },
  { month: 'مايو', makeup: 70, skincare: 75, hair: 50, nails: 45, massage: 35 },
  { month: 'يونيو', makeup: 80, skincare: 80, hair: 55, nails: 50, massage: 40 },
  { month: 'يوليو', makeup: 85, skincare: 78, hair: 60, nails: 55, massage: 45 },
];

const TOP_THIS_MONTH = [
  { rank: 1, nameAr: 'مكياج عرايس', emoji: '', growth: '+٢٥٪' },
  { rank: 2, nameAr: 'تنظيف بشرة عميق', emoji: '', growth: '+١٨٪' },
  { rank: 3, nameAr: 'مساج استرخائي', emoji: '‍️', growth: '+١٥٪' },
  { rank: 4, nameAr: 'مانيكير جل', emoji: '', growth: '+١٢٪' },
  { rank: 5, nameAr: 'صبغة شعر', emoji: '‍️', growth: '+١٠٪' },
];

export const serviceTrendsRouter = router({
  trends: publicProcedure.query(() => ({
    monthly: TRENDS,
    top: TOP_THIS_MONTH,
    categories: ['makeup', 'skincare', 'hair', 'nails', 'massage'],
  })),
});
