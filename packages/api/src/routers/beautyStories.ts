import { customerProcedure, publicProcedure, router } from '../trpc';

const STORIES = [
  {
    id: 1,
    technicianName: 'نورة العمري',
    imageUrl: '',
    emoji: '',
    title: 'تحضيرات مكياج عروس',
    postedAt: 'قبل ٣٠ دقيقة',
    viewers: 125,
  },
  {
    id: 2,
    technicianName: 'سارة الحربي',
    imageUrl: '',
    emoji: '‍️',
    title: 'تسريحة جديدة ',
    postedAt: 'قبل ساعة',
    viewers: 89,
  },
  {
    id: 3,
    technicianName: 'د. ليلى القحطاني',
    imageUrl: '',
    emoji: '',
    title: 'منتجات العناية المفضلة',
    postedAt: 'قبل ساعتين',
    viewers: 210,
  },
  {
    id: 4,
    technicianName: 'هند المطيري',
    imageUrl: '',
    emoji: '',
    title: 'ألوان صيف ٢٠٢٦',
    postedAt: 'قبل ٣ ساعات',
    viewers: 67,
  },
];

export const beautyStoriesRouter = router({
  feed: publicProcedure.query(() => STORIES),
  view: customerProcedure.mutation(async () => ({ viewed: true })),
});
