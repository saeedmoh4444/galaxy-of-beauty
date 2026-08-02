import { z } from 'zod';
import { publicProcedure, adminProcedure, router } from '../trpc';

// Curated tutorial catalog — Saudi beauty experts
const TUTORIALS = [
  {
    id: 1, titleAr: ' routine مكياج سهرة كامل', titleEn: 'Full Evening Makeup Routine',
    descAr: 'تعلمي خطوات المكياج الكامل للسهرات والمناسبات الخاصة', descEn: 'Learn complete evening makeup step by step',
    videoUrl: '', duration: '18:24',
    category: 'makeup', difficulty: 'intermediate',
    thumbnailUrl: null, tags: ['مكياج', 'سهرة', 'احترافي'],
    authorName: 'نورة العمري', authorTitleAr: 'خبيرة تجميل', authorTitleEn: 'Beauty Expert',
    views: 4520, likes: 328, isPublished: true, createdAt: '2026-06-15T10:00:00Z',
  },
  {
    id: 2, titleAr: 'تسريحة شعر للعرايس', titleEn: 'Bridal Hairstyling Tutorial',
    descAr: 'تسريحة شعر راقية ليوم الزفاف — خطوة بخطوة', descEn: 'Elegant bridal hairstyle — step by step guide',
    videoUrl: '', duration: '22:10',
    category: 'hair', difficulty: 'advanced',
    thumbnailUrl: null, tags: ['شعر', 'عرايس', 'تسريحة'],
    authorName: 'سارة الحربي', authorTitleAr: 'مصففة شعر', authorTitleEn: 'Hair Stylist',
    views: 12050, likes: 891, isPublished: true, createdAt: '2026-05-20T08:00:00Z',
  },
  {
    id: 3, titleAr: 'روتين العناية بالبشرة اليومي', titleEn: 'Daily Skincare Routine',
    descAr: 'روتين متكامل للعناية اليومية بالبشرة — تنظيف، تونر، سيروم، ومرطب', descEn: 'Complete daily skincare: cleanse, tone, serum, moisturize',
    videoUrl: '', duration: '12:45',
    category: 'skincare', difficulty: 'beginner',
    thumbnailUrl: null, tags: ['عناية', 'بشرة', 'روتين'],
    authorName: 'د. ليلى القحطاني', authorTitleAr: 'طبيبة جلدية', authorTitleEn: 'Dermatologist',
    views: 8930, likes: 654, isPublished: true, createdAt: '2026-04-10T12:00:00Z',
  },
  {
    id: 4, titleAr: 'فن رسم الحواجب', titleEn: 'Eyebrow Shaping Art',
    descAr: 'تعلمي رسم الحواجب بالشكل المثالي لوجهكِ', descEn: 'Master the art of perfect eyebrow shaping',
    videoUrl: '', duration: '9:15',
    category: 'makeup', difficulty: 'beginner',
    thumbnailUrl: null, tags: ['حواجب', 'رسم', 'مكياج'],
    authorName: 'نورة العمري', authorTitleAr: 'خبيرة تجميل', authorTitleEn: 'Beauty Expert',
    views: 6750, likes: 512, isPublished: true, createdAt: '2026-03-01T09:00:00Z',
  },
  {
    id: 5, titleAr: 'صبغات شعر طبيعية في المنزل', titleEn: 'Natural Hair Dye at Home',
    descAr: 'طرق طبيعية وآمنة لصبغ الشعر في المنزل — حناء وأعشاب', descEn: 'Safe natural hair coloring at home — henna and herbs',
    videoUrl: '', duration: '15:30',
    category: 'hair', difficulty: 'beginner',
    thumbnailUrl: null, tags: ['شعر', 'صبغة', 'طبيعي'],
    authorName: 'مريم الشمري', authorTitleAr: 'خبيرة أعشاب', authorTitleEn: 'Herbal Expert',
    views: 10200, likes: 743, isPublished: true, createdAt: '2026-02-14T11:00:00Z',
  },
  {
    id: 6, titleAr: 'مانيكير جل في المنزل', titleEn: 'Gel Manicure at Home',
    descAr: 'خطوات عمل مانيكير جل احترافي في البيت — أدوات وتقنيات', descEn: 'Professional gel manicure steps at home',
    videoUrl: '', duration: '20:05',
    category: 'nails', difficulty: 'intermediate',
    thumbnailUrl: null, tags: ['أظافر', 'مانيكير', 'جل'],
    authorName: 'هند المطيري', authorTitleAr: 'أخصائية أظافر', authorTitleEn: 'Nail Specialist',
    views: 5400, likes: 389, isPublished: true, createdAt: '2026-07-01T14:00:00Z',
  },
  {
    id: 7, titleAr: 'مكياج العيون السموكي', titleEn: 'Smokey Eye Makeup',
    descAr: 'تقنية العيون السموكي بخطوات سهلة وبسيطة', descEn: 'Easy smokey eye technique for beginners',
    videoUrl: '', duration: '11:20',
    category: 'makeup', difficulty: 'intermediate',
    thumbnailUrl: null, tags: ['عيون', 'سموكي', 'مكياج'],
    authorName: 'نورة العمري', authorTitleAr: 'خبيرة تجميل', authorTitleEn: 'Beauty Expert',
    views: 7800, likes: 601, isPublished: true, createdAt: '2026-06-22T10:00:00Z',
  },
  {
    id: 8, titleAr: 'تدليك الوجه للتخلص من التجاعيد', titleEn: 'Anti-Aging Facial Massage',
    descAr: 'تقنيات تدليك الوجه لتحسين الدورة الدموية وتقليل التجاعيد', descEn: 'Facial massage techniques for circulation and anti-aging',
    videoUrl: '', duration: '8:50',
    category: 'skincare', difficulty: 'beginner',
    thumbnailUrl: null, tags: ['وجه', 'تدليك', 'تجاعيد'],
    authorName: 'د. ليلى القحطاني', authorTitleAr: 'طبيبة جلدية', authorTitleEn: 'Dermatologist',
    views: 11200, likes: 920, isPublished: true, createdAt: '2026-05-05T08:00:00Z',
  },
];

const CATEGORIES = [
  { key: 'makeup', nameAr: 'مكياج', nameEn: 'Makeup', emoji: '💄' },
  { key: 'hair', nameAr: 'شعر', nameEn: 'Hair', emoji: '💇‍♀️' },
  { key: 'skincare', nameAr: 'عناية بالبشرة', nameEn: 'Skincare', emoji: '✨' },
  { key: 'nails', nameAr: 'أظافر', nameEn: 'Nails', emoji: '💅' },
];

const DIFFICULTIES = [
  { key: 'beginner', nameAr: 'مبتدئ', nameEn: 'Beginner', color: 'bg-green-100 text-green-700' },
  { key: 'intermediate', nameAr: 'متوسط', nameEn: 'Intermediate', color: 'bg-amber-100 text-amber-700' },
  { key: 'advanced', nameAr: 'متقدم', nameEn: 'Advanced', color: 'bg-red-100 text-red-700' },
];

export const tutorialsRouter = router({
  // List published tutorials with optional filters
  list: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        difficulty: z.string().optional(),
        search: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(12),
      }),
    )
    .query(async ({ input }) => {
      let filtered = TUTORIALS.filter((t) => t.isPublished);
      if (input.category) filtered = filtered.filter((t) => t.category === input.category);
      if (input.difficulty) filtered = filtered.filter((t) => t.difficulty === input.difficulty);
      if (input.search) {
        const q = input.search.toLowerCase();
        filtered = filtered.filter(
          (t) =>
            t.titleAr.includes(q) ||
            t.titleEn.toLowerCase().includes(q) ||
            t.tags.some((tag) => tag.includes(q)),
        );
      }
      const total = filtered.length;
      const start = (input.page - 1) * input.limit;
      return { items: filtered.slice(start, start + input.limit), total, page: input.page };
    }),

  // Get single tutorial by ID
  getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const tutorial = TUTORIALS.find((t) => t.id === input.id && t.isPublished);
    if (!tutorial) throw new Error('الدرس غير موجود');
    return tutorial;
  }),

  // Get categories and difficulties for filters
  filters: publicProcedure.query(() => ({ categories: CATEGORIES, difficulties: DIFFICULTIES })),

  // Admin: create tutorial (placeholder — will persist to DB later)
  create: adminProcedure
    .input(
      z.object({
        titleAr: z.string().min(1),
        titleEn: z.string().min(1),
        descAr: z.string().optional(),
        descEn: z.string().optional(),
        videoUrl: z.string().url(),
        duration: z.string(),
        category: z.string(),
        difficulty: z.string(),
        tags: z.array(z.string()).default([]),
        authorName: z.string(),
        authorTitleAr: z.string().optional(),
        authorTitleEn: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => ({
      id: TUTORIALS.length + 1,
      ...input,
      descAr: input.descAr ?? '',
      descEn: input.descEn ?? '',
      authorTitleAr: input.authorTitleAr ?? '',
      authorTitleEn: input.authorTitleEn ?? '',
      views: 0,
      likes: 0,
      isPublished: true,
      thumbnailUrl: null,
      createdAt: new Date().toISOString(),
    })),
});
